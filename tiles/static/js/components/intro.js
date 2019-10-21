import * as State from '../state.js';

function addIntro(el, text) {
  if (!el) {
    return;
  }
  el.setAttribute('data-intro', text);
}

function initIntroJs() {
  return window.introJs().setOptions({
    showBullets: false,
    showProgress: true
  });
}

function bindEvents(intro) {
  const elButton = document.getElementById('js-intro-start');
  elButton.addEventListener('click', () => intro.start());
}

function addStaticIntro() {
  addIntro(
    document.querySelector('#js-shuffle'),
    'The composition is automatically generated when you change the input images. You can also click this button to generate another composition that matches the specified connections between the tiles.'
  );
  addIntro(
    document.querySelector('#js-drafts-save'),
    'You can save the generated composition to your device using this button. Note that when you open Tiles on a second device, you will not see the compositions you saved on the first device.'
  );
}

function addImagesIntro() {
  addIntro(
    document.querySelector('.image-inner'),
    'This image is a tile, a small building block of the large composition. You can upload your own image or keep this default one.'
  );
  addIntro(
    document.querySelector('.image:nth-child(2) .conn-button-2') ||
      document.querySelector('.image:nth-child(1) .conn-button-2'),
    'Click these buttons to specify how the tiles connect. In the resulting composition, a pink side of one tile must always be placed next to a pink side of a another tile, same for the green sides etc.'
  );
}

export default function init(state) {
  const intro = initIntroJs();
  addStaticIntro();
  State.registerImagesLoadedCallback(state, state => addImagesIntro());
  State.registerImagesChangedCallback(state, state => addImagesIntro());
  bindEvents(intro);
}
