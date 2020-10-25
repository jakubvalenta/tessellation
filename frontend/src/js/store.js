import * as CompositionLib from './composition.js';
import * as HTML from './html.js';
import uuidv4 from './uuid.js';
import { SIDES, isImageComplete } from './composition.js';
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
  image.selfConnect = image.selfConnect || Array.from(SIDES, () => true);
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
    imageData.connections.length === SIDES.length &&
    (!imageData.selfConnect || imageData.selfConnect.length === SIDES.length)
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
    naturalTileSize: 0,
    loading: true,
    error: null,
    warn: null,
    user: {}
  }),

  generateComposition: function () {
    this.state.loading = true;
    try {
      const composition = CompositionLib.generateComposition(this.state.tiles, [
        this.state.size.width,
        this.state.size.height
      ]);
      this.state.composition = composition;
      this.state.error = null;
      this.state.warn = null;
      this.state.loading = false;
    } catch (e) {
      if (e.message) {
        this.state.error = e.message;
      }
      this.state.warn = null;
      this.state.loading = false;
    }
  },

  renderCompositionOnCanvas(containerEl, tileSize) {
    log(`Rendering composition on canvas, tileSize=${tileSize}`);
    try {
      const t0 = performance.now();
      CompositionLib.renderCompositionOnCanvas(
        this.state.composition,
        this.state.images,
        this.state.tiles,
        containerEl,
        tileSize
      );
      const t1 = performance.now();
      log(`Rendered composition on canvas in ${t1 - t0}ms`);
    } catch (e) {
      error(e);
      this.state.error = 'Crash while drawing the composition';
    }
    this.state.loading = false;
  },

  onImagesLoaded: function () {
    log('Images loaded');
    this.generateComposition();
    this.state.naturalTileSize = getNaturalFirstImageWidth(this.state.images);
  },

  onImagesChanged: function () {
    log('Images changed');
    const newTiles = CompositionLib.generateTiles(this.state.images);
    this.state.naturalTileSize =
      getNaturalFirstImageWidth(this.state.images) || 0;
    this.setTiles(newTiles);
  },

  onTilesChanged: function () {
    log('Tiles changed');
    this.generateComposition();
  },

  updateState: function (newState) {
    ['size', 'images', 'tiles'].forEach(field => {
      if (newState[field]) {
        this.state[field] = newState[field];
      }
    });
    const promises = this.state.images.map(loadHtmlImage);
    Promise.all(promises).then(() => {
      this.onImagesLoaded();
    });
  },

  setSize: function ({ width, height }) {
    if (width) {
      this.state.size.width = Math.max(width, 1);
    }
    if (height) {
      this.state.size.height = Math.max(height, 1);
    }
    this.onTilesChanged();
  },

  setTiles: function (tiles) {
    this.state.tiles = tiles;
    this.onTilesChanged();
  },

  setUser: function (user) {
    this.state.user = user;
  },

  setLoading: function (loading) {
    this.state.loading = loading;
  },

  newImage: function () {
    const ref = uuidv4();
    log(`Adding new image ${ref}`);
    this.state.images.push({
      index: this.state.images.length,
      ref,
      connections: Array.from(SIDES, () => null),
      selfConnect: Array.from(SIDES, () => true),
      url: null
    });
  },

  clearImages: function () {
    if (this.state.images.length) {
      this.state.images.splice(0);
      this.onImagesChanged();
    }
  },

  updateImage: function (image, url) {
    log(`Picked file ${url}`);
    const oldIsImageComplete = isImageComplete(image);
    image.url = url;
    loadHtmlImage(image).then(() => {
      this.onImagesLoaded();
      if (oldIsImageComplete !== isImageComplete(image)) {
        this.onImagesChanged();
      }
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
      this.onImagesChanged();
    }
  },

  setImageConnection: function (image, side, connection) {
    image.connections.splice(side, 1, connection);
    if (isImageComplete(image)) {
      this.onImagesChanged();
    }
  },

  toggleImageSelfConnect: function (image, side) {
    image.selfConnect.splice(side, 1, !image.selfConnect[side]);
    if (isImageComplete(image)) {
      this.onImagesChanged();
    }
  },

  shuffleTiles: function () {
    shuffle(this.state.tiles);
    this.onTilesChanged();
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
