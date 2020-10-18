<template>
  <div class="composition-controls">
    <p class="composition-shuffle">
      <button
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
    <form action="javascript:void(0)" class="composition-settings">
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
    <p>
      <button @click="$emit('toggle-overlay')" class="button-secondary">
        <span v-show="!showOverlay">show edges</span>
        <span v-show="showOverlay">hide edges</span>
      </button>
    </p>
  </div>
</template>

<style lang="scss">
.composition-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1em;
  padding: 0.1em;
  padding-bottom: 0;

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
import * as HTML from '../html.js';

export default {
  name: 'CompositionControls',
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    showOverlay: {
      type: Boolean,
      required: true
    },
    naturalTileSize: {
      type: Number
    }
  },
  methods: {
    shuffle: function () {
      this.$root.store.shuffleTiles();
    },
    download: function (evt) {
      const canvas = document.createElement('canvas');
      if (
        this.$root.store.renderCompositionOnCanvas(canvas, this.naturalTileSize)
      ) {
        evt.target.href = HTML.canvasToDataUrl(canvas);
      }
    },
    changeWidth: function (evt) {
      this.$root.store.setSize({ width: evt.currentTarget.value });
    },
    changeHeight: function (evt) {
      this.$root.store.setSize({ height: evt.currentTarget.value });
    }
  }
};
</script>
