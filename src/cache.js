let cache = new WeakMap();

export const templateCache = {
  has(templateParts) {
    return cache.has(templateParts);
  },

  set(templateParts, values) {
    return cache.set(templateParts, values);
  },

  get(templateParts) {
    return cache.get(templateParts);
  },

  clear() {
    cache = new WeakMap();
  },
};
