<template>
  <div class="composition-controls">
    <p class="composition-shuffle">
      <button @click="shuffle">shuffle</button>
      <download
        v-bind:composition="composition"
        v-bind:naturalTileSize="naturalTileSize"
      ></download>
    </p>
    <form action="javascript:void(0)" class="composition-settings">
      <!-- TODO {% csrf_token %} -->
      <p>
        <span class="sr-only">Size:</span>
        <label for="js-width" class="sr-only">columns</label>
        <input
          type="number"
          v-bind:value="width"
          @change="changeWidth"
          min="1"
          class="input-number"
        />
        x
        <label for="js-height" class="sr-only">rows</label>
        <input
          type="number"
          v-bind:value="height"
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
    size: Object,
    composition: Array,
    naturalTileSize: Number
  },
  data: function() {
    return {
      width: this.size.width,
      height: this.size.height,
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
      this.width = evt.currentTarget.value;
      this.$root.state.setSize({ width: this.width });
    },
    changeHeight: function(evt) {
      this.height = evt.currentTarget.value;
      this.$root.state.setSize({ height: this.height });
    }
  }
};
</script>
