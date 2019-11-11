<template>
  <div :class="outerClassObject" :style="outerStyleObject">
    <div :class="innerClassObject">
      <div class="tile__text">
        {{ image ? image.index + 1 : '' }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<style lang="scss">
@import '../../css/_mixins.scss';
@import '../../css/_variables.scss';

.tile {
  @include square;

  flex-grow: 1;
  position: relative;
}
.tile--with-bg {
  background-color: $color-white;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  box-shadow: 0 0 0.5em $color-background-dark;
}
.tile__inner {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  box-sizing: border-box;
  text-align: center;
  border: 0.5em solid transparent;

  .mode-final .tile--with-bg & {
    visibility: hidden;
  }
}
.tile__text {
  position: absolute;
  width: 2em;
  height: 2em;
  left: 50%;
  top: 50%;
  margin-top: -1em;
  margin-left: -1em;
  line-height: 2em;
  text-align: center;
  color: $color-highlight;
  background: $color-background-darker;
  border-radius: 100%;
}
$rotations: (
  1: -0.25turn,
  2: -0.5turn,
  3: -0.75turn
);
@each $i, $rotation in $rotations {
  .rot--#{$i} {
    transform: rotate($rotation);

    .tile__text {
      transform: rotate(-$rotation);
    }
  }
}
$sides: (
  0: 'left',
  1: 'top',
  2: 'right',
  3: 'bottom'
);
$connections: (
  1: $color-red,
  2: $color-green,
  3: $color-blue,
  4: $color-orange,
  5: $color-yellow
);
@each $i, $side in $sides {
  @each $j, $color in $connections {
    .edge--#{$i}-#{$j} {
      border-#{$side}-color: $color;
    }
  }
}
</style>

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
      const classNames = ['tile', `rot--${this.rotation}`];
      if (this.background) {
        classNames.push('tile--with-bg');
      }
      return Object.fromEntries(classNames.map(className => [className, true]));
    },
    innerClassObject: function() {
      if (!this.image) {
        return {};
      }
      const classNames = [
        'tile__inner',
        ...this.image.connections.map(
          (connection, i) => `edge--${i}-${connection}`
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
