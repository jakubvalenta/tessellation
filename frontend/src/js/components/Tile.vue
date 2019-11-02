<template>
  <div v-bind:class="outerClassObject" v-bind:style="outerStyleObject">
    <div v-bind:class="innerClassObject">
      <div class="tile-text">
        {{ index + 1 }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Tile',
  props: {
    index: Number,
    url: String,
    connections: Array,
    rotation: Number,
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
      const classNames = [
        'tile-inner',
        ...this.connections.map((connection, i) => `conn-${i}-${connection}`)
      ];
      return Object.fromEntries(classNames.map(className => [className, true]));
    },
    outerStyleObject: function() {
      if (!this.background || !this.url) {
        return {};
      }
      return {
        backgroundImage: `url('${this.url}')`
      };
    }
  }
};
</script>
