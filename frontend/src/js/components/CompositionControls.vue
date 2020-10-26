<template>
  <div class="composition-controls">
    <p class="composition-controls__shuffle">
      <button
        @click="shuffle"
        data-intro="The composition is automatically generated when you change the input images. You can also click this button to generate another composition that matches the specified connections between the tiles."
      >
        shuffle
      </button>
    </p>
    <p class="composition-controls__advanced">
      <a
        href="javascript:void(0)"
        @click="download"
        class="button button-secondary"
        download="composition.png"
        title="Render the composition as a PNG. The size of each tile will be equal to the width of the first input image but not larger than 500px."
      >
        download
      </a>
      <button @click="$emit('toggle-overlay')" class="button-secondary">
        <span v-show="!showOverlay">show edges</span>
        <span v-show="showOverlay">hide edges</span>
      </button>
    </p>
  </div>
</template>

<style lang="scss">
.composition-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 1em;
  margin-bottom: 1em;
  padding: 0.1em;
  padding-bottom: 0;

  p {
    margin: 0;
  }
}
.composition-controls__shuffle {
  grid-column: 2;
  grid-row: 1;
  text-align: center;
}
.composition-controls__advanced {
  grid-column: 3;
  grid-row: 1;
  text-align: right;

  a + button {
    margin-left: 0.5em;
  }
}
</style>

<script>
export default {
  name: 'CompositionControls',
  props: {
    showOverlay: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    shuffle: function () {
      this.$root.store.shuffleTiles();
    },
    download: function (evt) {
      evt.target.href = this.$root.store.getCanvasDataUrl();
    }
  }
};
</script>
