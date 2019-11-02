<template>
  <div>
    <canvas class="composition" ref="main"></canvas>
  </div>
</template>

<script>
import * as CompositionLib from '../composition.js';
import { log } from '../log.js';

function render() {
  log(`Rendering composition on canvas, tileSize=${this.tileSize}`);
  CompositionLib.renderCompositionOnCanvas(
    this.composition,
    this.$refs.main,
    this.tileSize
  );
}

export default {
  name: 'CompositionCanvas',
  props: {
    composition: Array,
    tileSize: Number
  },
  watch: {
    composition: render,
    tileSize: render
  }
};
</script>
