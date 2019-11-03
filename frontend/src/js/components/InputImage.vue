<template>
  <div class="image">
    <div
      class="image-inner"
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
          :key="side"
        ></Edge>
      </Tile>
      <div class="image-controls">
        <label :for="name" class="label-file">upload image</label>
        <input
          :id="name"
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
    image: {
      type: Object,
      required: true
    }
  },
  data: function() {
    const reader = new window.FileReader();
    reader.addEventListener('load', () => {
      const url = reader.result;
      this.$root.state.updateImage(this.image, url);
    });
    return {
      reader
    };
  },
  computed: {
    name: function() {
      return `image-upload-${this.image.ref}`;
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
      this.$root.state.deleteImage(this.image);
    }
  }
};
</script>
