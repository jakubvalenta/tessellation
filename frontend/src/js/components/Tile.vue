<template>
  <div v-bind:class="outerClassObject" v-bind:style="outerStyleObject">
    <div v-bind:class="innerClassObject">
      <div class="tile-text">
        {{ image ? image.index + 1 : '' }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Tile',
  props: {
    image: {
      type: Object,
      required: false
    },
    rotation: {
      type: Number,
      default: 0
    },
    background: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    outerClassObject: function() {
      const classNames = ['tile', `rot-${this.rotation}`];
      return Object.fromEntries(classNames.map(className => [className, true]));
    },
    innerClassObject: function() {
      if (!this.image) {
        return {};
      }
      const classNames = [
        'tile-inner',
        ...this.image.connections.map(
          (connection, i) => `conn-${i}-${connection}`
        )
      ];
      return Object.fromEntries(classNames.map(className => [className, true]));
    },
    outerStyleObject: function() {
      if (!this.background || !this.image || !this.image.url) {
        return {};
      }
      return {
        backgroundImage: `url('${this.image.url}')`
      };
    }
  }
};
</script>
