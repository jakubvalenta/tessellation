<template>
  <button @click="shift" v-bind:class="classObject" title="change connection">
    {{ image.connections[side] || '\u00b7' }}
  </button>
</template>

<script>
export default {
  name: 'Edge',
  props: {
    image: Object,
    side: Number
  },
  computed: {
    classObject: function() {
      const classNames = [
        'conn-button',
        `conn-button-${this.side}`,
        `conn-${this.image.connections[this.side]}`
      ];
      return Object.fromEntries(classNames.map(className => [className, true]));
    }
  },
  methods: {
    shift: function() {
      this.$root.state.shiftImageConnection(this.image, this.side);
    }
  }
};
</script>
