import uuidv4 from './uuid.js';
import { call } from './utils/func.js';
import { CONNECTIONS, isImageComplete } from './composition.js';
import { shuffle } from './utils/array.js';

export function initState() {
  return {
    size: { width: 5, height: 5 },
    tiles: null,
    images: [],
    callbacks: {
      imageUpdated: [],
      imagesLoaded: [],
      imagesChanged: [],
      tilesChanged: []
    }
  };
}

export function registerImageUpdatedCallback(state, callback) {
  state.callbacks.imageUpdated.push(callback);
}

export function registerImagesLoadedCallback(state, callback) {
  state.callbacks.imagesLoaded.push(callback);
}

export function registerImagesChangedCallback(state, callback) {
  state.callbacks.imagesChanged.push(callback);
}

export function registerTilesChangedCallback(state, callback) {
  state.callbacks.tilesChanged.push(callback);
}

function callImageUpdatedCallbacks(state, image) {
  call(state.callbacks.imageUpdated, state, image);
}

function callImagesLoadedCallbacks(state) {
  call(state.callbacks.imagesLoaded, state);
}

function callImagesChangedCallbacks(state) {
  call(state.callbacks.imagesChanged, state);
}

function callTilesChangedCallbacks(state) {
  call(state.callbacks.tilesChanged, state);
}

export function updateState(state, newState) {
  ['size', 'images', 'tiles'].forEach(field => {
    if (newState[field]) {
      state[field] = newState[field];
    }
  });
  callImagesLoadedCallbacks(state);
  callTilesChangedCallbacks(state);
}

export function setSize(state, { width, height }) {
  if (width) {
    state.size.width = Math.max(width, 1);
  }
  if (height) {
    state.size.height = Math.max(height, 1);
  }
  callTilesChangedCallbacks(state);
}

export function setTiles(state, tiles) {
  state.tiles = tiles;
  callTilesChangedCallbacks(state);
}

function findImage(state, ref) {
  let i, image;
  for (i = 0; i < state.images.length; i++) {
    image = state.images[i];
    if (image.ref === ref) {
      return {
        index: i,
        image
      };
    }
  }
  return { index: null, image: null };
}

export function getImage(state, ref) {
  const imageIndex = findImage(state, ref).index;
  return imageIndex !== null ? state.images[imageIndex] : null;
}

export function newImage(state) {
  const ref = uuidv4();
  console.log(`Adding new image ${ref}`);
  state.images.push({
    ref,
    connections: [null, null, null, null],
    url: null
  });
}

export function changeImage(state, image, url) {
  console.log(`Picked file ${url}`);
  const oldUrl = image.url;
  image.url = url;
  if (oldUrl !== url) {
    callImageUpdatedCallbacks(state, image);
  }
}

export function removeImage(state, { ref }) {
  console.log(`Removing image ${ref}`);
  const { index, image } = findImage(state, ref);
  state.images.splice(index, 1);
  if (isImageComplete(image)) {
    callImagesChangedCallbacks(state);
  }
}

export function shiftImageConnection(state, image, side) {
  const connection =
    image.connections[side] === null
      ? CONNECTIONS[0]
      : ((image.connections[side] + 1) % CONNECTIONS.length) + 1;
  image.connections[side] = connection;
  if (isImageComplete(image)) {
    callImagesChangedCallbacks(state);
  }
}

export function shuffleTiles(state) {
  shuffle(state.tiles);
  callTilesChangedCallbacks(state);
}
