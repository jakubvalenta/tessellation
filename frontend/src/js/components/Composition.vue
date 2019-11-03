<template>
  <div class="composition-inner" ref="main">
    <composition-canvas
      v-bind:composition="composition"
      v-bind:tileSize="tileSize"
      v-show="!loading && !error"
      ref="canvas"
    ></composition-canvas>
    <div v-show="loading" class="composition-message">
      <div class="alert box-info">Processing...</div>
    </div>
    <div v-show="error" class="composition-message">
      <div class="alert box-error">
        {{ error }}
      </div>
    </div>
    <div v-show="warn" class="alert box-error">{{ warn }}</div>
    <div class="composition-overlay">
      <div v-for="rowTiles in composition" class="tile-row">
        <tile
          v-for="(tile, index) in rowTiles"
          v-bind:image="tile && tile.image"
          v-bind:rotation="tile && tile.rotation"
          v-bind:key="index"
        ></tile>
      </div>
    </div>
  </div>
</template>

<script>
import CompositionCanvas from './CompositionCanvas.vue';
import Tile from './Tile.vue';
import { log } from '../log.js';

function calcTileSize(composition, canvas, elContainer) {
  if (!composition) {
    return 0;
  }
  const width = composition[0].length;
  canvas.width = 0;
  canvas.height = 0;
  const tileSize = Math.round(elContainer.clientWidth / width);
  return tileSize;
}

export default {
  name: 'Composition',
  components: {
    CompositionCanvas,
    Tile
  },
  props: {
    composition: {
      type: Array,
      required: true
    },
    tileSize: {
      type: Number,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
    error: String,
    warn: String
  },
  watch: {
    composition: function() {
      if (!this.composition.length) {
        return;
      }
      const tileSize = calcTileSize(
        this.composition,
        this.$refs.canvas,
        this.$refs.main.parentNode
      );
      log(`Calculated tile size ${tileSize}`);
      this.$root.state.setTileSize(tileSize);
      this.$root.state.setLoading(false);
    }
  }
};
</script>
