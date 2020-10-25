import * as HTML from './html.js';
import { error, log } from './log.js';
import 'abort-controller/polyfill';

export const SIDES = [0, 1, 2, 3];
export const SIDE_NAMES = ['left', 'top', 'right', 'bottom'];
export const CONNECTIONS = [1, 2, 3, 4, 5];
const [LEFT, TOP, RIGHT, BOTTOM] = SIDES;

export function isImageComplete(image) {
  return (
    image.url !== null &&
    image.connections.every(connection => connection !== null)
  );
}

export function getSide(tile, side) {
  return (side + tile.rotation) % SIDES.length;
}

export function generateTiles(images) {
  return images.filter(isImageComplete).flatMap(image =>
    SIDES.map(rotation => {
      return {
        image,
        rotation
      };
    })
  );
}

function findRequirements(composition, col, row) {
  const requirements = [];
  if (col !== 0) {
    const leftTile = composition[row][col - 1];
    const adjacentSide = getSide(leftTile, RIGHT);
    requirements.push({
      side: LEFT,
      image: leftTile.image,
      connection: leftTile.image.connections[adjacentSide],
      selfConnect: leftTile.image.selfConnect[adjacentSide],
      adjacentSide
    });
  }
  if (row !== 0) {
    const topTile = composition[row - 1][col];
    const adjacentSide = getSide(topTile, BOTTOM);
    requirements.push({
      side: TOP,
      image: topTile.image,
      connection: topTile.image.connections[adjacentSide],
      selfConnect: topTile.image.selfConnect[adjacentSide],
      adjacentSide
    });
  }
  return requirements;
}

function fits(tile, requirements) {
  for (const requirement of requirements) {
    const rotatedSide = getSide(tile, requirement.side);
    if (tile.image.connections[rotatedSide] !== requirement.connection) {
      return false;
    }
    if (
      !requirement.selfConnect &&
      requirement.image === tile.image &&
      rotatedSide === requirement.adjacentSide
    ) {
      return false;
    }
  }
  return true;
}

function chooseTile(stack, requirements, excl) {
  let i, tile;
  for (i = 0; i < stack.length; i++) {
    tile = stack[i];
    if (excl.indexOf(tile) === -1 && fits(tile, requirements)) {
      stack.splice(i, 1);
      stack.push(tile);
      return tile;
    }
  }
  return null;
}

export function generateComposition(tiles, [width, height], { abortSignal }) {
  return new Promise((resolve, reject) => {
    if (abortSignal.aborted) {
      return reject();
    }
    abortSignal.addEventListener('abort', () => {
      reject();
    });
    const t0 = performance.now();
    const composition = Array.from(Array(height), () => Array(width));
    if (!tiles.length) {
      return resolve(composition);
    }
    const tried = Array.from(Array(height), () =>
      Array.from(Array(width), () => [])
    );
    const stack = Array.from(tiles);
    let row = 0,
      col = 0;
    while (row < height && col < width) {
      const tile = chooseTile(
        stack,
        findRequirements(composition, col, row),
        tried[row][col]
      );
      tried[row][col].push(tile);
      if (tile !== null) {
        composition[row][col] = tile;
        if (col === width - 1) {
          row += 1;
          col = 0;
        } else {
          col += 1;
        }
      } else {
        log(`[${row}, ${col}] No fitting tile found, going one step back`);
        tried[row][col].splice(0);
        if (col === 0) {
          if (row === 0) {
            throw new Error("Input tiles don't connect.");
          }
          row -= 1;
          col = width - 1;
        } else {
          col -= 1;
        }
      }
    }
    const t1 = performance.now();
    log(`Generated composition in ${t1 - t0}ms`);
    return resolve(composition);
  });
}

export function renderCompositionOnCanvas(
  composition,
  images,
  tiles,
  canvas,
  tileSize,
  maxSize = 8192 // https://stackoverflow.com/a/11585939
) {
  const ctx = canvas.getContext('2d');
  if (!composition.length || !tileSize) {
    error("Can't render composition on canvas, because it's not generated.");
    HTML.fillCanvas(canvas, ctx, '#fff');
    return false;
  }
  const width = composition[0].length;
  const height = composition.length;
  if (tileSize * width > maxSize) {
    tileSize = Math.floor(maxSize / width);
  }
  if (tileSize * height > maxSize) {
    tileSize = Math.floor(maxSize / height);
  }
  if (tileSize % 2) {
    tileSize -= 1;
  }
  tileSize = Math.max(2, tileSize);
  images.forEach(image => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = tileSize;
    const ctx = canvas.getContext('2d');
    image.htmlImage.width = image.htmlImage.height = tileSize;
    ctx.drawImage(image.htmlImage, 0, 0, tileSize, tileSize);
    image.canvas = canvas;
  });
  const offset = tileSize / 2;
  tiles.forEach(tile => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = tileSize;
    const ctx = canvas.getContext('2d');
    ctx.translate(offset, offset);
    ctx.rotate(-(tile.rotation / 2) * Math.PI);
    ctx.drawImage(tile.image.canvas, -offset, -offset);
    tile.canvas = canvas;
  });
  canvas.width = width * tileSize;
  canvas.height = height * tileSize;
  HTML.fillCanvas(canvas, ctx, '#fff');
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const tile = composition[row][col];
      ctx.drawImage(tile.canvas, col * tileSize, row * tileSize);
    }
  }
}
