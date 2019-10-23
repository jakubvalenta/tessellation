import * as HTML from './html.js';
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

function loadHtmlImage(image) {
  if (!image.url) {
    return Promise.resolve(null);
  }
  return HTML.createHtmlImage(image.url).then(htmlImage => {
    image.htmlImage = htmlImage;
  });
}

export function updateState(state, newState) {
  ['size', 'images', 'tiles'].forEach(field => {
    if (newState[field]) {
      state[field] = newState[field];
    }
  });
  const promises = state.images.map(loadHtmlImage);
  Promise.all(promises).then(() => {
    callImagesLoadedCallbacks(state);
    callTilesChangedCallbacks(state);
  });
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

export function findImage(state, ref) {
  let i, image;
  for (i = 0; i < state.images.length; i++) {
    image = state.images[i];
    if (image.ref === ref) {
      return image;
    }
  }
  return null;
}

export function newImage(state) {
  const ref = uuidv4();
  console.log(`Adding new image ${ref}`);
  state.images.push({
    index: state.images.length,
    ref,
    connections: [null, null, null, null],
    url: null
  });
}

export function updateImage(state, imageCopy, url) {
  console.log(`Picked file ${url}`);
  const image = findImage(state, imageCopy.ref);
  const oldIsImageComplete = isImageComplete(image);
  const oldUrl = image.url;
  image.url = url;
  return new Promise(resolve => {
    loadHtmlImage(image).then(() => {
      resolve();
      const newIsImageComplete = isImageComplete(image);
      if (newIsImageComplete && oldUrl !== url) {
        callImageUpdatedCallbacks(state, image);
      }
      if (oldIsImageComplete !== isImageComplete(image)) {
        callImagesChangedCallbacks(state);
      }
    });
  });
}

export function deleteImage(state, { ref }) {
  console.log(`Deleting image ${ref}`);
  const image = findImage(state, ref);
  state.images.splice(image.index, 1);
  state.images = state.images.map((image, i) => {
    return { ...image, index: i };
  });
  if (isImageComplete(image)) {
    callImagesChangedCallbacks(state);
  }
}

export function shiftImageConnection(state, image, side) {
  const connection =
    image.connections[side] === null
      ? CONNECTIONS[0]
      : (image.connections[side] % CONNECTIONS.length) + 1;
  image.connections[side] = connection;
  if (isImageComplete(image)) {
    callImagesChangedCallbacks(state);
  }
}

export function shuffleTiles(state) {
  shuffle(state.tiles);
  callTilesChangedCallbacks(state);
}
