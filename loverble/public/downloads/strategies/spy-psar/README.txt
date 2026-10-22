SPY Parabolic SAR (ETF rules) — free research pack
Smart Algos Capital · Educational backtest materials

Contents
--------
backtest_spy_psar.py   Local replication of the QC PSAR ETF rules (Python)
backtest_report.json   Structured metrics (IS / OOS / regimes / sensitivity)
backtest_report.txt    Same report in plain text
equity_curves.png      Equity curve figure from the research run

Primary specification (ETF rules)
---------------------------------
Daily SPY bars · Wilder Parabolic SAR (af0=0.01, step=0.01, max=0.2)
Close above SAR → hold SPY (~95% invested); else park in T-bills (SGOV sleeve)
Signal on close, fill next open · ~1 bp/side cost assumption in the local study

Headline QC-window result (2023-01-03 → 2026-07-08, in-sample)
--------------------------------------------------------------
CAGR 15.89% · Vol 8.94% · Sharpe 1.20 · Max DD −6.8% · Calmar 2.34
Trades 28 · Win rate 64.3% · Time in market 65.7%

Important
---------
Parameters were tuned on the QC window. Out-of-sample (1993–2022) is weaker
(Sharpe ~0.32, Max DD ~−31.6%). This is a research pack, not live trading advice,
not a signal feed, and not a verified public QuantConnect listing.

Run locally
-----------
python backtest_spy_psar.py
(Requires pandas, numpy, yfinance)
