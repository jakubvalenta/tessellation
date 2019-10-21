export function clearElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function createHtmlImage(url) {
  const htmlImage = new Image();
  htmlImage.src = url;
  return htmlImage;
}
