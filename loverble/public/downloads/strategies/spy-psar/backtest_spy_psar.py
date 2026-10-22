"""SPY Parabolic SAR trend filter (QuantConnect "SPY Strategy.txt") — local replication + robustness.

Rules (as in the QC algo): daily SPY bars, PSAR(af_initial, af_step, af_max).
Close above SAR -> hold SPY, else park in T-bills (SGOV). Signal on close, fill next open.

Variants tested:
  etf      : QC-faithful — 95% invested (5% free buffer), cash sleeve earns T-bill yield.
  cfd      : how our MT5 desk would hold it — US500 cash CFD, long or flat, pays long
             financing (T-bill + markup) per calendar day, flat earns nothing, spread per flip.
  desk     : CFD + house sizing — risk R% of equity to the SAR stop at entry (Book A/C 1%,
             Book B 0.75%), notional capped at max_lev.

Run:  python backtest_spy_psar.py
"""

from __future__ import annotations

import itertools
import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd
import yfinance as yf

HERE = Path(__file__).resolve().parent
TRADING_DAYS = 252


def load_data(refresh: bool = False) -> pd.DataFrame:
    cache = HERE / "spy_daily_adj.pkl"
    if cache.exists() and not refresh:
        return pd.read_pickle(cache)
    spy = yf.download("SPY", start="1993-01-01", auto_adjust=True, progress=False)
    spy.columns = [c[0] if isinstance(c, tuple) else c for c in spy.columns]
    aux = yf.download(["SGOV", "^IRX"], start="1993-01-01", auto_adjust=True, progress=False)["Close"]
    df = spy[["Open", "High", "Low", "Close"]].copy()
    df["irx"] = aux["^IRX"].reindex(df.index).ffill() / 100.0
    df["sgov"] = aux["SGOV"].reindex(df.index)
    df = df.dropna(subset=["Open", "High", "Low", "Close", "irx"])
    df.to_pickle(cache)
    return df


def psar(high: np.ndarray, low: np.ndarray, af0: float, step: float, af_max: float) -> np.ndarray:
    """Wilder Parabolic SAR. Returns SAR value for each bar (computed through that bar)."""
    n = len(high)
    sar = np.full(n, np.nan)
    if n < 3:
        return sar
    up = high[1] >= high[0]
    ep = high[1] if up else low[1]
    cur = low[0] if up else high[0]
    af = af0
    sar[1] = cur
    for i in range(2, n):
        nxt = cur + af * (ep - cur)
        if up:
            nxt = min(nxt, low[i - 1], low[i - 2])
            if low[i] < nxt:
                up, nxt, ep, af = False, ep, low[i], af0
            elif high[i] > ep:
                ep, af = high[i], min(af + step, af_max)
        else:
            nxt = max(nxt, high[i - 1], high[i - 2])
            if high[i] > nxt:
                up, nxt, ep, af = True, ep, high[i], af0
            elif low[i] < ep:
                ep, af = low[i], min(af + step, af_max)
        cur = nxt
        sar[i] = cur
    return sar


@dataclass
class Cfg:
    af0: float = 0.01
    step: float = 0.01
    af_max: float = 0.2
    mode: str = "etf"            # etf | cfd | desk
    invest: float = 0.95         # QC free_portfolio_value_percentage=0.05
    etf_cost_bps: float = 1.0    # per side, slippage + fees
    cfd_spread_bps: float = 1.5  # ~0.8pt on US500 near 5500, per side
    cfd_markup: float = 0.025    # long financing = T-bill + 2.5%/yr (typical MT5 index CFD)
    risk_pct: float = 1.0        # desk mode: % equity risked to the SAR stop at entry
    max_lev: float = 1.0         # desk mode: notional cap as multiple of equity


