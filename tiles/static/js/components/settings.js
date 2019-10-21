import * as State from '../state.js';
import * as CompositionLib from '../composition.js';

const TEXT_SHOW_CONNECTIONS = 'show connections';
const TEXT_HIDE_CONNECTIONS = 'hide connections';

function initSizeForm(state) {
  const elWidth = document.getElementById('js-width');
  const elHeight = document.getElementById('js-height');
  elWidth.value = state.size.width;
  elHeight.value = state.size.height;
}

function bindModeEvents(state) {
  const elButton = document.getElementById('js-mode');
  var modeFinal = true;
  elButton.addEventListener('click', () => {
    modeFinal = !modeFinal;
    elButton.textContent = modeFinal
      ? TEXT_SHOW_CONNECTIONS
      : TEXT_HIDE_CONNECTIONS;
    document.body.classList.toggle('mode-final', modeFinal);
  });
}

function bindShuffleEvents(state) {
  const elButton = document.getElementById('js-shuffle');
  elButton.addEventListener('click', () => State.shuffleTiles(state));
}

function bindSizeEvents(state) {
  const elWidth = document.getElementById('js-width');
  const elHeight = document.getElementById('js-height');
  elWidth.addEventListener('change', evt =>
    State.setSize(state, { width: evt.currentTarget.value })
  );
  elHeight.addEventListener('change', evt =>
    State.setSize(state, { height: evt.currentTarget.value })
  );
}

export default function Settings(state) {
  initSizeForm(state);
  bindModeEvents(state);
  bindShuffleEvents(state);
  bindSizeEvents(state);
  State.registerImagesLoadedCallback(state, initSizeForm);
}
