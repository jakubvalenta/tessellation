export function clearElement(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export function createHtmlImage(url) {
  return new Promise(resolve => {
    const htmlImage = new window.Image();
    htmlImage.addEventListener(
      'load',
      () => {
        resolve(htmlImage);
      },
      false
    );
    htmlImage.src = url;
  });
}

export function fillCanvas(canvas, ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawRotatedImage(canvas, ctx, image, x, y, rad) {
  ctx.save();
  ctx.translate(x + image.width / 2, y + image.height / 2);
  ctx.rotate(rad);
  ctx.translate(-(x + image.width / 2), -(y + image.height / 2));
  ctx.drawImage(image, x, y, image.width, image.height);
  ctx.restore();
}

export function canvasToDataUrl(canvas) {
  const dataUrl = canvas.toDataURL('image/png');
  dataUrl.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
  return dataUrl;
}

export function setBackgroundImage(el, url) {
  el.style.backgroundImage = `url('${url}')`;
}

export function createTableCell(elRow) {
  const elCell = document.createElement('td');
  elRow.appendChild(elCell);
  return elCell;
}

export function createLink(href, text) {
  const elLink = document.createElement('a');
  elLink.href = href;
  elLink.textContent = text;
  return elLink;
}
