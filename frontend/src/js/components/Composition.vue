<template>
  <div class="composition-inner" ref="inner">
    <CompositionCanvas
      :compositionToRender="compositionToRender"
      v-show="!loading && !error"
      ref="canvas"
    />
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
      <div v-for="(rowTiles, i) in composition" :key="i" class="tile-row">
        <Tile
          v-for="(tile, j) in rowTiles"
          :image="tile && tile.image"
          :rotation="tile && tile.rotation"
          :key="j"
        />
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
    compositionToRender: {
      type: Object,
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
    // TODO: We could also just store the container width in the global state
    composition: function() {
      log('Composition changed');
      if (!this.composition.length) {
        return;
      }
      const elContainer = this.$refs.inner.parentNode;
      const tileSize = calcTileSize(
        this.composition,
        this.$refs.canvas,
        elContainer
      );
      log(`Calculated tile size ${tileSize}`);
      this.$root.state.setCompositionToRender(this.composition, tileSize);
    }
  }
};
</script>
