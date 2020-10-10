<template>
  <div :class="['edge', `edge--${sideName}`]">
    <button
      v-for="(digit, digitIndex) in digits"
      @click="
        $emit('activate-digit', digitIndex);
        cycle(digitIndex);
      "
      @mouseover="$emit('activate-digit', digitIndex)"
      @mouseout="$emit('activate-digit', null)"
      :key="digitIndex"
      :class="{
        edge__button: true,
        [`edge__button--${digit}`]: digit !== null,
        active: activeDigitIndex === digitIndex
      }"
      title="change connection"
      :data-intro="
        image.index === 0 &&
        side === 2 &&
        'Click these buttons to specify how the tiles connect. In the resulting composition, a pink edge of one tile must always be placed next to a pink edge of a another tile, same for the green edges etc.'
      "
    >
      {{ digit || '+' }}
      <div class="edge__button__select">
        <button
          @click.stop="
            $emit('activate-digit', digitIndex);
            cycle(digitIndex);
          "
          :class="{
            edge__button: true,
            [`edge__button--${digit}`]: digit !== null,
            active: activeDigitIndex === digitIndex
          }"
        >
          {{ digit || '+' }}
        </button>
        <button
          v-for="(value, valueIndex) in CONNECTIONS"
          @click.stop="select(digitIndex, value)"
          :key="valueIndex"
          :class="{
            edge__button: true,
            'edge__button--digit': true,
            [`edge__button--${digit}`]: digit === value
          }"
        >
          {{ value }}
        </button>
        <button
          @click.stop="
            $emit('activate-digit', null);
            select(digitIndex, null);
          "
          class="edge__button"
        >
          x
        </button>
      </div>
    </button>
  </div>
</template>

<style lang="scss">
@import '../../css/_variables.scss';

.edge {
  position: absolute;
  display: flex;
  justify-content: center;
  z-index: 1;
}
.edge__button {
  position: relative;
  width: 2em;
  height: 2em;
  padding: 0;
  line-height: 2;
  color: $color-text-inverse;
  background: $color-white;
  box-shadow: 0 0 0.25em $color-background-dark;

  &:hover,
  &:active,
  &:focus {
    color: $color-text-inverse;
    background: $color-white;
    box-shadow: 0 0 0.25em $color-background-darker;
  }

  & + .edge__button {
    margin-left: 0.5em;
  }
}
.edge--left,
.edge--right {
  width: 2em;
  height: 100%;
  top: 0;
  margin-top: -1em;
  flex-direction: column;

  .edge__button + .edge__button {
    margin-left: 0;
    margin-top: 0.5em;
  }
}
.edge--left {
  left: -2em;
}
.edge--right {
  right: -2em;
}
.edge--top,
.edge--bottom {
  width: 100%;
  height: 2em;
  left: 0;
}
.edge--top {
  top: -2em;
}
.edge--bottom {
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
  .edge__button--#{$i} {
    background: $color;

    &:active,
    &:focus {
      background: $color;
    }
  }
}
.edge__button__select {
  position: absolute;
  display: none;
  padding: 0.5em;
  background: $color-background-darker;

  .edge__button + .edge__button {
    margin: 0;
  }

  .edge__button:hover &,
  .active & {
    display: flex;
  }
}
.edge--left,
.edge--right {
  .edge__button__select {
    top: -0.5em;
  }
}
.edge--left .edge__button__select {
  left: -0.5em;

  .edge__button + .edge__button {
    margin-left: 0.5em;
  }
}
.edge--right .edge__button__select {
  flex-direction: row-reverse;
  right: -0.5em;

  .edge__button + .edge__button {
    margin-right: 0.5em;
  }
}
.edge--top,
.edge--bottom {
  .edge__button__select {
    left: -0.5em;
  }
}
.edge--top .edge__button__select {
  flex-direction: column;
  top: -0.5em;

  .edge__button + .edge__button {
    margin-top: 0.5em;
  }
}
.edge--bottom .edge__button__select {
  flex-direction: column-reverse;
  bottom: -0.5em;

  .edge__button + .edge__button {
    margin-bottom: 0.5em;
  }
}

@media screen and (max-width: 799px) {
  .edge__button__select {
    .edge__button--digit {
      display: none;
    }
  }
}
</style>

<script>
import { CONNECTIONS, SIDE_NAMES } from '../composition.js';

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
    },
    activeDigitIndex: {
      type: Number
    }
  },
  data: function () {
    return {
      CONNECTIONS
    };
  },
  computed: {
    digits: function () {
      const digits = Array.from(
        (this.image.connections[this.side] || '').toString()
      ).map(s => +s);
      if (digits[digits.length - 1] !== null) {
        digits.push(null);
      }
      return digits;
    },
    sideName: function () {
      return SIDE_NAMES[this.side];
    }
  },
  methods: {
    _select: function (digitIndex, value) {
      if (value === null) {
        this.digits.splice(digitIndex, 1);
      } else {
        this.digits.splice(digitIndex, 1, value);
      }
      const connectionStr = this.digits
        .filter(digit => digit !== null)
        .join('');
      if (this.digits[this.digits.length - 1] !== null) {
        this.digits.push(null);
      }
      this.$root.state.setImageConnection(
        this.image,
        this.side,
        +connectionStr
      );
    },
    select: function (digitIndex, value) {
      this._select(digitIndex, value);
    },
    cycle: function (digitIndex) {
      const value =
        this.digits[digitIndex] === null
          ? CONNECTIONS[0]
          : (this.digits[digitIndex] % CONNECTIONS.length) + 1;
      this._select(digitIndex, value);
    }
  }
};
</script>
