const NodeCache = require('node-cache')

class Cache {

  constructor(ttlSeconds) {
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
  }

  async get(key, storeFunction) {
    const value = this.cache.get(key);
    if (value) {
      return Promise.resolve(value);
    }

    return storeFunction().then((result) => {
      this.cache.set(key, result);
      return result;
    });
  }

  async del(keys) {
    this.cache.del(keys);
  }

  async delStartWith(startStr = '') {
    if (!startStr) {
      return;
    }

    const keys = this.cache.keys();
    for (const key of keys) {
      if (key.indexOf(startStr) === 0) {
        this.del(key);
      }
    }
  }

  async flush() {
    this.cache.flushAll();
  }
}


module.exports = Cache;