<template>
  <div class="images">
    <input-image
      v-for="image in images"
      v-bind:image="image"
      v-bind:key="image.ref"
    ></input-image>
    <div class="image">
      <div class="image-inner image-inner-add">
        <button @click="newImage">add more</button>
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
    images: Array
  },
  methods: {
    newImage: function() {
      this.$root.state.newImage();
    }
  }
};
</script>
