import * as HTML from '../html.js';
import * as State from '../state.js';
import * as Tile from './tile.js';

function renderImageConnections(state, image, elTile, elContainer) {
  image.connections.forEach((connection, side) => {
    const elConnButton = document.createElement('button');
    elConnButton.classList.add('conn-button', `conn-button-${side}`);
    elConnButton.textContent = 'change connection';
    elConnButton.addEventListener('click', () => {
      State.shiftImageConnection(state, image, side);
      renderImages(state, elContainer);
    });
    elTile.appendChild(elConnButton);
  });
}

function renderImageFile(state, image, elImage) {
  const reader = new FileReader();
  reader.addEventListener('load', () =>
    State.changeImage(state, image, reader.result)
  );
  const elFile = document.createElement('input');
  elFile.type = 'file';
  elFile.addEventListener('change', evt => {
    const file = evt.currentTarget.files[0];
    if (file) {
      reader.readAsDataURL(file);
    }
  });
  elImage.appendChild(elFile);
}

function renderImageDelete(state, image, elImage, elContainer) {
  const elButton = document.createElement('button');
  elButton.textContent = 'delete';
  elButton.addEventListener('click', () => {
    State.deleteImage(state, image);
    renderImages(state, elContainer);
  });
  elImage.appendChild(elButton);
}

function renderImages(state, elContainer) {
  HTML.clearElement(elContainer);
  state.images.forEach(image => {
    const elImage = document.createElement('div');
    elImage.className = 'col';
    const elTile = Tile.createTileElement({ image, rotation: 0 });
    renderImageConnections(state, image, elTile, elContainer);
    elImage.appendChild(elTile);
    renderImageFile(state, image, elImage);
    renderImageDelete(state, image, elImage, elContainer);
    elContainer.appendChild(elImage);
  });
}

function bindImagesEvents(state, elContainer) {
  const elButton = document.getElementById('js-images-add');
  elButton.addEventListener('click', () => {
    State.newImage(state);
    renderImages(state, elContainer);
  });
}

export default function Images(state) {
  const elContainer = document.getElementById('js-images');
  bindImagesEvents(state, elContainer);
  State.registerImagesLoadedCallback(state, state =>
    renderImages(state, elContainer)
  );
  State.registerImagesChangedCallback(state, state =>
    renderImages(state, elContainer)
  );
}
