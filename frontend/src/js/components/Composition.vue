<template>
  <div class="composition-inner" ref="main">
    <composition-canvas
      v-bind:composition="composition"
      v-bind:tileSize="tileSize"
      v-show="!loading"
      ref="canvas"
    ></composition-canvas>
    <div v-show="!loading && !composition" class="composition-error">
      <div class="alert-error">impossible connections defined</div>
    </div>
    <div v-show="loading" class="composition-loading">
      loading
    </div>
    <div class="composition-overlay">
      <div v-for="rowTiles in composition" class="row">
        <tile
          v-for="(tile, index) in rowTiles"
          v-bind:image="tile.image"
          v-bind:rotation="tile.rotation"
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
    composition: Array,
    tileSize: Number,
    loading: Boolean
  },
  watch: {
    composition: function() {
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
