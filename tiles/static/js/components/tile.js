export function createTileElement({ image, rotation }) {
  const el = document.createElement('div');
  el.classList.add('tile', `img-${image.ref}`, `rot-${rotation}`);
  const elInner = document.createElement('div');
  elInner.classList.add(
    'tile-inner',
    ...image.connections.map((connection, i) => `conn-${i}-${connection}`)
  );
  el.appendChild(elInner);
  return el;
}
