<template>
  <div class="composition" ref="container">
    <div class="composition__inner" :class="{ loading: loading }" ref="inner">
      <canvas
        v-show="!loading && !error"
        class="composition__canvas"
        ref="canvas"
      ></canvas>
      <div v-show="loading" class="box-alert box-info">loading...</div>
      <div v-show="error" class="box-alert box-error">{{ error }}</div>
      <div v-if="showOverlay" class="composition__overlay">
        <div
          v-for="(rowTiles, i) in $root.store.state.composition"
          :key="i"
          class="composition__overlay__row"
        >
          <CompositionTile
            v-for="(tile, j) in rowTiles"
            :image="tile && tile.image"
            :rotation="tile && tile.rotation"
            :key="j"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '../../css/_mixins';

.composition {
  text-align: center;
}
.composition__inner {
  position: relative;
  display: inline-block;

  &.loading {
    width: 100%;
    height: 100%;
  }

  .box-alert {
    width: 100%;
    height: 100%;
    padding: 1em;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }
}
.composition__canvas {
  width: 100%;
  height: 100%;
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
  .composition__inner {
    width: auto !important;
    height: auto !important;
  }
}
</style>

<script>
import CompositionTile from './CompositionTile.vue';

export default {
  name: 'TessellationComposition',
  components: {
    CompositionTile
  },
  props: {
    loading: {
      type: Boolean,
      required: true
    },
    showOverlay: {
      type: Boolean,
      required: true
    },
    error: String
  },
  mounted() {
    this.$root.store.setElements(
      this.$refs.container,
      this.$refs.inner,
      this.$refs.canvas
    );
  }
};
</script>
