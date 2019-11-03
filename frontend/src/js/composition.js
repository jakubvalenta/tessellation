import * as HTML from './html.js';
import { error, log } from './log.js';

export const SIDES = [0, 1, 2, 3];
export const CONNECTIONS = [1, 2, 3, 4, 5];
const [LEFT, TOP, RIGHT, BOTTOM] = SIDES;
const MAX_TILES_TO_TRY = Math.pow(10, 4);

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
    if (row === 0) {
      return [null, null];
    }
    return [row - 1, width - 1];
  }
  return [row, col - 1];
}

function calcNextCoords(row, col, width, height) {
  if (col === width - 1) {
    if (row === height - 1) {
      return [null, null];
    }
    return [row + 1, 0];
  }
  return [row, col + 1];
}

function getConnection(tile, i) {
  return tile.image.connections[(i + tile.rotation) % SIDES.length];
}

function findRequirements(composition, col, row) {
  const leftTile = findLeftTile(composition, col, row);
  const topTile = findTopTile(composition, col, row);
  const requirements = [
    [LEFT, leftTile ? getConnection(leftTile, RIGHT) : null],
    [TOP, topTile ? getConnection(topTile, BOTTOM) : null]
  ];
  return requirements;
}

function fits(tile, requirements) {
  let i, side, requirement;
  for (i = 0; i < requirements.length; i++) {
    [side, requirement] = requirements[i];
    if (requirement !== null && getConnection(tile, side) !== requirement) {
      return false;
    }
  }
  return true;
}

function chooseTile(stack, requirements, excl = []) {
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

export function generateComposition(tiles, [width, height]) {
  const composition = Array.from(Array(height), () => new Array(width));
  const tried = Array.from(Array(height), () =>
    Array.from(Array(width), () => [])
  );
  const stack = Array.from(tiles);
  let row = 0,
    col = 0,
    tile,
    i = 0;
  for (i = 0; i < MAX_TILES_TO_TRY; i++) {
    log(`Choosing tile [${row}, ${col}]`);
    tile = chooseTile(
      stack,
      findRequirements(composition, col, row),
      tried[row][col]
    );
    tried[row][col].push(tile);
    if (tile !== null) {
      composition[row][col] = tile;
      [row, col] = calcNextCoords(row, col, width, height);
      if (row === null) {
        return {
          composition: composition,
          error: null,
          warn: null
        };
      }
    } else {
      log('No fitting tile found, going one step back');
      [row, col] = calcPrevCoords(row, col, width, height);
      if (row === null) {
        error('Failed to create a composition from these tiles');
        return {
          composition: [],
          error: "Input tiles don't connect.",
          warn: null
        };
      }
    }
  }
  error('Maximum tiles to try reached, returning an incomplete composition');
  return {
    composition,
    error: null,
    warn:
      'Maximum number of tiles reached. Please decrease the composition size.'
  };
}

export function renderCompositionOnCanvas(composition, canvas, tileSize) {
  const ctx = canvas.getContext('2d');
  if (!composition || !composition.length) {
    HTML.fillCanvas(canvas, ctx, '#fff');
    return;
  }
  const width = composition[0].length;
  const height = composition.length;
  canvas.width = width * tileSize;
  canvas.height = height * tileSize;
  HTML.fillCanvas(canvas, ctx, '#fff');
  composition.forEach((rowTiles, row) => {
    rowTiles.forEach((tile, col) => {
      if (!tile.image.htmlImage) {
        return;
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
    });
  });
}
