<template>
  <div class="images">
    <InputImage v-for="image in images" :image="image" :key="image.ref" />
    <div class="image">
      <div class="image-inner">
        <div class="tile-add">
          <button @click="newImage">add more</button>
        </div>
        <div class="image-controls">
          <button @click="clearImages" class="button-secondary">
            remove all
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import InputImage from './InputImage.vue';

export default {
  name: 'InputImages',
  components: {
    InputImage
  },
  props: {
    images: {
      type: Array,
      required: true
    }
  },
  methods: {
    newImage: function() {
      this.$root.state.newImage();
    },
    clearImages: function() {
      this.$root.state.clearImages();
    }
  }
};
</script>
