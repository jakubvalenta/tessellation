const DEBUG = false;

export function error(...msg) {
  if (DEBUG) {
    console.error(...msg);
  }
}

export function log(...msg) {
  if (DEBUG) {
    console.log(...msg);
  }
}
