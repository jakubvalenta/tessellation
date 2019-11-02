<template>
  <div class="image">
    <div class="image-inner">
      <tile
        v-bind:index="index"
        v-bind:url="url"
        v-bind:connections="connections"
        v-bind:rotation="0"
        v-bind:background="true"
      >
        <edge
          v-for="(connection, side) in connections"
          v-bind:imgRef="imgRef"
          v-bind:connection="connection"
          v-bind:side="side"
          v-bind:key="side"
        ></edge>
      </tile>
      <div class="image-controls">
        <label v-bind:for="name" class="label-file">upload image</label>
        <input
          v-bind:id="name"
          type="file"
          accept="image/*"
          class="input-file"
          @change="changeImage"
        />
        <button @click="deleteImage" class="image-delete">x</button>
      </div>
    </div>
  </div>
</template>

<script>
import Edge from './Edge.vue';
import Tile from './Tile.vue';

export default {
  name: 'InputImage',
  components: {
    Edge,
    Tile
  },
  props: {
    index: Number,
    url: String,
    imgRef: String,
    connections: Array
  },
  data: function() {
    const reader = new window.FileReader();
    reader.addEventListener('load', () => {
      const url = reader.result;
      this.$root.state.updateImage(this.imgRef, url);
    });
    return {
      reader
    };
  },
  computed: {
    name: function() {
      return `image-upload-${this.imgRef}`;
    }
  },
  methods: {
    changeImage: function(evt) {
      const file = evt.currentTarget.files[0];
      if (file) {
        this.reader.readAsDataURL(file);
      }
    },
    deleteImage: function() {
      this.$root.state.deleteImage(this.imgRef);
    }
  }
};
</script>
