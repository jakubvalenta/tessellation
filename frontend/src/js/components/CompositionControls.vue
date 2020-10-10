<template>
  <div class="composition-controls">
    <p class="composition-shuffle">
      <button
        v-show="edit"
        @click="shuffle"
        data-intro="The composition is automatically generated when you change the input images. You can also click this button to generate another composition that matches the specified connections between the tiles."
      >
        shuffle
      </button>
      <a
        href="javascript:void(0)"
        @click="download"
        download="composition.png"
        class="button button-link"
        title="Render the composition as a PNG. The size of each tile will be equal to the width of the first input image but not larger than 500px."
        >download</a
      >
    </p>
    <form
      v-show="edit"
      action="javascript:void(0)"
      class="composition-settings"
    >
      <p>
        <span class="sr-only">Size:</span>
        <label for="js-width" class="sr-only">columns</label>
        <input
          type="number"
          :value="width"
          @change="changeWidth"
          min="1"
          class="input-number"
        />
        x
        <label for="js-height" class="sr-only">rows</label>
        <input
          type="number"
          :value="height"
          @change="changeHeight"
          min="1"
          class="input-number"
        />
      </p>
    </form>
    <p v-show="edit">
      <button @click="showConnections" class="button-secondary">
        <span v-show="modeFinal">show edges</span>
        <span v-show="!modeFinal">hide edges</span>
      </button>
    </p>
  </div>
</template>

<style lang="scss">
.composition-controls {
  display: flex;
  justify-content: space-between;
  margin: 1em 0;

  p {
    margin: 0;
  }
}
.composition-shuffle {
  width: 33.33%;
}
.composition-settings {
  width: 33.33%;
}
</style>

<script>
import * as CompositionLib from '../composition.js';
import * as HTML from '../html.js';
import { error, log } from '../log.js';

export default {
  name: 'CompositionControls',
  props: {
    edit: {
      type: Boolean,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    composition: {
      type: Array,
      required: true
    },
    naturalTileSize: {
      type: Number
    }
  },
  data: function () {
    return {
      modeFinal: true,
      canvas: document.createElement('canvas')
    };
  },
  methods: {
    shuffle: function () {
      this.$root.state.shuffleTiles();
    },
    download: function (evt) {
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
    },
    showConnections: function () {
      this.modeFinal = !this.modeFinal;
      document.body.classList.toggle('mode-final', this.modeFinal);
    },
    changeWidth: function (evt) {
      this.$root.state.setSize({ width: evt.currentTarget.value });
    },
    changeHeight: function (evt) {
      this.$root.state.setSize({ height: evt.currentTarget.value });
    }
  }
};
</script>
