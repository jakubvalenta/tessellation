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
    <div v-if="showOverlay" class="composition__overlay">
      <div
        v-for="(rowTiles, i) in $root.store.state.composition"
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
.composition__message {
  .box-alert {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    padding: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }
}
.composition__overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.composition__overlay__row {
  display: flex;
}
@media screen and (min-width: 800px) {
  .composition {
    min-height: 100%;
  }
}
</style>

<script>
import Tile from './Tile.vue';

function calcTileSize(canvas, containerEl, [width, height]) {
  canvas.width = 0;
  canvas.height = 0;
  const containerWidth = containerEl.clientWidth;
  const containerHeight = containerEl.clientHeight;
  if (
    containerHeight < 30 || // FIXME: Magic constant
    width / height >= containerWidth / containerHeight
  ) {
    return Math.floor(containerWidth / width);
  }
  return Math.floor(containerHeight / height);
}

export default {
  name: 'Composition',
  components: {
    Tile
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
    edit: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
    showOverlay: {
      type: Boolean,
      required: true
    },
    error: String,
    warn: String
  },
  watch: {
    loading: function () {
      if (this.loading || !this.width) {
        return;
      }
      this.$nextTick(() => {
        const tileSize = calcTileSize(this.$refs.canvas, this.$refs.inner, [
          this.width,
          this.height
        ]);
        this.$root.store.renderCompositionOnCanvas(this.$refs.canvas, tileSize);
      });
    }
  }
};
</script>
