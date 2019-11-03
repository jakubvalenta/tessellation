<template>
  <div>
    <div class="composition-container">
      <composition
        v-bind:composition="composition"
        v-bind:tileSize="tileSize"
        v-bind:loading="loading"
        v-bind:error="error"
        v-bind:warn="warn"
      ></composition>
    </div>
    <div class="composition-controls">
      <download
        v-bind:composition="composition"
        v-bind:naturalTileSize="naturalTileSize"
      ></download>
    </div>
  </div>
</template>

<script>
import Composition from '../components/Composition.vue';
import Download from '../components/Download.vue';

export default {
  name: 'app',
  components: {
    Composition,
    Download
  },
  data: function() {
    return this.$root.state;
  }
};
</script>

<style lang="scss">
@import '../../css/main.scss';
</style>
