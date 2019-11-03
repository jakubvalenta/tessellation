<template>
  <div class="composition-controls">
    <p class="composition-shuffle">
      <button
        @click="shuffle"
        data-intro="The composition is automatically generated when you change the input images. You can also click this button to generate another composition that matches the specified connections between the tiles."
      >
        shuffle
      </button>
      <Download
        :composition="composition"
        :natural-tile-size="naturalTileSize"
      ></Download>
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
      <button @click="showConnections" class="button-secondary">
        <span v-show="modeFinal">show connections</span>
        <span v-show="!modeFinal">hide connections</span>
      </button>
    </p>
  </div>
</template>

<script>
import Download from './Download.vue';

export default {
  name: 'Settings',
  components: {
    Download
  },
  props: {
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
      type: Number,
      required: true
    }
  },
  data: function() {
    return {
      modeFinal: true
    };
  },
  methods: {
    shuffle: function() {
      this.$root.state.shuffleTiles();
    },
    showConnections: function() {
      this.modeFinal = !this.modeFinal;
      document.body.classList.toggle('mode-final', this.modeFinal);
    },
    changeWidth: function(evt) {
      this.$root.state.setSize({ width: evt.currentTarget.value });
    },
    changeHeight: function(evt) {
      this.$root.state.setSize({ height: evt.currentTarget.value });
    }
  }
};
</script>
