<template>
  <div>
    <div class="composition-container">
      <Composition
        :composition="composition"
        :tile-size="tileSize"
        :loading="loading"
        :error="error"
        :warn="warn"
      />
    </div>
    <div class="composition-controls">
      <Download
        :composition="composition"
        :natural-tile-size="naturalTileSize"
      />
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
