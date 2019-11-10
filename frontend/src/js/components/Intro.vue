<template>
  <span
    >editing for the first time?
    <button @click="start">show intro</button></span
  >
</template>

<script>
import introJs from 'intro.js';

export default {
  name: 'Intro',
  data: function() {
    return {
      intro: introJs().setOptions({
        showBullets: false,
        showProgress: true
      })
    };
  },
  methods: {
    start: function() {
      this.intro.start();
    }
  }
};
</script>

<style>
@import '../../../node_modules/intro.js/introjs.css';
</style>
