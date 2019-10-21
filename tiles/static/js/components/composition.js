import * as CanvasLib from '../canvas.js';
import * as CompositionLib from '../composition.js';
import * as HTML from '../html.js';
import * as State from '../state.js';
import * as Tile from './tile.js';

function findStyleSheetByTitle(title) {
  let i, styleSheet;
  for (i = 0; i < document.styleSheets.length; i++) {
    styleSheet = document.styleSheets[i];
    if (styleSheet.title === title) {
      return styleSheet;
    }
  }
  return null;
}

function setImageBackground({ ref, url }, styleSheet) {
  const rule = `.img-${ref} { background-image: url('${url}') }`;
  const index = styleSheet.cssRules.length;
  console.log(`Inserting CSS rule ${rule} on index ${index}`);
  styleSheet.insertRule(rule, index);
}

function setAllImageBackgrounds(images, styleSheet) {
  images.forEach(image => image.url && setImageBackground(image, styleSheet));
}

function renderComposition(composition, elContainer) {
  HTML.clearElement(elContainer);
  composition.forEach(rowTiles => {
    const elRow = document.createElement('div');
    elRow.className = 'row';
    rowTiles.forEach(tile => elRow.appendChild(Tile.createTileElement(tile)));
    elContainer.appendChild(elRow);
  });
}

function renderCompositionOnCanvas(
  elContainer,
  canvas,
  composition,
  width,
  height,
  htmlImages
) {
  const containerWidth = elContainer.clientWidth;
  const tileSize = Math.round(containerWidth / width);
  canvas.width = containerWidth;
  canvas.height = height * tileSize;
  var ctx = canvas.getContext('2d');
  CanvasLib.fillCanvas(canvas, ctx, '#fff');
  composition.forEach((rowTiles, row) => {
    rowTiles.forEach((tile, col) => {
      if (!tile.image.ref) {
        return;
      }
      const htmlImage = htmlImages[tile.image.ref];
      htmlImage.width = tileSize;
      htmlImage.height = tileSize;
      CanvasLib.drawRotatedImage(
        canvas,
        ctx,
        htmlImage,
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
      evt.target.href = CanvasLib.canvasToDataUrl(canvas);
    },
    false
  );
}

export default function Composition(state) {
  const elContainer = document.getElementById('js-composition');
  const styleSheet = findStyleSheetByTitle('main');
  const elTiles = document.getElementById('js-composition-tiles');
  const canvas = document.getElementById('js-composition-canvas');
  const localState = {
    htmlImages: {}
  };
  State.registerImagesLoadedCallback(state, state => {
    setAllImageBackgrounds(state.images, styleSheet);
    localState.htmlImages = {};
    state.images.forEach(image => {
      localState.htmlImages[image.ref] = HTML.createHtmlImage(image.url);
    });
  });
  State.registerImageUpdatedCallback(state, (state, image) => {
    setImageBackground(image, styleSheet);
    localState.htmlImages[image.ref] = HTML.createHtmlImage(image.url);
  });
  State.registerImagesChangedCallback(state, state => {
    const newTiles = CompositionLib.generateTiles(state.images);
    State.setTiles(state, newTiles);
  });
  State.registerTilesChangedCallback(state, state => {
    const composition = CompositionLib.generateComposition(state.tiles, [
      state.size.width,
      state.size.height
    ]);
    renderComposition(composition, elTiles);
    window.setTimeout(() => {
      renderCompositionOnCanvas(
        elContainer,
        canvas,
        composition,
        state.size.width,
        state.size.height,
        localState.htmlImages
      );
    }, 100); // TODO: wait for images
  });
  bindDownloadEvents(canvas);
}
