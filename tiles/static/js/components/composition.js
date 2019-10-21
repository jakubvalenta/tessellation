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

export default function Composition(state) {
  const elContainer = document.getElementById('js-composition');
  const styleSheet = findStyleSheetByTitle('main');
  State.registerImagesLoadedCallback(state, state => {
    setAllImageBackgrounds(state.images, styleSheet);
  });
  State.registerImageUpdatedCallback(state, (state, image) => {
    setImageBackground(image, styleSheet);
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
    renderComposition(composition, elContainer);
  });
}
