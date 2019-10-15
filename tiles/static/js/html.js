export function clearElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}
