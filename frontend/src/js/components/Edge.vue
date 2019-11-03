<template>
  <button
    @click="shift"
    v-bind:class="classObject"
    title="change connection"
    v-bind:data-intro="
      image.index === 0 &&
        side === 2 &&
        'Click these buttons to specify how the tiles connect. In the resulting composition, a pink edge of one tile must always be placed next to a pink edge of a another tile, same for the green edges etc.'
    "
  >
    {{ image.connections[side] || '\u00b7' }}
  </button>
</template>

<script>
export default {
  name: 'Edge',
  props: {
    image: {
      type: Object,
      required: true
    },
    side: {
      type: Number,
      required: true
    }
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
