export const SIDES = [0, 1, 2, 3];
export const CONNECTIONS = [1, 2, 3, 4, 5];
const [LEFT, TOP, RIGHT, BOTTOM] = SIDES;
import { log } from './log.js';

export function isImageComplete(image) {
  return (
    image.url !== null &&
    image.connections.every(connection => connection !== null)
  );
}

function createEmptyTile() {
  return {
    image: {
      i: null,
      ref: 'none',
      connections: SIDES.map(() => 0)
    },
    rotation: 0
  };
}

export function generateTiles(images) {
  const out = [];
  let i = 0;
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

function getConnection(tile, i) {
  return tile.image.connections[(i + tile.rotation) % SIDES.length];
}

function findRequirements(composition, col, row) {
  const leftTile = findLeftTile(composition, col, row);
  const topTile = findTopTile(composition, col, row);
  log('Left tile', leftTile);
  log('Top tile', topTile);
  const requirements = [
    [LEFT, leftTile ? getConnection(leftTile, RIGHT) : null],
    [TOP, topTile ? getConnection(topTile, BOTTOM) : null]
  ];
  log('Tile requirements', requirements);
  return requirements;
}

function fits(tile, requirements) {
  let i, side, requirement;
  log(`Trying if tile fits`, tile);
  for (i = 0; i < requirements.length; i++) {
    [side, requirement] = requirements[i];
    if (requirement !== null && getConnection(tile, side) !== requirement) {
      return false;
    }
  }
  return true;
}

function chooseTile(stack, requirements) {
  let i, tile;
  for (i = 0; i < stack.length; i++) {
    tile = stack[i];
    if (fits(tile, requirements)) {
      stack.splice(i, 1);
      stack.push(tile);
      return tile;
    }
  }
  return null;
}

export function generateComposition(tiles, [width, height]) {
  const composition = Array.from(Array(height), () => new Array(width));
  const stack = Array.from(tiles);
  let row, col, tile;
  let stop = false;
  for (row = 0; row < height; row++) {
    for (col = 0; col < width; col++) {
      log(`Choosing tile for position ${row} ${col}`);
      tile = chooseTile(stack, findRequirements(composition, col, row));
      if (tile !== null) {
        log('Inserting tile on position', tile, row, col);
        composition[row][col] = tile;
      } else {
        log('No fitting tile found, stopping composition generation');
        stop = true;
      }
      if (stop) {
        composition[row][col] = createEmptyTile();
      }
    }
    if (stop) {
      return composition;
    }
  }
  return composition;
}
