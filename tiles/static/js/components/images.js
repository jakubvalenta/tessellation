import * as HTML from '../html.js';
import * as State from '../state.js';
import * as Tile from './tile.js';

const TEXT_DELETE = 'x';
const TEXT_ADD = 'add more';
const TEXT_CHANGE_CONNECTIONS = 'change connection';

function renderImageConnections(state, image, elTile, elContainer) {
  image.connections.forEach((connection, side) => {
    const elConnButton = document.createElement('button');
    elConnButton.classList.add('conn-button', `conn-button-${side}`);
    elConnButton.textContent = connection;
    elConnButton.addEventListener('click', () => {
      State.shiftImageConnection(state, image, side);
      renderImages(state, elContainer);
    });
    elTile.appendChild(elConnButton);
  });
}

function renderImageFile(state, image, elControls) {
  const reader = new FileReader();
  reader.addEventListener('load', () =>
    State.changeImage(state, image, reader.result)
  );
  const name = `image-upload-${image.ref}`;
  const elLabel = document.createElement('label');
  elLabel.textContent = 'select file';
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

function renderImageDelete(state, image, elControls, elContainer) {
  const elButton = document.createElement('button');
  elButton.className = 'image-delete';
  elButton.textContent = TEXT_DELETE;
  elButton.addEventListener('click', () => {
    State.deleteImage(state, image);
    renderImages(state, elContainer);
  });
  elControls.appendChild(elButton);
}

function renderImages(state, elContainer) {
  HTML.clearElement(elContainer);
  state.images.forEach(image => {
    const elImage = document.createElement('div');
    elImage.className = 'image';
    const elTile = Tile.createTileElement({ image, rotation: 0 });
    renderImageConnections(state, image, elTile, elContainer);
    elImage.appendChild(elTile);
    const elControls = document.createElement('div');
    elControls.className = 'image-controls';
    renderImageFile(state, image, elControls);
    renderImageDelete(state, image, elImage, elContainer);
    elImage.appendChild(elControls);
    elContainer.appendChild(elImage);
  });
  const elImage = document.createElement('div');
  elImage.className = 'image image-add';
  const elButton = document.createElement('button');
  elButton.textContent = TEXT_ADD;
  elButton.addEventListener('click', () => {
    State.newImage(state);
    renderImages(state, elContainer);
  });
  elImage.appendChild(elButton);
  elContainer.appendChild(elImage);
}

export default function Images(state) {
  const elContainer = document.getElementById('js-images');
  State.registerImagesLoadedCallback(state, state =>
    renderImages(state, elContainer)
  );
  State.registerImagesChangedCallback(state, state =>
    renderImages(state, elContainer)
  );
}
