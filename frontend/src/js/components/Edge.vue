<template>
  <button
    @click="shift"
    :class="classObject"
    title="change connection"
    :data-intro="
      image.index === 0 &&
      side === 2 &&
      'Click these buttons to specify how the tiles connect. In the resulting composition, a pink edge of one tile must always be placed next to a pink edge of a another tile, same for the green edges etc.'
    "
  >
    {{ image.connections[side] || '\u00b7' }}
  </button>
</template>

<style lang="scss">
@import '../../css/_variables.scss';

.edge-button {
  position: absolute;
  padding: 0;
  width: 2em;
  height: 2em;
  line-height: 2;
  color: $color-text-inverse;
  background: $color-white;
  box-shadow: 0 0 0.25em $color-background-dark;

  &:hover,
  &:active,
  &:focus {
    color: $color-text-inverse;
    box-shadow: 0 0 0.25em $color-background-darker;
  }
}
.edge-button--left,
.edge-button--right {
  top: 50%;
  margin-top: -1em;
}
.edge-button--left {
  left: -2em;
}
.edge-button--right {
  right: -2em;
}
.edge-button--top,
.edge-button--bottom {
  left: 50%;
  margin-left: -1em;
}
.edge-button--top {
  top: -2em;
}
.edge-button--bottom {
  bottom: -2em;
}
$connections: (
  1: $color-red,
  2: $color-green,
  3: $color-blue,
  4: $color-orange,
  5: $color-yellow
);
@each $i, $color in $connections {
  .edge-button--#{$i} {
    background: $color;

    &:hover,
    &:active,
    &:focus {
      background: $color;
    }
  }
}
</style>

<script>
import { SIDE_NAMES } from '../composition.js';

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
    classObject: function () {
      const classNames = [
        'edge-button',
        `edge-button--${SIDE_NAMES[this.side]}`,
        `edge-button--${this.image.connections[this.side]}`
      ];
      return Object.fromEntries(classNames.map(className => [className, true]));
    }
  },
  methods: {
    shift: function () {
      this.$root.state.shiftImageConnection(this.image, this.side);
    }
  }
};
</script>
