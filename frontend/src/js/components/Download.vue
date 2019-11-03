<template>
  <a
    href="javascript:void(0)"
    download="composition.png"
    title="Render the composition as a PNG. The size of each tile will be equal to the width of the first input image but not larger than 500px."
    @click="download"
    >download</a
  >
</template>

<script>
import * as CompositionLib from '../composition.js';
import * as HTML from '../html.js';
import { error, log } from '../log.js';

export default {
  name: 'Download',
  props: {
    composition: {
      type: Array,
      required: true
    },
    naturalTileSize: {
      type: Number,
      required: true
    }
  },
  data: function() {
    return {
      canvas: document.createElement('canvas')
    };
  },
  methods: {
    download: function(evt) {
      if (!this.composition.length || !this.naturalTileSize) {
        error("Can't download composition, it's not rendered.");
        return;
      }
      log(
        `Rendering composition to download, tileSize=${this.naturalTileSize}`
      );
      CompositionLib.renderCompositionOnCanvas(
        this.composition,
        this.canvas,
        this.naturalTileSize
      );
      evt.target.href = HTML.canvasToDataUrl(this.canvas);
    }
  }
};
</script>