def run(df: pd.DataFrame, cfg: Cfg) -> pd.DataFrame:
    o, h, l, c = (df[k].to_numpy(float) for k in ("Open", "High", "Low", "Close"))
    irx = df["irx"].to_numpy(float)
    sar = psar(h, l, cfg.af0, cfg.step, cfg.af_max)
    signal = np.where(np.isnan(sar), 0, (c > sar).astype(int))
    cal_days = np.r_[1, np.diff(df.index.values).astype("timedelta64[D]").astype(int)]

    n = len(df)
    ret = np.zeros(n)
    expo = np.zeros(n)
    pos = 0
    w = 0.0
    entry_px = 0.0
    trades = []
    for t in range(1, n):
        target = signal[t - 1]
        cash_r = irx[t - 1] * cal_days[t] / 365.0
        r = 0.0
        if target != pos:
            if target == 1:
                if cfg.mode == "desk":
                    dist = max((o[t] - sar[t - 1]) / o[t], 0.005)
                    w = min(cfg.max_lev, (cfg.risk_pct / 100.0) / dist)
                else:
                    w = cfg.invest if cfg.mode == "etf" else 1.0
                entry_px = o[t]
                cost = cfg.etf_cost_bps if cfg.mode == "etf" else cfg.cfd_spread_bps
                r += w * (c[t] / o[t] - 1) - w * cost / 1e4
                if cfg.mode == "etf":
                    r += cfg.invest * cash_r
            else:
                cost = cfg.etf_cost_bps if cfg.mode == "etf" else cfg.cfd_spread_bps
                r += w * (o[t] / c[t - 1] - 1) - w * cost / 1e4
                trades.append(o[t] / entry_px - 1)
                if cfg.mode == "etf":
                    r += cfg.invest * irx[t - 1] / 365.0
                w_exit = w
                w = 0.0
                if cfg.mode != "etf":
                    r -= w_exit * (irx[t - 1] + cfg.cfd_markup) * cal_days[t] / 365.0
            pos = target
        elif pos == 1:
            r += w * (c[t] / c[t - 1] - 1)
            if cfg.mode != "etf":
                r -= w * (irx[t - 1] + cfg.cfd_markup) * cal_days[t] / 365.0
        else:
            if cfg.mode == "etf":
                r += cfg.invest * cash_r
        ret[t] = r
        expo[t] = w if pos == 1 else 0.0
    out = pd.DataFrame({"ret": ret, "expo": expo, "signal": signal, "sar": sar}, index=df.index)
    out.attrs["trades"] = trades
    return out


def buy_hold(df: pd.DataFrame) -> pd.Series:
    return df["Close"].pct_change().fillna(0.0)


def stats(ret: pd.Series, irx: pd.Series, trades: list | None = None, expo: pd.Series | None = None) -> dict:
    ret = ret.dropna()
    eq = (1 + ret).cumprod()
    years = (ret.index[-1] - ret.index[0]).days / 365.25
    cagr = eq.iloc[-1] ** (1 / years) - 1 if years > 0 else np.nan
    vol = ret.std() * np.sqrt(TRADING_DAYS)
    rf = irx.reindex(ret.index).ffill() / TRADING_DAYS
    ex = ret - rf
    sharpe = ex.mean() / ex.std() * np.sqrt(TRADING_DAYS) if ex.std() > 0 else np.nan
    dd = (eq / eq.cummax() - 1).min()
    d = {
        "CAGR%": round(cagr * 100, 2),
        "Vol%": round(vol * 100, 2),
        "Sharpe": round(sharpe, 2),
        "MaxDD%": round(dd * 100, 2),
        "Calmar": round(cagr / abs(dd), 2) if dd < 0 else np.nan,
    }
    if trades is not None:
        tr = np.array(trades)
        d.update({
            "Trades": len(tr),
            "Trades/yr": round(len(tr) / years, 1) if years else np.nan,
            "Win%": round((tr > 0).mean() * 100, 1) if len(tr) else np.nan,
            "AvgWin%": round(tr[tr > 0].mean() * 100, 2) if (tr > 0).any() else np.nan,
            "AvgLoss%": round(tr[tr <= 0].mean() * 100, 2) if (tr <= 0).any() else np.nan,
        })
    if expo is not None:
        d["TimeIn%"] = round((expo.reindex(ret.index) > 0).mean() * 100, 1)
        live = expo.reindex(ret.index)
        d["AvgNotional"] = round(live[live > 0].mean(), 2) if (live > 0).any() else 0.0
    return d


