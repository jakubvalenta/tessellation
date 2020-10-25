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

export default {
  name: 'Composition',
  components: {
    Tile
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
    error: String,
    warn: String
  },
  mounted() {
    this.$root.store.setElements(this.$refs.canvas, this.$refs.inner);
  }
};
</script>
p
