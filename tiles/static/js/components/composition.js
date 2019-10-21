import * as CompositionLib from '../composition.js';
import * as HTML from '../html.js';
import * as State from '../state.js';
import * as Tile from './tile.js';

function renderCompositionOverlay(composition, elOverlay, tileSize) {
  HTML.clearElement(elOverlay);
  composition.forEach(rowTiles => {
    const elRow = document.createElement('div');
    elRow.className = 'row';
    rowTiles.forEach(tile => elRow.appendChild(Tile.createTileElement(tile)));
    elOverlay.appendChild(elRow);
  });
}

function renderCompositionOnCanvas(
  elContainer,
  canvas,
  composition,
  width,
  height
) {
  canvas.width = 0;
  canvas.height = 0;
  const containerWidth = elContainer.clientWidth;
  const tileSize = Math.round(containerWidth / width);
  canvas.width = width * tileSize;
  canvas.height = height * tileSize;
  var ctx = canvas.getContext('2d');
  HTML.fillCanvas(canvas, ctx, '#fff');
  composition.forEach((rowTiles, row) => {
    rowTiles.forEach((tile, col) => {
      if (!tile.image.htmlImage) {
        return;
      }
      tile.image.htmlImage.width = tileSize;
      tile.image.htmlImage.height = tileSize;
      HTML.drawRotatedImage(
        canvas,
        ctx,
        tile.image.htmlImage,
        col * tileSize,
        row * tileSize,
        -(tile.rotation / 2) * Math.PI
      );
    });
  });
}

function bindDownloadEvents(canvas) {
  const elButton = document.getElementById('js-download');
  elButton.addEventListener(
    'click',
    evt => {
      evt.target.href = HTML.canvasToDataUrl(canvas);
    },
    false
  );
}

export default function Composition(state) {
  const elContainer = document.getElementById('js-composition-container');
  const canvas = document.getElementById('js-composition-canvas');
  const elOverlay = document.getElementById('js-composition-overlay');
  State.registerImagesChangedCallback(state, state => {
    const newTiles = CompositionLib.generateTiles(state.images);
    State.setTiles(state, newTiles);
  });
  State.registerTilesChangedCallback(state, state => {
    const composition = CompositionLib.generateComposition(state.tiles, [
      state.size.width,
      state.size.height
    ]);
    window.setTimeout(() => {
      renderCompositionOnCanvas(
        elContainer,
        canvas,
        composition,
        state.size.width,
        state.size.height
      );
      renderCompositionOverlay(composition, elOverlay);
    }, 100); // TODO: wait for images
  });
  bindDownloadEvents(canvas);
}
