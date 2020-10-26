<template>
  <div>
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
              v-on:activate-digit="
                digitIndex => activateDigit(image, side, digitIndex)
              "
              :activeDigitIndex="
                activeImage === image && activeSide === side
                  ? activeDigitIndex
                  : null
              "
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
          <div class="image__inner__controls" style="height: 2.5em"></div>
        </div>
      </div>
    </div>
    <a
      href="javascript:void(0)"
      @click="clearImages"
      class="button button-link"
    >
      remove all
    </a>
  </div>
</template>

<style lang="scss">
@import '../../css/_mixins.scss';
@import '../../css/_variables.scss';

.images {
  @extend %clearfix;
  margin-top: 0.5em;
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

@media screen and (max-width: 799px) {
  .images {
    margin-left: -0.5em;
    margin-right: -0.5em;
  }
  .image {
    padding: 0.5em;
  }
  .image__inner {
    padding: 2.5em;
    padding-bottom: 0.5em;
  }
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
  data: function () {
    return {
      activeImage: null,
      activeSide: null,
      activeDigitIndex: null
    };
  },
  methods: {
    newImage: function () {
      this.$root.store.newImage();
    },
    clearImages: function () {
      return this.$root.store.clearImages();
    },
    activateDigit: function (image, side, digitIndex) {
      this.activeImage = image;
      this.activeSide = side;
      this.activeDigitIndex = digitIndex;
    }
  }
};
</script>
