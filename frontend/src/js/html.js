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
    // TODO: Error message when failed to load.
    htmlImage.src = url;
  });
}

export function fillCanvas(canvas, ctx, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function canvasToDataUrl(canvas) {
  const dataUrl = canvas.toDataURL('image/png');
  dataUrl.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
  return dataUrl;
}
