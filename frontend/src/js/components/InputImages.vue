<template>
  <div class="images">
    <input-image
      v-for="image in images"
      v-bind:index="image.index"
      v-bind:url="image.url"
      v-bind:imgRef="image.ref"
      v-bind:connections="image.connections"
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
