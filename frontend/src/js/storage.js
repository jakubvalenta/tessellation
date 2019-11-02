import * as HTTP from './http.js';
import * as State from './state.js';
import { isImageComplete, SIDES } from './composition.js';
import { log } from './log.js';

const API_URL = '/api';

export const MAX_COMPOSITIONS_PER_USER = 10;

// Keep in sync with Django setting MAX_UPLOAD_SIZE_BYTES
const MAX_UPLOAD_SIZE_BYTES = 1000000;

function setStorageObject(obj) {
  window.localStorage.setItem('tiles', JSON.stringify(obj));
}

function getStorageObject() {
  const dataStr = window.localStorage.getItem('tiles');
  return dataStr && JSON.parse(dataStr);
}

function pushStorageItem(dataItem) {
  const data = getStorageObject() || [];
  data.push(dataItem);
  setStorageObject(data);
}

export function getStorageItem(dataIndex) {
  return getStorageObject()[dataIndex];
}

export function deleteStorageItem(dataIndex) {
  const data = getStorageObject();
  data.splice(dataIndex, 1);
  setStorageObject(data);
}

function addIndex(image, i) {
  return { index: i, ...image };
}

// eslint-disable-next-line no-unused-vars
function removeIndex({ index, ...imageWithoutIndex }) {
  return imageWithoutIndex;
}

function serializeState(state) {
  return {
    size: state.size,
    images: state.images.filter(isImageComplete).map(removeIndex),
    tiles: state.tiles.map(({ image, rotation }) => {
      return { imgRef: image.ref, rotation };
    })
  };
}

export function storeState(state) {
  const dataItem = serializeState(state);
  dataItem.timestamp = new Date().toISOString();
  pushStorageItem(dataItem);
}

function compatImage(image) {
  image.ref = image.ref || image.imgId; // compat
  return image;
}

function compatTile(tile) {
  tile.imgRef = tile.imgRef || tile.imgId; // compat
  return tile;
}

function validateSizeData(sizeData) {
  return sizeData && sizeData.width && sizeData.height;
}

function validateImageData(imageData) {
  return (
    imageData.connections &&
    imageData.connections.length === SIDES.length &&
    imageData.url &&
    imageData.ref
  );
}

function validateTileData(tileData) {
  return tileData.imgRef && tileData.rotation !== undefined;
}

export function deserializeState(data) {
  const newState = {};
  if (validateSizeData(data.size)) {
    newState.size = data.size;
  }
  if (data.images) {
    newState.images = data.images
      .map(compatImage)
      .filter(validateImageData)
      .map(addIndex);
    if (data.tiles) {
      newState.tiles = data.tiles
        .map(compatTile)
        .filter(validateTileData)
        .map(tileData => {
          return {
            ...tileData,
            image: State.findImage(newState.images, tileData.imgRef)
          };
        })
        .filter(tile => !!tile.image);
    }
  }
  return newState;
}

export function readStorageTimestamps() {
  const data = getStorageObject() || [];
  return data
    .map(({ timestamp }, dataIndex) => {
      return {
        timestamp,
        dataIndex
      };
    })
    .sort((a, b) => {
      if (a.timestamp < b.timestamp) {
        return -1;
      }
      if (a.timestamp > b.timestamp) {
        return 1;
      }
      return 0;
    })
    .reverse();
}

export function validateStateBeforePublish(state) {
  for (let i = 0; i < state.images.length; i++) {
    if (state.images[i].url.length > MAX_UPLOAD_SIZE_BYTES) {
      return `When publishing, the maximum allowed size of a tile image is ${MAX_UPLOAD_SIZE_BYTES} bytes. Please choose a smaller image.`;
    }
  }
  return null;
}

export function publishState(state) {
  log('Publishing the state');
  const data = serializeState(state);
  const promises = data.images.map(image => {
    return HTTP.httpImageData(image.url).then(data => {
      image.data = data;
    });
  });
  return Promise.all(promises).then(() => {
    return HTTP.http('POST', `${API_URL}/compositions/`, data);
  });
}

export function getPublishedComposition(compositionId) {
  return HTTP.http('GET', `${API_URL}/compositions/${compositionId}`);
}

export function getPublishedCompositions() {
  return HTTP.http('GET', `${API_URL}/compositions/`);
}

export function getSampleComposition(compositionId) {
  return HTTP.http('GET', `${API_URL}/samples/${compositionId}`);
}

export function getSampleCompositions() {
  return HTTP.http('GET', `${API_URL}/samples/`);
}

export function deletePublishedComposition(compositionId) {
  return HTTP.http('DELETE', `${API_URL}/compositions/${compositionId}`);
}
