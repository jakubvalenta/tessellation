import * as HTML from '../html.js';
import * as State from '../state.js';
import * as Tile from './tile.js';

const TEXT_DELETE = 'x';
const TEXT_ADD = 'add more';
const TEXT_CHANGE_CONNECTIONS = 'change connection';

function changeConnButtonAttrs(elConnButton, oldConnection, newConnection) {
  if (oldConnection !== null) {
    elConnButton.classList.remove(`conn-${oldConnection}`);
  }
  elConnButton.classList.add(`conn-${newConnection}`);
  elConnButton.textContent = newConnection || '\u00b7';
}

function renderImageConnections(state, image, elTile, elContainer) {
  image.connections.forEach((connection, side) => {
    const elConnButton = document.createElement('button');
    elConnButton.classList.add('conn-button', `conn-button-${side}`);
    changeConnButtonAttrs(elConnButton, null, connection);
    elConnButton.addEventListener('click', () => {
      const oldConnection = image.connections[side];
      State.shiftImageConnection(state, image, side);
      const newConnection = image.connections[side];
      changeConnButtonAttrs(elConnButton, oldConnection, newConnection);
    });
    elTile.appendChild(elConnButton);
  });
}

function renderImageFile(state, image, elControls, elTile) {
  const reader = new window.FileReader();
  reader.addEventListener('load', () => {
    const url = reader.result;
    State.updateImage(state, image, url).then(() =>
      HTML.setBackgroundImage(elTile, url)
    );
  });
  const name = `image-upload-${image.ref}`;
  const elLabel = document.createElement('label');
  elLabel.textContent = 'upload image';
  elLabel.setAttribute('for', name);
  elLabel.className = 'label-file';
  const elFile = document.createElement('input');
  elFile.id = name;
  elFile.type = 'file';
  elFile.accept = 'image/*';
  elFile.className = 'input-file';
  elFile.addEventListener('change', evt => {
    const file = evt.currentTarget.files[0];
    if (file) {
      reader.readAsDataURL(file);
    }
  });
  elControls.appendChild(elLabel);
  elControls.appendChild(elFile);
}

function renderImage(elContainer, state, image) {
  const elImage = document.createElement('div');
  elImage.className = 'image';
  const elImageInner = document.createElement('div');
  elImageInner.className = 'image-inner';
  const elTile = Tile.createTileElement({ image, rotation: 0 });
  if (image.url) {
    HTML.setBackgroundImage(elTile, image.url);
  }
  renderImageConnections(state, image, elTile, elContainer);
  elImageInner.appendChild(elTile);
  const elControls = document.createElement('div');
  elControls.className = 'image-controls';
  renderImageFile(state, image, elControls, elTile);
  const elButtonDelete = document.createElement('button');
  elButtonDelete.className = 'image-delete';
  elButtonDelete.textContent = TEXT_DELETE;
  elButtonDelete.addEventListener('click', () => {
    State.deleteImage(state, image);
    // TODO: Reindex rendered images
    elContainer.removeChild(elImage);
  });
  elControls.appendChild(elButtonDelete);
  elImageInner.appendChild(elControls);
  elImage.appendChild(elImageInner);
  return elImage;
}

function renderAddImageButton(elContainer, state) {
  const elAddImage = document.createElement('div');
  elAddImage.className = 'image';
  const elImageInner = document.createElement('div');
  elImageInner.className = 'image-inner image-inner-add';
  const elButton = document.createElement('button');
  elButton.textContent = TEXT_ADD;
  elButton.addEventListener('click', () => {
    State.newImage(state);
    const lastImage = state.images[state.images.length - 1];
    const elImage = renderImage(elContainer, state, lastImage);
    elContainer.insertBefore(elImage, elAddImage);
  });
  elImageInner.appendChild(elButton);
  elAddImage.appendChild(elImageInner);
  elContainer.appendChild(elAddImage);
}

function renderImages(state, elContainer) {
  HTML.clearElement(elContainer);
  state.images.forEach(image => {
    const elImage = renderImage(elContainer, state, image);
    elContainer.appendChild(elImage);
  });
  renderAddImageButton(elContainer, state);
}

export default function Images(state) {
  const elContainer = document.getElementById('js-images');
  State.registerImagesLoadedCallback(state, state =>
    renderImages(state, elContainer)
  );
}
