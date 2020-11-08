import * as CompositionLib from './composition.js';
import * as HTML from './utils/html.js';
import uuidv4 from './vendor/uuid.js';
import {
  SIDES,
  UPDATE_STACK_FUNC_DEFAULT_NAME,
  isImageComplete
} from './composition.js';
import { error, log } from './log.js';
import { reactive } from 'vue';
import { shuffle } from './utils/array.js';

const MAX_NATURAL_TILE_SIZE = 500;

function getNaturalFirstImageWidth(images) {
  if (images) {
    let i, image;
    for (i = 0; i < images.length; i++) {
      image = images[i];
      if (image.htmlImage) {
        return Math.min(image.htmlImage.naturalWidth, MAX_NATURAL_TILE_SIZE);
      }
    }
  }
  return null;
}

function loadHtmlImage(image) {
  if (!image.url) {
    return Promise.resolve(null);
  }
  return HTML.createHtmlImage(image.url).then(htmlImage => {
    image.htmlImage = htmlImage;
  });
}

function addIndex(image, i) {
  return { index: i, ...image };
}

// eslint-disable-next-line no-unused-vars
function removeIndex({ index, ...imageWithoutIndex }) {
  return imageWithoutIndex;
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
    imageData.url &&
    imageData.ref &&
    imageData.connections &&
    imageData.connections.length === SIDES.length
  );
}

function validateTileData(tileData) {
  return tileData.imgRef && tileData.rotation !== undefined;
}

