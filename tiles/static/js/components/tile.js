export function createTileElement({ image, rotation }) {
  const el = document.createElement('div');
  el.classList.add('tile', `img-${image.ref}`, `rot-${rotation}`);
  const elInner = document.createElement('div');
  elInner.classList.add(
    'tile-inner',
    ...image.connections.map((connection, i) => `conn-${i}-${connection}`)
  );
  const elText = document.createElement('div');
  elText.className = 'tile-text';
  elText.textContent = image.index + 1;
  elInner.appendChild(elText);
  el.appendChild(elInner);
  return el;
}
