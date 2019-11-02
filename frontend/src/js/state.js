import * as CompositionLib from './composition.js';
import * as HTML from './html.js';
import uuidv4 from './uuid.js';
import { CONNECTIONS, isImageComplete } from './composition.js';
import { log } from './log.js';
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

export function findImage(images, ref) {
  let i, image;
  for (i = 0; i < images.length; i++) {
    image = images[i];
    if (image.ref === ref) {
      return image;
    }
  }
  return null;
}

const state = {
  size: { width: 5, height: 5 },
  tiles: [],
  images: [],
  composition: [],
  naturalTileSize: 0,
  tileSize: 0,
  loading: true,

  onImagesLoaded: function() {
    log('Images loaded');
    this.composition = CompositionLib.generateComposition(this.tiles, [
      this.size.width,
      this.size.height
    ]);
    this.naturalTileSize = getNaturalFirstImageWidth(this.images);
  },

  onImagesChanged: function() {
    log('Images changed');
    const newTiles = CompositionLib.generateTiles(this.images);
    this.naturalTileSize = getNaturalFirstImageWidth(this.images);
    this.setTiles(newTiles);
  },

  onTilesChanged: function() {
    log('Tiles changed');
    this.composition = CompositionLib.generateComposition(this.tiles, [
      this.size.width,
      this.size.height
    ]);
  },

  updateState: function(newState) {
    ['size', 'images', 'tiles'].forEach(field => {
      if (newState[field]) {
        this[field] = newState[field];
      }
    });
    const promises = this.images.map(loadHtmlImage);
    Promise.all(promises).then(() => {
      this.onImagesLoaded();
      this.onTilesChanged();
    });
  },

  setSize: function({ width, height }) {
    if (width) {
      this.size.width = Math.max(width, 1);
    }
    if (height) {
      this.size.height = Math.max(height, 1);
    }
    this.onTilesChanged();
  },

  setTiles: function(tiles) {
    this.tiles = tiles;
    this.onTilesChanged();
  },

  setTileSize: function(tileSize) {
    this.tileSize = tileSize;
  },

  setLoading: function(loading) {
    this.loading = loading;
  },

  newImage: function() {
    const ref = uuidv4();
    log(`Adding new image ${ref}`);
    this.images.push({
      index: this.images.length,
      ref,
      connections: [null, null, null, null],
      url: null
    });
  },

  updateImage: function(image, url) {
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

  deleteImage: function({ ref }) {
    log(`Deleting image ${ref}`);
    const image = findImage(this.images, ref);
    this.images.splice(image.index, 1);
    this.images = this.images.map((image, i) => {
      return { ...image, index: i };
    });
    if (isImageComplete(image)) {
      this.onImagesChanged();
    }
  },

  shiftImageConnection: function(image, side) {
    const connection =
      image.connections[side] === null
        ? CONNECTIONS[0]
        : (image.connections[side] % CONNECTIONS.length) + 1;
    image.connections.splice(side, 1, connection); // Use splice to trigger Vue update.
    if (isImageComplete(image)) {
      this.onImagesChanged();
    }
  },

  shuffleTiles: function() {
    shuffle(this.tiles);
    this.onTilesChanged();
  }
};

export function initState() {
  return state; // TODO: clone?
}
