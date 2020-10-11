<template>
  <div>
    <label :for="name" class="label-file">upload image</label>
    <input
      :id="name"
      type="file"
      accept="image/*"
      class="input-file"
      @change="changeImage"
    />
    <button @click="deleteImage" class="button-close" title="remove image">
      x
    </button>
  </div>
</template>

<script>
export default {
  name: 'InputControls',
  props: {
    image: {
      type: Object,
      required: true
    }
  },
  data: function () {
    const reader = new window.FileReader();
    reader.addEventListener('load', () => {
      const url = reader.result;
      this.$root.store.updateImage(this.image, url);
    });
    return {
      reader
    };
  },
  computed: {
    name: function () {
      return `image-upload-${this.image.ref}`;
    }
  },
  methods: {
    changeImage: function (evt) {
      const file = evt.currentTarget.files[0];
      if (file) {
        this.reader.readAsDataURL(file);
      }
    },
    deleteImage: function () {
      this.$root.store.deleteImage(this.image);
    }
  }
};
</script>
