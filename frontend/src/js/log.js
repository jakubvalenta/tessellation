const DEBUG = false;

export function error(...msg) {
  if (DEBUG) {
    console.error(...msg); // eslint-disable-line no-console
  }
}

export function log(...msg) {
  if (DEBUG) {
    console.log(...msg); // eslint-disable-line no-console
  }
}
