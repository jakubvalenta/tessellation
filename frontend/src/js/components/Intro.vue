<template>
  <span>
    <span class="text-status" style="padding-right: 1em">first time here?</span>
    <button @click="start" class="button-secondary">show intro</button>
  </span>
</template>

<style lang="scss">
@import '../../css/_variables.scss';

body {
  .introjs-helperLayer {
    background: $color-background;
    opacity: 1;
  }
  .introjs-tooltip {
    color: $color-highlight;
    background: $color-background;
  }
  .introjs-arrow {
    &.top,
    &.top-right,
    &.top-middle {
      border-bottom-color: $color-background-light;
    }
    &.right,
    &.right-bottom {
      border-left-color: $color-background-light;
    }
    &.bottom,
    &.bottom-right,
    &.bottom-middle {
      border-top-color: $color-background-light;
    }
    &.left,
    &.left-bottom {
      border-right-color: $color-background-light;
    }
  }
  .introjs-button {
    text-shadow: none;

    &:hover {
      box-shadow: 0 0 0.1em $color-background-darker;
    }
  }
  .introjs-skipbutton,
  .introjs-prevbutton {
    margin-right: 0.5em;
  }
  .introjs-progress {
    background-color: $color-border;
  }
  .introjs-progressbar {
    background-color: $color-blue;
  }
}
</style>

<script>
import introJs from 'intro.js';

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
  methods: {
    start: function() {
      this.intro.start();
    }
  }
};
</script>

<style>
@import '../../../node_modules/intro.js/introjs.css';
</style>
