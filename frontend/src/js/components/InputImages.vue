<template>
  <div class="images">
    <InputImage
      v-for="image in images"
      v-bind:image="image"
      v-bind:key="image.ref"
    ></InputImage>
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
    images: {
      type: Array,
      required: true
    }
  },
  methods: {
    newImage: function() {
      this.$root.state.newImage();
    }
  }
};
</script>
