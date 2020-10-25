const DEBUG = process.env.NODE_ENV !== 'production';

export function error(...msg) {
  console.error(...msg); // eslint-disable-line no-console
}

export function log(...msg) {
  if (DEBUG) {
    console.log(...msg); // eslint-disable-line no-console
  }
}
