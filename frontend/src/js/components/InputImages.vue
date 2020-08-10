<template>
  <div class="images">
    <div v-for="image in images" :key="image.ref" class="image">
      <div
        class="image__inner"
        :data-intro="
          image.index === 0 &&
          'This image is a tile, a small building block of the large composition. You can upload your own image or keep this default one.'
        "
      >
        <Tile :image="image" :background="true">
          <Edge
            v-for="(connection, side) in image.connections"
            :image="image"
            :side="side"
            :key="`${image.ref}-${side}`"
          />
        </Tile>
        <div class="image__inner__controls">
          <InputControls :image="image" />
        </div>
      </div>
    </div>
    <div class="image">
      <div class="image__inner">
        <div class="image__inner__add">
          <button @click="newImage">add more</button>
        </div>
        <div class="image__inner__controls">
          <button @click="clearImages" class="button-secondary">
            remove all
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '../../css/_mixins.scss';
@import '../../css/_variables.scss';

.images {
  @extend %clearfix;
  margin-top: 1em;
  margin-left: -1em;
  margin-right: -1em;
}
.image {
  width: 33.33%;
  float: left;
  padding: 1em;
  box-sizing: border-box;
}
@media screen and (max-width: 1439px) {
  .image {
    width: 50%;
  }
}
.image__inner {
  position: relative;
  border: 1px solid $color-border;
  padding: 3em;
  padding-bottom: 1.5em;
}
.image__inner__controls {
  margin-top: 3em;
  margin-left: -3em;
  margin-right: -3em;
  text-align: center;
}
.image__inner__add {
  @include square;

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<script>
import Edge from './Edge.vue';
import InputControls from './InputControls.vue';
import Tile from './Tile.vue';

export default {
  name: 'InputImages',
  components: {
    Edge,
    InputControls,
    Tile
  },
  props: {
    images: {
      type: Array,
      required: true
    }
  },
  methods: {
    newImage: function () {
      this.$root.state.newImage();
    },
    clearImages: function () {
      this.$root.state.clearImages();
    }
  }
};
</script>
