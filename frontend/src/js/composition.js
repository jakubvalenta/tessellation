import * as HTML from './utils/html.js';
import { log } from './log.js';
import { shuffle } from './utils/array.js';
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

function getConnection(tile, side) {
  return tile.image.connections[(side + tile.rotation) % SIDES.length];
}

export function reverseDigits(n) {
  if (n < 10) {
    return n;
  }
  let rev = 0;
  while (n > 0) {
    rev = rev * 10 + (n % 10);
    n = Math.floor(n / 10);
  }
  return rev;
}

export function generateTiles(images, { allowRotation = true } = {}) {
  const completeImages = images.filter(isImageComplete);
  if (!allowRotation) {
    return completeImages.map(image => {
      return {
        image,
        rotation: 0
      };
    });
  }
  return completeImages.flatMap(image =>
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
    requirements.push({
      side: LEFT,
      connection: reverseDigits(getConnection(leftTile, RIGHT))
    });
  }
  if (row !== 0) {
    const topTile = composition[row - 1][col];
    requirements.push({
      side: TOP,
      connection: reverseDigits(getConnection(topTile, BOTTOM))
    });
  }
  return requirements;
}

function fits(tile, requirements) {
  for (const requirement of requirements) {
    if (getConnection(tile, requirement.side) !== requirement.connection) {
      return false;
    }
  }
  return true;
}

export const UPDATE_STACK_FUNC_DEFAULT_NAME = 'push_current';

export const UPDATE_STACK_FUNCS = {
  [UPDATE_STACK_FUNC_DEFAULT_NAME]: {
    label: 'Degrade last used tile',
    func: function (stack, i) {
      stack.push(stack.splice(i, 1)[0]);
    }
  },
  cycle_stack: {
    label: 'Repeat sequence',
    func: function (stack) {
      stack.push(stack.splice(0, 1)[0]);
    }
  },
  noop: {
    label: 'Prefer one tile',
    func: function () {}
  },
  shuffle_stack: {
    label: 'Random',
    func: function (stack) {
      shuffle(stack);
    }
  },
  unshift_current: {
    label: 'Prefer last used tile',
    func: function (stack, i) {
      stack.unshift(stack.splice(i, 1)[0]);
    }
  }
};

function chooseTile(stack, requirements, excl, updateStackFunc) {
  let i, tile;
  for (i = 0; i < stack.length; i++) {
    tile = stack[i];
    if (excl.indexOf(tile) === -1 && fits(tile, requirements)) {
      updateStackFunc(stack, i);
      return tile;
    }
  }
  return null;
}

export function generateComposition(
  tiles,
  [width, height],
  {
    maxSteps = Math.pow(2, 18),
    updateStackFuncName = UPDATE_STACK_FUNC_DEFAULT_NAME
  } = {}
) {
  log(`Generating composition updateStackFuncName=${updateStackFuncName}`);
  const t0 = performance.now();
  const composition = Array.from(Array(height), () => Array(width));
  if (!tiles.length) {
    return composition;
  }
  const tried = Array.from(Array(height), () =>
    Array.from(Array(width), () => [])
  );
  const stack = Array.from(tiles);
  const updateStackFunc = UPDATE_STACK_FUNCS[updateStackFuncName].func;
  let i = 0,
    row = 0,
    col = 0;
  while (row < height && col < width) {
    const tile = chooseTile(
      stack,
      findRequirements(composition, col, row),
      tried[row][col],
      updateStackFunc
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
    if (i >= maxSteps) {
      throw new Error(`Failed to calculate composition in ${maxSteps} steps.`);
    }
    i++;
  }
  const t1 = performance.now();
  log(`Generated composition in ${t1 - t0}ms`);
  return composition;
}

export function renderCompositionOnCanvas(
  composition,
  images,
  tiles,
  canvas,
  tileSize,
  maxSize = 8192 // https://stackoverflow.com/a/11585939
) {
  log(`Rendering composition on canvas, tileSize=${tileSize}`);
  const t0 = performance.now();
  const ctx = canvas.getContext('2d');
  if (!composition.length) {
    throw new Error("Can't render composition, because it's not generated.");
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
    if (image.htmlImage !== undefined) {
      // HTML image can be undefined when the image has not been uploaded yet.
      image.htmlImage.width = image.htmlImage.height = tileSize;
      ctx.drawImage(image.htmlImage, 0, 0, tileSize, tileSize);
    }
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
      if (tile !== undefined) {
        // Tile can be undefined when an empty composition was generated,
        // because the user hasn't uploaded any tiles yet.
        ctx.drawImage(tile.canvas, col * tileSize, row * tileSize);
      }
    }
  }
  const t1 = performance.now();
  log(`Rendered composition on canvas in ${t1 - t0}ms`);
}
