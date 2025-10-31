/**
 * MetaTrader 5 Real API Service
 * Provides live connection to MT5 servers, trade execution, and account data
 * 
 * This service uses the MetaTrader 5 Python API wrapped in Node.js
 * Alternative: Use MT5 Manager API DLL via node-ffi or similar
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class MT5APIService {
  constructor() {
    this.connections = new Map(); // Store active connections
    this.pythonScriptsPath = path.join(__dirname, '..', 'scripts', 'mt5');
    this.ensurePythonScriptsDir();
    
    // Check if MetaTrader5 Python package is available
    this.hasPythonMT5 = this.checkPythonMT5();
    
    if (!this.hasPythonMT5) {
      logger.warn('[MT5 API] Python MetaTrader5 package not found. Install with: pip install MetaTrader5');
    }
  }

  ensurePythonScriptsDir() {
    if (!fs.existsSync(this.pythonScriptsPath)) {
      fs.mkdirSync(this.pythonScriptsPath, { recursive: true });
    }
  }

  checkPythonMT5() {
    try {
      const result = require('child_process').execSync('python -c "import MetaTrader5" 2>&1', { encoding: 'utf-8' });
      return result.length === 0;
    } catch {
      return false;
    }
  }

  /**
   * Connect to MT5 server
   * @param {Object} credentials - { login, password, server, timeout }
   * @returns {Promise<Object>} Connection result with account info
   */
  async connect(credentials) {
    const { login, password, server, timeout = 60000 } = credentials;
    
    if (!login || !password || !server) {
      throw new Error('Login, password, and server are required');
    }

    const connectionKey = `${login}@${server}`;
    
    try {
      // Use Python MT5 API to connect
      const result = await this.executePythonScript('connect.py', {
        login: parseInt(login),
        password,
        server,
        timeout
      });

      if (result.success && result.account) {
        this.connections.set(connectionKey, {
          login: parseInt(login),
          server,
          connected: true,
          connectedAt: new Date(),
          account: result.account
        });

        logger.info(`[MT5 API] Connected to ${server} with login ${login}`);
        return {
          success: true,
          account: result.account,
          connectionKey
        };
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      logger.error(`[MT5 API] Connection error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get account information
   * @param {string} connectionKey - Connection identifier
   * @returns {Promise<Object>} Account data
   */
  async getAccountInfo(connectionKey) {
    if (!this.connections.has(connectionKey)) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      const connection = this.connections.get(connectionKey);
      const result = await this.executePythonScript('account_info.py', {
        login: connection.login,
        server: connection.server
      });

      if (result.success) {
        return result.account;
      } else {
        throw new Error(result.error || 'Failed to get account info');
      }
    } catch (error) {
      logger.error(`[MT5 API] Get account info error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get account balance
   * @param {string} connectionKey - Connection identifier
   * @returns {Promise<number>} Account balance
   */
  async getBalance(connectionKey) {
    const accountInfo = await this.getAccountInfo(connectionKey);
    return accountInfo.balance || 0;
  }

  /**
   * Get account equity
   * @param {string} connectionKey - Connection identifier
   * @returns {Promise<number>} Account equity
   */
  async getEquity(connectionKey) {
    const accountInfo = await this.getAccountInfo(connectionKey);
    return accountInfo.equity || 0;
  }

  /**
   * Get open positions
   * @param {string} connectionKey - Connection identifier
   * @param {string} symbol - Optional symbol filter
   * @returns {Promise<Array>} Open positions
   */
  async getPositions(connectionKey, symbol = null) {
    if (!this.connections.has(connectionKey)) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      const connection = this.connections.get(connectionKey);
      const result = await this.executePythonScript('get_positions.py', {
        login: connection.login,
        server: connection.server,
        symbol
      });

      if (result.success) {
        return result.positions || [];
      } else {
        throw new Error(result.error || 'Failed to get positions');
      }
    } catch (error) {
      logger.error(`[MT5 API] Get positions error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get order history
   * @param {string} connectionKey - Connection identifier
   * @param {Object} filters - { symbol, from, to, group }
   * @returns {Promise<Array>} Order history
   */
  async getOrderHistory(connectionKey, filters = {}) {
    if (!this.connections.has(connectionKey)) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      const connection = this.connections.get(connectionKey);
      const result = await this.executePythonScript('get_history.py', {
        login: connection.login,
        server: connection.server,
        ...filters
      });

      if (result.success) {
        return result.history || [];
      } else {
        throw new Error(result.error || 'Failed to get order history');
      }
    } catch (error) {
      logger.error(`[MT5 API] Get order history error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a market order
   * @param {string} connectionKey - Connection identifier
   * @param {Object} orderParams - { symbol, action, volume, price, sl, tp, comment }
   * @returns {Promise<Object>} Order result
   */
  async placeOrder(connectionKey, orderParams) {
    if (!this.connections.has(connectionKey)) {
      throw new Error('Not connected. Call connect() first.');
    }

    const { symbol, action, volume, price = 0, sl = 0, tp = 0, comment = '' } = orderParams;

    if (!symbol || !action || !volume) {
      throw new Error('Symbol, action (BUY/SELL), and volume are required');
    }

    try {
      const connection = this.connections.get(connectionKey);
      const result = await this.executePythonScript('place_order.py', {
        login: connection.login,
        server: connection.server,
        symbol,
        action: action.toUpperCase(),
        volume: parseFloat(volume),
        price: parseFloat(price),
        sl: parseFloat(sl),
        tp: parseFloat(tp),
        comment
      });

      if (result.success) {
        logger.info(`[MT5 API] Order placed: ${action} ${volume} ${symbol}`);
        return result.order;
      } else {
        throw new Error(result.error || 'Failed to place order');
      }
    } catch (error) {
      logger.error(`[MT5 API] Place order error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Close a position
   * @param {string} connectionKey - Connection identifier
   * @param {number} ticket - Position ticket
   * @returns {Promise<Object>} Close result
   */
  async closePosition(connectionKey, ticket) {
    if (!this.connections.has(connectionKey)) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      const connection = this.connections.get(connectionKey);
      const result = await this.executePythonScript('close_position.py', {
        login: connection.login,
        server: connection.server,
        ticket: parseInt(ticket)
      });

      if (result.success) {
        logger.info(`[MT5 API] Position ${ticket} closed`);
        return result.result;
      } else {
        throw new Error(result.error || 'Failed to close position');
      }
    } catch (error) {
      logger.error(`[MT5 API] Close position error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get symbol information
   * @param {string} connectionKey - Connection identifier
   * @param {string} symbol - Symbol name (e.g., 'EURUSD')
   * @returns {Promise<Object>} Symbol info
   */
  async getSymbolInfo(connectionKey, symbol) {
    if (!this.connections.has(connectionKey)) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      const connection = this.connections.get(connectionKey);
      const result = await this.executePythonScript('symbol_info.py', {
        login: connection.login,
        server: connection.server,
        symbol
      });

      if (result.success) {
        return result.symbolInfo;
      } else {
        throw new Error(result.error || 'Symbol not found');
      }
    } catch (error) {
      logger.error(`[MT5 API] Get symbol info error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current market price (bid/ask)
   * @param {string} connectionKey - Connection identifier
   * @param {string} symbol - Symbol name
   * @returns {Promise<Object>} { bid, ask, spread }
   */
  async getMarketPrice(connectionKey, symbol) {
    if (!this.connections.has(connectionKey)) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      const connection = this.connections.get(connectionKey);
      const result = await this.executePythonScript('market_price.py', {
        login: connection.login,
        server: connection.server,
        symbol
      });

      if (result.success) {
        return result.price;
      } else {
        throw new Error(result.error || 'Failed to get market price');
      }
    } catch (error) {
      logger.error(`[MT5 API] Get market price error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Disconnect from MT5 server
   * @param {string} connectionKey - Connection identifier
   */
  async disconnect(connectionKey) {
    if (!this.connections.has(connectionKey)) {
      return;
    }

    try {
      const connection = this.connections.get(connectionKey);
      await this.executePythonScript('disconnect.py', {
        login: connection.login,
        server: connection.server
      });

      this.connections.delete(connectionKey);
      logger.info(`[MT5 API] Disconnected from ${connection.server}`);
    } catch (error) {
      logger.error(`[MT5 API] Disconnect error: ${error.message}`);
      // Force remove from connections map
      this.connections.delete(connectionKey);
    }
  }

  /**
   * Execute Python script for MT5 operations
   * @private
   */
  async executePythonScript(scriptName, params) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(this.pythonScriptsPath, scriptName);
      
      // Create script if it doesn't exist
      if (!fs.existsSync(scriptPath)) {
        this.createPythonScript(scriptName);
      }

      const pythonProcess = spawn('python', [scriptPath, JSON.stringify(params)]);
      
      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(stderr || `Python script failed with code ${code}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${stdout}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Python script timeout'));
      }, 60000);
    });
  }

  /**
   * Create Python script files for MT5 operations
   * @private
   */
  createPythonScript(scriptName) {
    const scripts = {
      'connect.py': `
import sys
import json
import MetaTrader5 as mt5

try:
    params = json.loads(sys.argv[1])
    login = params['login']
    password = params['password']
    server = params['server']
    timeout = params.get('timeout', 60000)
    
    if not mt5.initialize():
        print(json.dumps({"success": False, "error": "MT5 initialization failed"}))
        sys.exit(1)
    
    authorized = mt5.login(login, password=password, server=server, timeout=timeout)
    if not authorized:
        print(json.dumps({"success": False, "error": f"Authorization failed: {mt5.last_error()}"}))
        mt5.shutdown()
        sys.exit(1)
    
    account_info = mt5.account_info()
    if account_info is None:
        print(json.dumps({"success": False, "error": "Failed to get account info"}))
        mt5.shutdown()
        sys.exit(1)
    
    account_data = {
        "login": account_info.login,
        "balance": account_info.balance,
        "equity": account_info.equity,
        "margin": account_info.margin,
        "free_margin": account_info.margin_free,
        "margin_level": account_info.margin_level,
        "currency": account_info.currency,
        "leverage": account_info.leverage,
        "server": account_info.server,
        "company": account_info.company
    }
    
    print(json.dumps({"success": True, "account": account_data}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)
`,

      'account_info.py': `
import sys
import json
import MetaTrader5 as mt5

try:
    params = json.loads(sys.argv[1])
    login = params['login']
    server = params['server']
    
    if not mt5.initialize():
        print(json.dumps({"success": False, "error": "MT5 initialization failed"}))
        sys.exit(1)
    
    account_info = mt5.account_info()
    if account_info is None:
        print(json.dumps({"success": False, "error": "Failed to get account info"}))
        mt5.shutdown()
        sys.exit(1)
    
    account_data = {
        "login": account_info.login,
        "balance": account_info.balance,
        "equity": account_info.equity,
        "margin": account_info.margin,
        "free_margin": account_info.margin_free,
        "margin_level": account_info.margin_level,
        "currency": account_info.currency,
        "leverage": account_info.leverage,
        "server": account_info.server,
        "company": account_info.company,
        "profit": account_info.profit
    }
    
    print(json.dumps({"success": True, "account": account_data}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)
finally:
    mt5.shutdown()
`,

      'get_positions.py': `
import sys
import json
import MetaTrader5 as mt5

try:
    params = json.loads(sys.argv[1])
    login = params['login']
    server = params['server']
    symbol = params.get('symbol')
    
    if not mt5.initialize():
        print(json.dumps({"success": False, "error": "MT5 initialization failed"}))
        sys.exit(1)
    
    if symbol:
        positions = mt5.positions_get(symbol=symbol)
    else:
        positions = mt5.positions_get()
    
    if positions is None:
        print(json.dumps({"success": True, "positions": []}))
        sys.exit(0)
    
    positions_data = []
    for pos in positions:
        positions_data.append({
            "ticket": pos.ticket,
            "symbol": pos.symbol,
            "type": pos.type,
            "volume": pos.volume,
            "price_open": pos.price_open,
            "price_current": pos.price_current,
            "profit": pos.profit,
            "swap": pos.swap,
            "time": pos.time,
            "comment": pos.comment
        })
    
    print(json.dumps({"success": True, "positions": positions_data}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)
finally:
    mt5.shutdown()
`,

      'place_order.py': `
import sys
import json
import MetaTrader5 as mt5

try:
    params = json.loads(sys.argv[1])
    login = params['login']
    server = params['server']
    symbol = params['symbol']
    action = params['action']  # BUY or SELL
    volume = params['volume']
    price = params.get('price', 0)
    sl = params.get('sl', 0)
    tp = params.get('tp', 0)
    comment = params.get('comment', '')
    
    if not mt5.initialize():
        print(json.dumps({"success": False, "error": "MT5 initialization failed"}))
        sys.exit(1)
    
    symbol_info = mt5.symbol_info(symbol)
    if symbol_info is None:
        print(json.dumps({"success": False, "error": f"Symbol {symbol} not found"}))
        mt5.shutdown()
        sys.exit(1)
    
    if not symbol_info.visible:
        if not mt5.symbol_select(symbol, True):
            print(json.dumps({"success": False, "error": f"Symbol {symbol} not available"}))
            mt5.shutdown()
            sys.exit(1)
    
    point = symbol_info.point
    if action == "BUY":
        order_type = mt5.ORDER_TYPE_BUY
        if price == 0:
            price = mt5.symbol_info_tick(symbol).ask
    else:  # SELL
        order_type = mt5.ORDER_TYPE_SELL
        if price == 0:
            price = mt5.symbol_info_tick(symbol).bid
    
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": volume,
        "type": order_type,
        "price": price,
        "deviation": 20,
        "magic": 234000,
        "comment": comment,
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }
    
    if sl > 0:
        request["sl"] = sl
    if tp > 0:
        request["tp"] = tp
    
    result = mt5.order_send(request)
    
    if result is None:
        print(json.dumps({"success": False, "error": "Order send failed"}))
        mt5.shutdown()
        sys.exit(1)
    
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(json.dumps({"success": False, "error": f"Order failed: {result.comment}"}))
        mt5.shutdown()
        sys.exit(1)
    
    order_data = {
        "ticket": result.order,
        "volume": result.volume,
        "price": result.price,
        "comment": result.comment,
        "retcode": result.retcode
    }
    
    print(json.dumps({"success": True, "order": order_data}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)
finally:
    mt5.shutdown()
`,

      'close_position.py': `
import sys
import json
import MetaTrader5 as mt5

try:
    params = json.loads(sys.argv[1])
    login = params['login']
    server = params['server']
    ticket = params['ticket']
    
    if not mt5.initialize():
        print(json.dumps({"success": False, "error": "MT5 initialization failed"}))
        sys.exit(1)
    
    position = mt5.positions_get(ticket=ticket)
    if position is None or len(position) == 0:
        print(json.dumps({"success": False, "error": "Position not found"}))
        mt5.shutdown()
        sys.exit(1)
    
    pos = position[0]
    symbol = pos.symbol
    volume = pos.volume
    order_type = mt5.ORDER_TYPE_SELL if pos.type == mt5.ORDER_TYPE_BUY else mt5.ORDER_TYPE_BUY
    
    symbol_info = mt5.symbol_info(symbol)
    if symbol_info is None:
        print(json.dumps({"success": False, "error": f"Symbol {symbol} not found"}))
        mt5.shutdown()
        sys.exit(1)
    
    tick = mt5.symbol_info_tick(symbol)
    price = tick.bid if order_type == mt5.ORDER_TYPE_SELL else tick.ask
    
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": volume,
        "type": order_type,
        "position": ticket,
        "price": price,
        "deviation": 20,
        "magic": 234000,
        "comment": "Close position",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }
    
    result = mt5.order_send(request)
    
    if result is None:
        print(json.dumps({"success": False, "error": "Close order failed"}))
        mt5.shutdown()
        sys.exit(1)
    
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(json.dumps({"success": False, "error": f"Close failed: {result.comment}"}))
        mt5.shutdown()
        sys.exit(1)
    
    print(json.dumps({"success": True, "result": {"ticket": result.order, "volume": result.volume}}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)
finally:
    mt5.shutdown()
`,

      'get_history.py': `
import sys
import json
import MetaTrader5 as mt5
from datetime import datetime

try:
    params = json.loads(sys.argv[1])
    login = params['login']
    server = params['server']
    symbol = params.get('symbol')
    group = params.get('group')
    from_date = params.get('from')
    to_date = params.get('to')
    
    if not mt5.initialize():
        print(json.dumps({"success": False, "error": "MT5 initialization failed"}))
        sys.exit(1)
    
    date_from = datetime.strptime(from_date, "%Y-%m-%d") if from_date else None
    date_to = datetime.strptime(to_date, "%Y-%m-%d") if to_date else None
    
    deals = mt5.history_deals_get(date_from, date_to, group=group)
    if deals is None:
        print(json.dumps({"success": True, "history": []}))
        sys.exit(0)
    
    history_data = []
    for deal in deals:
        if symbol and deal.symbol != symbol:
            continue
        history_data.append({
            "ticket": deal.ticket,
            "order": deal.order,
            "symbol": deal.symbol,
            "type": deal.type,
            "entry": deal.entry,
            "volume": deal.volume,
            "price": deal.price,
            "profit": deal.profit,
            "time": deal.time,
            "comment": deal.comment
        })
    
    print(json.dumps({"success": True, "history": history_data}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)
finally:
    mt5.shutdown()
`,

      'symbol_info.py': `
import sys
import json
import MetaTrader5 as mt5

try:
    params = json.loads(sys.argv[1])
    login = params['login']
    server = params['server']
    symbol = params['symbol']
    
    if not mt5.initialize():
        print(json.dumps({"success": False, "error": "MT5 initialization failed"}))
        sys.exit(1)
    
    symbol_info = mt5.symbol_info(symbol)
    if symbol_info is None:
        print(json.dumps({"success": False, "error": f"Symbol {symbol} not found"}))
        mt5.shutdown()
        sys.exit(1)
    
    tick = mt5.symbol_info_tick(symbol)
    
    symbol_data = {
        "name": symbol_info.name,
        "description": symbol_info.description,
        "currency_base": symbol_info.currency_base,
        "currency_profit": symbol_info.currency_profit,
        "point": symbol_info.point,
        "digits": symbol_info.digits,
        "trade_mode": symbol_info.trade_mode,
        "bid": tick.bid if tick else 0,
        "ask": tick.ask if tick else 0,
        "spread": (tick.ask - tick.bid) if tick else 0
    }
    
    print(json.dumps({"success": True, "symbolInfo": symbol_data}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)
finally:
    mt5.shutdown()
`,

      'market_price.py': `
import sys
import json
import MetaTrader5 as mt5

try:
    params = json.loads(sys.argv[1])
    login = params['login']
    server = params['server']
    symbol = params['symbol']
    
    if not mt5.initialize():
        print(json.dumps({"success": False, "error": "MT5 initialization failed"}))
        sys.exit(1)
    
    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        print(json.dumps({"success": False, "error": f"Symbol {symbol} not found"}))
        mt5.shutdown()
        sys.exit(1)
    
    price_data = {
        "bid": tick.bid,
        "ask": tick.ask,
        "spread": tick.ask - tick.bid,
        "time": tick.time,
        "volume": tick.volume
    }
    
    print(json.dumps({"success": True, "price": price_data}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)
finally:
    mt5.shutdown()
`,

      'disconnect.py': `
import sys
import json
import MetaTrader5 as mt5

try:
    params = json.loads(sys.argv[1])
    login = params['login']
    server = params['server']
    
    mt5.shutdown()
    print(json.dumps({"success": True}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
    sys.exit(1)
`
    };

    if (scripts[scriptName]) {
      const scriptPath = path.join(this.pythonScriptsPath, scriptName);
      fs.writeFileSync(scriptPath, scripts[scriptName]);
    }
  }
}

module.exports = new MT5APIService();

