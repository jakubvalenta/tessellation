import * as CompositionLib from './composition.js';
import * as HTML from './html.js';
import uuidv4 from './uuid.js';
import { SIDES, isImageComplete } from './composition.js';
import { log } from './log.js';
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
    isAuthenticated: window.TESSELLATION_IS_AUTHENTICATED
  }),

  generateComposition: function () {
    this.state.loading = true;
    const res = CompositionLib.generateComposition(this.state.tiles, [
      this.state.size.width,
      this.state.size.height
    ]);
    this.state.composition = res.composition;
    this.state.loading = false;
    this.state.error = res.error;
    this.state.warn = res.warn;
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
  }
};

export default store;
