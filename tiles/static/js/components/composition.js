import * as CompositionLib from '../composition.js';
import * as HTML from '../html.js';
import * as State from '../state.js';
import * as Tile from './tile.js';

function setImageBackground({ ref, url }) {
  const rule = `.img-${ref} { background-image: url('${url}') }`;
  const index = document.styleSheets[0].cssRules.length;
  console.log(`Inserting CSS rule ${rule} on index ${index}`);
  document.styleSheets[0].insertRule(rule, index);
}

function setAllImageBackgrounds(images) {
  images.forEach(image => image.url && setImageBackground(image));
}

function renderComposition(composition, elContainer) {
  HTML.clearElement(elContainer);
  composition.forEach(rowTiles => {
    const elRow = document.createElement('div');
    rowTiles.forEach(tile => elRow.appendChild(Tile.createTileElement(tile)));
    elContainer.appendChild(elRow);
  });
}

export default function Composition(state) {
  const elContainer = document.getElementById('js-composition');
  State.registerImagesLoadedCallback(state, state => {
    setAllImageBackgrounds(state.images);
  });
  State.registerImageUpdatedCallback(state, (state, image) => {
    setImageBackground(image);
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