const store = {
  state: reactive({
    size: { width: 5, height: 5 },
    tiles: [],
    images: [],
    composition: [],
    updateStackFuncName: UPDATE_STACK_FUNC_DEFAULT_NAME,
    allowRotation: true,
    naturalTileSize: 0,
    loading: true,
    error: null,
    user: {},
    containerEl: null,
    innerEl: null,
    canvasEl: null,
    image: null
  }),

  generateComposition: async function ({ redrawTimeout = 100 } = {}) {
    if (!this.state.canvasEl) {
      error('Canvas is not available yet');
      return;
    }

    this.state.error = null;
    this.state.loading = true;
    // Wait for the DOM to be redrawn with the loading message. Vue.nextTick()
    // doesn't seem to work.
    await new Promise(resolve => {
      window.setTimeout(resolve, redrawTimeout);
    });

    try {
      this.state.composition = CompositionLib.generateComposition(
        this.state.tiles,
        [this.state.size.width, this.state.size.height],
        {
          updateStackFuncName: this.state.updateStackFuncName,
          allowRotation: this.state.allowRotation
        }
      );
      CompositionLib.renderCompositionOnCanvas(
        this.state.composition,
        this.state.images,
        this.state.tiles,
        this.state.canvasEl,
        this.state.naturalTileSize
      );
      const containerWidth = this.state.containerEl.clientWidth;
      const containerHeight = this.state.containerEl.clientHeight;
      const ratio = this.state.size.width / this.state.size.height;
      if (containerWidth / containerHeight > ratio) {
        this.state.innerEl.style.height = containerHeight + 'px';
        this.state.innerEl.style.width =
          Math.round(containerHeight * ratio) + 'px';
      } else {
        this.state.innerEl.style.width = containerWidth + 'px';
        this.state.innerEl.style.height =
          Math.round(containerHeight / ratio) + 'px';
      }
      this.state.error = null;
    } catch (e) {
      error(e);
      this.state.error = e.message;
    }
    this.state.loading = false;
  },

  onImagesLoaded: function () {
    log('Images loaded');
    this.state.naturalTileSize = getNaturalFirstImageWidth(this.state.images);
    return this.generateComposition();
  },

  onImagesChanged: function () {
    log('Images changed');
    const newTiles = CompositionLib.generateTiles(this.state.images, {
      allowRotation: this.state.allowRotation
    });
    this.state.naturalTileSize =
      getNaturalFirstImageWidth(this.state.images) || 0;
    return this.setTiles(newTiles);
  },

  onTilesChanged: function () {
    log('Tiles changed');
    return this.generateComposition();
  },

  updateState: function (newState) {
    ['size', 'images', 'tiles', 'image'].forEach(field => {
      if (newState[field]) {
        this.state[field] = newState[field];
      }
    });
    const promises = this.state.images.map(loadHtmlImage);
    return Promise.all(promises).then(() => this.onImagesLoaded());
  },

  setSize: function ({ width, height }) {
    if (width) {
      this.state.size.width = Math.max(width, 1);
    }
    if (height) {
      this.state.size.height = Math.max(height, 1);
    }
    return this.onTilesChanged();
  },

  setUpdateStackFuncName: function (updateStackFuncName) {
    this.state.updateStackFuncName = updateStackFuncName;
    return this.onTilesChanged();
  },

  setAllowRotation: function (allowRotation) {
    return this.setTiles(
      CompositionLib.generateTiles(this.state.images, {
        allowRotation
      })
    );
  },

  setTiles: function (tiles) {
    this.state.tiles = tiles;
    return this.onTilesChanged();
  },

  setUser: function (user) {
    this.state.user = user;
  },

  setElements: function (containerEl, innerEl, canvasEl) {
    this.state.containerEl = containerEl;
    this.state.innerEl = innerEl;
    this.state.canvasEl = canvasEl;
  },

  newImage: function () {
    const ref = uuidv4();
    log(`Adding new image ${ref}`);
    this.state.images.push({
      index: this.state.images.length,
      ref,
      connections: Array.from(SIDES, () => null),
      url: null
    });
  },

  clearImages: function () {
    if (this.state.images.length) {
      this.state.images.splice(0);
      return this.onImagesChanged();
    }
    return Promise.resolve();
  },

  updateImage: function (image, url) {
    log(`Picked file ${url}`);
    const oldIsImageComplete = isImageComplete(image);
    image.url = url;
    return loadHtmlImage(image)
      .then(() => this.onImagesLoaded())
      .then(() => {
        if (oldIsImageComplete !== isImageComplete(image)) {
          return this.onImagesChanged();
        }
        return Promise.resolve();
      });
  },

  deleteImage: function ({ ref }) {
    log(`Deleting image ${ref}`);
    const image = this.findImage(this.state.images, ref);
    this.state.images.splice(image.index, 1);
    this.state.images = this.state.images.map((image, i) => {
      return { ...image, index: i };
    });
    if (isImageComplete(image)) {
      return this.onImagesChanged();
    }
    return Promise.resolve();
  },

  setImageConnection: function (image, side, connection) {
    image.connections.splice(side, 1, connection);
    if (isImageComplete(image)) {
      return this.onImagesChanged();
    }
    return Promise.resolve();
  },

  shuffleTiles: function () {
    shuffle(this.state.tiles);
    return this.onTilesChanged();
  },

  getCanvasDataUrl: function () {
    return HTML.canvasToDataUrl(this.state.canvasEl);
  },

  findImage: function (images, ref) {
    let i, image;
    for (i = 0; i < images.length; i++) {
      image = images[i];
      if (image.ref === ref) {
        return image;
      }
    }
    return null;
  },

  deserialize: function (data) {
    const newState = {};
    if (validateSizeData(data.size)) {
      newState.size = data.size;
    }
    if (data.image) {
      newState.image = data.image;
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
              image: store.findImage(newState.images, tileData.imgRef)
            };
          })
          .filter(tile => !!tile.image);
      }
    }
    return newState;
  },

  serialize: function () {
    return {
      size: this.state.size,
      images: this.state.images.filter(isImageComplete).map(removeIndex),
      tiles: this.state.tiles.map(({ image, rotation }) => {
        return { imgRef: image.ref, rotation };
      })
    };
  }
};

export default store;
