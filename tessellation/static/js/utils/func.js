export function call(a, ...args) {
  a.forEach(func => func(...args));
}
