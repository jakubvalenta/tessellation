<template>
  <span>first time here? <button @click="start">show intro</button></span>
</template>

<script>
import introJs from 'intro.js';

function addIntro(el, text) {
  el && el.setAttribute('data-intro', text);
}

export default {
  name: 'Intro',
  data: function() {
    return {
      intro: introJs().setOptions({
        showBullets: false,
        showProgress: true
      })
    };
  },
  watch: {
    images: function() {
      addIntro(
        document.querySelector('.image-inner'),
        'This image is a tile, a small building block of the large composition. You can upload your own image or keep this default one.'
      );
      addIntro(
        document.querySelector('.image:nth-child(2) .conn-button-2') ||
          document.querySelector('.image:nth-child(1) .conn-button-2'),
        'Click these buttons to specify how the tiles connect. In the resulting composition, a pink edge of one tile must always be placed next to a pink edge of a another tile, same for the green edges etc.'
      );
    }
  },
  mounted: function() {
    addIntro(
      document.querySelector('#js-shuffle'),
      'The composition is automatically generated when you change the input images. You can also click this button to generate another composition that matches the specified connections between the tiles.'
    );
    addIntro(
      document.querySelector('#js-drafts-save'),
      'You can save the generated composition to your device using this button. Note that when you open Tessellation on a second device, you will not see the compositions you saved on the first device.'
    );
  },
  methods: {
    start: function() {
      this.intro.start();
    }
  }
};
</script>
