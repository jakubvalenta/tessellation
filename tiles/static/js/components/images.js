import * as HTML from '../html.js';
import * as State from '../state.js';
import * as Tile from './tile.js';

const TEXT_DELETE = 'x';
const TEXT_ADD = 'add more';
const TEXT_CHANGE_CONNECTIONS = 'change connection';

function renderImageConnections(state, image, elTile, elContainer) {
  image.connections.forEach((connection, side) => {
    const elConnButton = document.createElement('button');
    elConnButton.classList.add(
      'conn-button',
      `conn-button-${side}`,
      `conn-${connection}`
    );
    elConnButton.textContent = connection || '\u00b7';
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
    const elImageInner = document.createElement('div');
    elImageInner.className = 'image-inner';
    const elTile = Tile.createTileElement({ image, rotation: 0 });
    elTile.style.backgroundImage = `url('${image.url}')`;
    renderImageConnections(state, image, elTile, elContainer);
    elImageInner.appendChild(elTile);
    const elControls = document.createElement('div');
    elControls.className = 'image-controls';
    renderImageFile(state, image, elControls);
    renderImageDelete(state, image, elImageInner, elContainer);
    elImageInner.appendChild(elControls);
    elImage.appendChild(elImageInner);
    elContainer.appendChild(elImage);
  });
  const elImage = document.createElement('div');
  elImage.className = 'image';
  const elImageInner = document.createElement('div');
  elImageInner.className = 'image-inner image-inner-add';
  const elButton = document.createElement('button');
  elButton.textContent = TEXT_ADD;
  elButton.addEventListener('click', () => {
    State.newImage(state);
    renderImages(state, elContainer);
  });
  elImageInner.appendChild(elButton);
  elImage.appendChild(elImageInner);
  elContainer.appendChild(elImage);
}

export default function Images(state) {
  const elContainer = document.getElementById('js-images');
  State.registerImagesLoadedCallback(state, state =>
    renderImages(state, elContainer)
  );
  State.registerImageUpdatedCallback(
    state,
    state => renderImages(state, elContainer) // TODO: wasteful
  );
  State.registerImagesChangedCallback(state, state =>
    renderImages(state, elContainer)
  );
}
