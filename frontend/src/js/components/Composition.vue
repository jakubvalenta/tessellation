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
import Tile from './Tile.vue';

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
      const tileSize = this.calcTileSize(
        this.$refs.canvas,
        this.$refs.inner.parentNode
      );
      this.$root.store.renderCompositionOnCanvas(this.$refs.canvas, tileSize);
    }
  },
  methods: {
    calcTileSize(canvas, containerEl) {
      canvas.width = 0;
      canvas.height = 0;
      const containerWidth = containerEl.clientWidth;
      const containerHeight = containerEl.clientHeight;
      if (this.width / this.height >= containerWidth / containerHeight) {
        return Math.floor(containerWidth / this.width);
      }
      return Math.floor(containerHeight / this.height);
    }
  }
};
</script>
