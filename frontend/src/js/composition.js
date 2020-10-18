import * as HTML from './html.js';
import { log } from './log.js';
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

export function generateTiles(images) {
  const out = [];
  images.forEach(image => {
    if (isImageComplete(image)) {
      for (let rotation = 0; rotation < SIDES.length; rotation++) {
        out.push({
          image,
          rotation
        });
      }
    }
  });
  return out;
}

function findLeftTile(composition, col, row) {
  if (col === 0) {
    return null;
  }
  return composition[row][col - 1];
}

function findTopTile(composition, col, row) {
  if (row === 0) {
    return null;
  }
  return composition[row - 1][col];
}

function calcPrevCoords(row, col, width) {
  if (col === 0) {
    return [row - 1, width - 1];
  }
  return [row, col - 1];
}

function calcNextCoords(row, col, width) {
  if (col === width - 1) {
    return [row + 1, 0];
  }
  return [row, col + 1];
}

function findRequirements(composition, col, row) {
  const requirements = [];
  const leftTile = findLeftTile(composition, col, row);
  if (leftTile) {
    const adjacentSide = (RIGHT + leftTile.rotation) % SIDES.length;
    requirements.push({
      side: LEFT,
      image: leftTile.image,
      connection: leftTile.image.connections[adjacentSide],
      selfConnect: leftTile.image.selfConnect[adjacentSide],
      adjacentSide
    });
  }
  const topTile = findTopTile(composition, col, row);
  if (topTile) {
    const adjacentSide = (BOTTOM + topTile.rotation) % SIDES.length;
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
    const rotatedSide = (requirement.side + tile.rotation) % SIDES.length;
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
      return composition;
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
        [row, col] = calcNextCoords(row, col, width, height);
      } else {
        log(`[${row}, ${col}] No fitting tile found, going one step back`);
        tried[row][col].splice(0);
        [row, col] = calcPrevCoords(row, col, width, height);
        if (row < 0) {
          throw new Error("Input tiles don't connect.");
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
  canvas,
  tileSize,
  maxSize = 8192 // https://stackoverflow.com/a/11585939
) {
  return new Promise(resolve => {
    const ctx = canvas.getContext('2d');
    if (!composition || !composition.length) {
      HTML.fillCanvas(canvas, ctx, '#fff');
      return;
    }
    const width = composition[0].length;
    const height = composition.length;
    if (width * tileSize > maxSize) {
      tileSize = Math.floor(maxSize / width);
    }
    if (height * tileSize > maxSize) {
      tileSize = Math.floor(maxSize / height);
    }
    canvas.width = width * tileSize;
    canvas.height = height * tileSize;
    HTML.fillCanvas(canvas, ctx, '#fff');
    for (let col = 0; col < width; col++) {
      for (let row = 0; row < height; row++) {
        const tile = composition[row][col];
        if (!tile.image.htmlImage) {
          continue;
        }
        tile.image.htmlImage.width = tileSize;
        tile.image.htmlImage.height = tileSize;
        HTML.drawRotatedImage(
          canvas,
          ctx,
          tile.image.htmlImage,
          col * tileSize,
          row * tileSize,
          -(tile.rotation / 2) * Math.PI
        );
      }
    }
    resolve();
  });
}
