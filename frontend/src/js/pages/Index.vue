<template>
  <div id="app">
    <div class="sections">
      <h2 class="sr-only">Create new composition</h2>
      <div class="section section-input">
        <h2 class="section-heading">Input</h2>
        <input-images v-bind:images="images"></input-images>
      </div>
      <div class="section section-composition">
        <h2 class="sr-only">Composition</h2>
        <div class="composition-container">
          <composition
            v-bind:composition="composition"
            v-bind:tileSize="tileSize"
            v-bind:loading="loading"
          ></composition>
        </div>
        <settings
          v-bind:size="size"
          v-bind:composition="composition"
          v-bind:naturalTileSize="naturalTileSize"
        ></settings>
      </div>
      <div class="section section-storage">
        <!--
        <storage></storage>
-->
      </div>
    </div>
  </div>
</template>

<script>
import Composition from '../components/Composition.vue'; // eslint-disable-line no-unused-vars
import InputImages from '../components/InputImages.vue';
import Intro from '../components/Intro.vue';
import Settings from '../components/Settings.vue';
// import Storage from '../components/Storage.vue';

export default {
  name: 'app',
  components: {
    Composition,
    InputImages,
    Intro,
    Settings
    // Storage
  },
  data: function() {
    return this.$root.state;
  }
};
</script>

<style lang="scss">
@import '../../css/main.scss';
</style>
