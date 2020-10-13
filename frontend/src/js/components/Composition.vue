<template>
  <div class="composition" ref="inner">
    <canvas
      v-show="!loading && !error"
      class="composition__canvas"
      ref="canvas"
    ></canvas>
    <div v-show="loading" class="composition__message">
      <div class="box-alert box-info">calculating...</div>
    </div>
    <div v-show="error" class="composition__message">
      <div class="box-alert box-error">
        {{ error }}
      </div>
    </div>
    <div v-show="warn" class="box-alert box-error">{{ warn }}</div>
    <div class="composition__overlay">
      <div
        v-for="(rowTiles, i) in composition"
        :key="i"
        class="composition__overlay__row"
      >
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

<style lang="scss">
@import '../../css/_mixins';

.composition {
  position: relative;
  text-align: center;
}
.composition__canvas {
  max-width: 100%;
  max-height: 100%;
}
.composition__message {
  .box-alert {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.composition__overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;

  .mode-final & {
    visibility: hidden;
  }
}
.composition__overlay__row {
  display: flex;
}
@media screen and (max-width: 799px) {
  .composition {
    @include square();

    width: 100%;
  }

  .composition__canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}
</style>

<script>
import * as CompositionLib from '../composition.js';
import Tile from './Tile.vue';
import { log } from '../log.js';

function calcTileSize(composition, canvas, elContainer) {
  if (!composition) {
    return 0;
  }
  canvas.width = 0;
  canvas.height = 0;
  const compositionWidth = composition[0].length;
  const compositionHeight = composition[1].length;
  const containerWidth = elContainer.clientWidth;
  const containerHeight = elContainer.clientHeight;
  if (
    compositionWidth / compositionHeight >=
    containerWidth / containerHeight
  ) {
    return Math.floor(containerWidth / compositionWidth);
  }
  return Math.floor(containerHeight / compositionHeight);
}

function render() {
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
  log(`Rendering composition on canvas, tileSize=${tileSize}`);
  CompositionLib.renderCompositionOnCanvas(
    this.composition,
    this.$refs.canvas,
    tileSize
  );
  this.$root.store.setLoading(false);
}

export default {
  name: 'Composition',
  components: {
    Tile
  },
  props: {
    composition: {
      type: Array,
      required: true
    },
    edit: {
      type: Boolean,
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
    composition: function () {
      render.call(this);
    },
    edit: function () {
      render.call(this);
    }
  }
};
</script>
