<template>
  <button @click="shift" v-bind:class="classObject" title="change connection">
    {{ connection || '\u00b7' }}
  </button>
</template>

<script>
export default {
  name: 'Edge',
  props: {
    imgRef: String,
    connection: Number,
    side: Number
  },
  computed: {
    classObject: function() {
      const classNames = [
        'conn-button',
        `conn-button-${this.side}`,
        `conn-${this.connection}`
      ];
      return Object.fromEntries(classNames.map(className => [className, true]));
    }
  },
  methods: {
    shift: function() {
      this.$root.state.shiftImageConnection(this.imgRef, this.side);
    }
  }
};
</script>