def trades_in(df: pd.DataFrame, res: pd.DataFrame, start: str, end: str | None) -> list:
    """Round-trip SPY trades whose exit falls in [start, end]; entry/exit at next open."""
    sig = res["signal"].to_numpy()
    o = df["Open"].to_numpy()
    idx = res.index
    out, entry = [], None
    for t in range(1, len(sig)):
        if sig[t - 1] == 1 and entry is None:
            entry = o[t]
        elif sig[t - 1] == 0 and entry is not None:
            if idx[t] >= pd.Timestamp(start) and (end is None or idx[t] <= pd.Timestamp(end)):
                out.append(o[t] / entry - 1)
            entry = None
    return out


def fmt(rows: dict) -> str:
    return pd.DataFrame(rows).T.to_string()


def main() -> None:
    df = load_data()
    irx = df["irx"]
    report: dict = {}
    lines: list[str] = []

    def section(title: str, rows: dict) -> None:
        lines.append(f"\n=== {title} ===\n{fmt(rows)}")
        report[title] = rows

    # Warm-up: start the PSAR well before every evaluation window.
    windows = {
        "QC window 2023-01-03..2026-07-08 (in-sample, params tuned here)": ("2023-01-03", "2026-07-08"),
        "Out-of-sample 1993-2022": ("1993-03-01", "2022-12-31"),
        "Full 1993-2026": ("1993-03-01", None),
        "2000-2009 (two bear markets)": ("2000-01-01", "2009-12-31"),
        "2010-2019 (bull)": ("2010-01-01", "2019-12-31"),
        "2020-2022 (covid + 2022 bear)": ("2020-01-01", "2022-12-31"),
    }
    base = {
        "PSAR ETF (QC rules)": Cfg(mode="etf"),
        "PSAR US500 CFD 100% notional": Cfg(mode="cfd"),
        "PSAR CFD desk 1% risk (Book A/C), cap 1x": Cfg(mode="desk", risk_pct=1.0, max_lev=1.0),
        "PSAR CFD desk 0.75% risk (Book B), cap 1x": Cfg(mode="desk", risk_pct=0.75, max_lev=1.0),
        "PSAR CFD desk 1% risk, cap 3x": Cfg(mode="desk", risk_pct=1.0, max_lev=3.0),
    }
    runs = {k: run(df, v) for k, v in base.items()}
    for title, (s, e) in windows.items():
        rows = {}
        m = (df.index >= s) & ((df.index <= e) if e else True)
        rows["SPY buy & hold"] = stats(buy_hold(df).loc[m], irx)
        for k, res in runs.items():
            sub = res.loc[m]
            rows[k] = stats(sub["ret"], irx, trades_in(df, res, s, e), sub["expo"])
        section(title, rows)

    # Parameter sensitivity: in-sample vs out-of-sample Sharpe.
    grid_rows = {}
    for af0, step, amax in itertools.product([0.01, 0.02], [0.005, 0.01, 0.02], [0.1, 0.2]):
        res = run(df, Cfg(af0=af0, step=step, af_max=amax, mode="etf"))
        ins = res.loc["2023-01-03":"2026-07-08"]
        oos = res.loc["1993-03-01":"2022-12-31"]
        grid_rows[f"af0={af0} step={step} max={amax}"] = {
            "IS Sharpe": stats(ins["ret"], irx)["Sharpe"],
            "IS CAGR%": stats(ins["ret"], irx)["CAGR%"],
            "OOS Sharpe": stats(oos["ret"], irx)["Sharpe"],
            "OOS CAGR%": stats(oos["ret"], irx)["CAGR%"],
            "OOS MaxDD%": stats(oos["ret"], irx)["MaxDD%"],
            "OOS trades/yr": round(len(trades_in(df, res, "1993-03-01", "2022-12-31")) / 29.8, 1),
        }
    oos_bh = buy_hold(df).loc["1993-03-01":"2022-12-31"]
    grid_rows["SPY buy & hold"] = {
        "IS Sharpe": stats(buy_hold(df).loc["2023-01-03":"2026-07-08"], irx)["Sharpe"],
        "IS CAGR%": stats(buy_hold(df).loc["2023-01-03":"2026-07-08"], irx)["CAGR%"],
        "OOS Sharpe": stats(oos_bh, irx)["Sharpe"],
        "OOS CAGR%": stats(oos_bh, irx)["CAGR%"],
        "OOS MaxDD%": stats(oos_bh, irx)["MaxDD%"],
        "OOS trades/yr": 0,
    }
    section("Parameter sensitivity (ETF rules)", grid_rows)

    # Benchmark trend filter for context: classic 200-day SMA, same execution.
    sma = df["Close"].rolling(200).mean()
    sig = (df["Close"] > sma).astype(int).shift(1).fillna(0)
    r_sma = sig * df["Close"].pct_change().fillna(0) * 0.95 + (1 - sig) * 0.95 * df["irx"].shift(1).fillna(0) / TRADING_DAYS
    rows = {
        "200d SMA filter, OOS 1993-2022": stats(r_sma.loc["1993-12-01":"2022-12-31"], irx),
        "200d SMA filter, QC window": stats(r_sma.loc["2023-01-03":"2026-07-08"], irx),
    }
    section("Reference: 200-day SMA filter (ETF)", rows)

    # Current state of the signal.
    last = runs["PSAR ETF (QC rules)"].iloc[-1]
    state = {
        "date": str(df.index[-1].date()),
        "close": round(float(df["Close"].iloc[-1]), 2),
        "sar": round(float(last["sar"]), 2),
        "signal": "LONG SPY" if last["signal"] == 1 else "FLAT / T-bills",
        "stop_distance_%": round((float(df["Close"].iloc[-1]) - float(last["sar"])) / float(df["Close"].iloc[-1]) * 100, 2),
    }
    lines.append(f"\n=== Current signal ===\n{json.dumps(state, indent=2)}")
    report["current_signal"] = state

    text = "\n".join(lines)
    print(text)
    (HERE / "backtest_report.txt").write_text(text, encoding="utf-8")
    (HERE / "backtest_report.json").write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")

    # Equity curves for the QC window and full history.
    try:
        import matplotlib

        matplotlib.use("Agg")
        import matplotlib.pyplot as plt

        fig, axes = plt.subplots(2, 1, figsize=(12, 9))
        for ax, (s, e, title) in zip(axes, [("2023-01-03", "2026-07-08", "QC window 2023-2026"),
                                            ("1993-03-01", None, "Full history 1993-2026 (log)")]):
            m = (df.index >= s) & ((df.index <= e) if e else True)
            (1 + buy_hold(df).loc[m]).cumprod().plot(ax=ax, label="SPY buy & hold", color="grey")
            for k in ("PSAR ETF (QC rules)", "PSAR US500 CFD 100% notional", "PSAR CFD desk 1% risk (Book A/C), cap 1x"):
                (1 + runs[k]["ret"].loc[m]).cumprod().plot(ax=ax, label=k)
            if e is None:
                ax.set_yscale("log")
            ax.set_title(title)
            ax.legend(fontsize=8)
            ax.grid(alpha=0.3)
        fig.tight_layout()
        fig.savefig(HERE / "equity_curves.png", dpi=110)
    except Exception as exc:  # plotting is optional
        print("plot skipped:", exc)


if __name__ == "__main__":
    main()
