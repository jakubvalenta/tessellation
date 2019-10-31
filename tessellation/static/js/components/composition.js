import * as CompositionLib from '../composition.js';
import * as HTML from '../html.js';
import * as State from '../state.js';
import * as Tile from './tile.js';
import { error, log } from '../log.js';

const MAX_NATURAL_TILE_SIZE = 500;

function getNaturalFirstImageWidth(images) {
  if (images) {
    let i, image;
    for (i = 0; i < images.length; i++) {
      image = images[i];
      if (image.htmlImage) {
        return Math.min(image.htmlImage.naturalWidth, MAX_NATURAL_TILE_SIZE);
      }
    }
  }
  return null;
}

function renderCompositionOverlay(composition, elOverlay, tileSize) {
  HTML.clearElement(elOverlay);
  composition.forEach(rowTiles => {
    const elRow = document.createElement('div');
    elRow.className = 'row';
    rowTiles.forEach(tile => elRow.appendChild(Tile.createTileElement(tile)));
    elOverlay.appendChild(elRow);
  });
}

function calcTileSize(composition, canvas, elContainer) {
  if (!composition) {
    return 0;
  }
  const width = composition[0].length;
  canvas.width = 0;
  canvas.height = 0;
  const tileSize = Math.round(elContainer.clientWidth / width);
  return tileSize;
}

function renderCompositionOnCanvas(composition, canvas, tileSize) {
  const ctx = canvas.getContext('2d');
  if (!composition || !composition.length) {
    HTML.fillCanvas(canvas, ctx, '#fff');
    return;
  }
  const width = composition[0].length;
  const height = composition.length;
  canvas.width = width * tileSize;
  canvas.height = height * tileSize;
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

function bindDownloadEvents(localState) {
  const elButton = document.getElementById('js-download');
  elButton.addEventListener(
    'click',
    evt => {
      const { composition, naturalTileSize } = localState;
      if (!composition || !composition.length || !naturalTileSize) {
        return;
      }
      const canvas = document.createElement('canvas');
      log(`Rendering composition to download, tileSize=${naturalTileSize}`);
      renderCompositionOnCanvas(composition, canvas, naturalTileSize);
      evt.target.href = HTML.canvasToDataUrl(canvas);
    },
    false
  );
}

export default function Composition(state) {
  const localState = {
    composition: null,
    naturalFirstTileWidth: null
  };
  const elContainer = document.getElementById('js-composition-container');
  const canvas = document.getElementById('js-composition-canvas');
  const elOverlay = document.getElementById('js-composition-overlay');
  State.registerImagesChangedCallback(state, state => {
    const newTiles = CompositionLib.generateTiles(state.images);
    State.setTiles(state, newTiles);
  });
  State.registerImageUpdatedCallback(state, (state, image) => {
    if (!localState.composition) {
      error('imageUpdated event happened before any tilesChanged event');
      return;
    }
    const tileSize = calcTileSize(localState.composition, canvas, elContainer);
    renderCompositionOnCanvas(localState.composition, canvas, tileSize);
  });
  State.registerTilesChangedCallback(state, state => {
    localState.composition = CompositionLib.generateComposition(state.tiles, [
      state.size.width,
      state.size.height
    ]);
    localState.naturalTileSize = getNaturalFirstImageWidth(state.images);
    const tileSize = calcTileSize(localState.composition, canvas, elContainer);
    renderCompositionOnCanvas(localState.composition, canvas, tileSize);
    renderCompositionOverlay(localState.composition, elOverlay);
  });
  bindDownloadEvents(localState);
}
