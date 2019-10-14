import * as State from '../state.js';

function initSizeForm(state) {
  const elWidth = document.getElementById('js-width');
  const elHeight = document.getElementById('js-height');
  elWidth.value = state.size.width;
  elHeight.value = state.size.height;
}

function bindModeEvents(state) {
  const elRadios = document.getElementsByName('js-mode-preview');
  elRadios.forEach(el => {
    el.checked = el.getAttribute('checked');
    el.addEventListener('click', evt =>
      document.body.classList.toggle(
        'mode-final',
        evt.currentTarget.value !== '1'
      )
    );
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
