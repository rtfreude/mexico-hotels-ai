/**
 * Enhanced Performance Monitor
 * - Correlation IDs support
 * - Timers/spans with metadata
 * - Simple in-memory histograms and counters
 * - Helper to wrap async operations and automatically time them
 *
 * Note: This is intentionally lightweight and stays dependency-free so it can
 * be used in development. For production, replace/integrate with a metrics
 * backend (Prometheus, Datadog, etc.).
 */

class PerformanceMonitor {
  constructor() {
    // Map<operationId, { startTime, endTime, duration, meta }>
    this.metrics = new Map();

    // Simple counters and histograms
    // counters: Map<name, number>
    this.counters = new Map();
    // histograms: Map<name, [durations]>
    this.histograms = new Map();

    // Optional correlation id for the current request (set by middleware)
    this.currentCorrelationId = null;
  }

  setCorrelationId(correlationId) {
    this.currentCorrelationId = correlationId;
  }

  getCorrelationId() {
    return this.currentCorrelationId;
  }

  _makeKey(operationId) {
    // Include correlation id to make keys unique per request where useful
    const cid = this.currentCorrelationId || 'no-cid';
    return `${cid}::${operationId}`;
  }

  startTimer(operationId, meta = {}) {
    const key = this._makeKey(operationId);
    this.metrics.set(key, {
      operationId,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      meta
    });
  }

  endTimer(operationId) {
    const key = this._makeKey(operationId);
    const metric = this.metrics.get(key);
    if (metric) {
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;

      // Record into histogram
      const histName = operationId;
      if (!this.histograms.has(histName)) this.histograms.set(histName, []);
      this.histograms.get(histName).push(metric.duration);

      // Increment counter
      this.incrementCounter(`${operationId}:count`);

      // Structured console log for debugging
      const cid = this.getCorrelationId();
      console.log(`⏱️  [${cid}] ${operationId}: ${metric.duration}ms`, metric.meta || {});

      return metric.duration;
    }
    return null;
  }

  getMetric(operationId) {
    const key = this._makeKey(operationId);
    return this.metrics.get(key);
  }

  incrementCounter(name, n = 1) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + n);
  }

  getCounter(name) {
    return this.counters.get(name) || 0;
  }

  getHistogram(name) {
    return this.histograms.get(name) || [];
  }

  clearMetrics() {
    this.metrics.clear();
    this.counters.clear();
    this.histograms.clear();
    this.currentCorrelationId = null;
  }

  logSummary() {
    console.log('\n📊 Performance Summary:');
    // Per-request timers
    for (const [key, metric] of this.metrics.entries()) {
      if (metric.duration != null) {
        console.log(`  ${metric.operationId} (${key}): ${metric.duration}ms`);
      }
    }

    // Counters
    if (this.counters.size > 0) {
      console.log('\n🔢 Counters:');
      for (const [name, value] of this.counters.entries()) {
        console.log(`  ${name}: ${value}`);
      }
    }

    // Histograms summary (p50/p90/p99 approximations)
    if (this.histograms.size > 0) {
      console.log('\n📈 Histograms:');
      for (const [name, values] of this.histograms.entries()) {
        if (values.length === 0) continue;
        const sorted = values.slice().sort((a, b) => a - b);
        const p = (p) => sorted[Math.floor((p / 100) * (sorted.length - 1))] || 0;
        console.log(`  ${name} - count: ${values.length}, p50: ${p(50)}ms, p90: ${p(90)}ms, p99: ${p(99)}ms`);
      }
    }
    console.log('');
  }

  async wrapAsync(operationId, fn, meta = {}) {
    try {
      this.startTimer(operationId, meta);
      const result = await fn();
      this.endTimer(operationId);
      return result;
    } catch (err) {
      // Still record the end time for visibility
      this.endTimer(operationId);
      throw err;
    }
  }
}

export default new PerformanceMonitor();
