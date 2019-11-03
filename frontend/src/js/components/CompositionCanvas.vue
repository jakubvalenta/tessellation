<template>
  <canvas class="composition" ref="canvas"></canvas>
</template>

<script>
import * as CompositionLib from '../composition.js';
import { log } from '../log.js';

function render() {
  log(`Rendering composition on canvas, tileSize=${this.tileSize}`);
  CompositionLib.renderCompositionOnCanvas(
    this.composition,
    this.$refs.canvas,
    this.tileSize
  );
}

export default {
  name: 'CompositionCanvas',
  props: {
    composition: {
      type: Array,
      required: true
    },
    tileSize: {
      type: Number,
      required: true
    }
  },
  watch: {
    composition: render,
    tileSize: render
  }
};
</script>
