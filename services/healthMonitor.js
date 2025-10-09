
const os = require('os');

class HealthMonitor {
  constructor() {
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.lastErrors = [];
  }

  recordRequest() {
    this.requestCount++;
  }

  recordError(error) {
    this.errorCount++;
    this.lastErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 errors
    if (this.lastErrors.length > 10) {
      this.lastErrors.shift();
    }
  }

  getHealthStatus() {
    const uptime = Date.now() - this.startTime;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    
    return {
      status: errorRate < 1 ? 'healthy' : errorRate < 5 ? 'degraded' : 'unhealthy',
      uptime: Math.floor(uptime / 1000), // seconds
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: errorRate.toFixed(2) + '%',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        system: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB'
      },
      cpu: {
        usage: process.cpuUsage(),
        load: os.loadavg()
      },
      lastErrors: this.lastErrors.slice(-5)
    };
  }
}

module.exports = new HealthMonitor();
