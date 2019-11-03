<template>
  <canvas class="composition" ref="canvas"></canvas>
</template>

<script>
import * as CompositionLib from '../composition.js';
import { log } from '../log.js';

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
    tileSize: function() {
      log(
        'Tile size changed',
        +`rendering composition on canvas, tileSize=${this.tileSize}`
      );
      CompositionLib.renderCompositionOnCanvas(
        this.composition,
        this.$refs.canvas,
        this.tileSize
      );
    }
  }
};
</script>
