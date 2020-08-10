<template>
  <canvas class="composition__canvas" ref="canvas"></canvas>
</template>

<style lang="scss">
.composition__canvas {
  width: 100%;
}
</style>

<script>
import * as CompositionLib from '../composition.js';
import { log } from '../log.js';

export default {
  name: 'CompositionCanvas',
  props: {
    compositionToRender: {
      type: Object,
      required: true
    }
  },
  watch: {
    compositionToRender: function () {
      log(
        'State of compositionToRender changed, rendering composition on ' +
          `canvas, tileSize=${this.compositionToRender.tileSize}`
      );
      CompositionLib.renderCompositionOnCanvas(
        this.compositionToRender.composition,
        this.$refs.canvas,
        this.compositionToRender.tileSize
      );
    }
  }
};
</script>
