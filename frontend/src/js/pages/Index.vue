<template>
  <div id="app">
    <div class="sections">
      <h2 class="sr-only">Create new composition</h2>
      <div class="section section-input">
        <h2 class="section-heading">Input</h2>
        <InputImages :images="images"></InputImages>
      </div>
      <div class="section section-composition">
        <h2 class="sr-only">Composition</h2>
        <div class="composition-container">
          <Composition
            :composition="composition"
            :tile-size="tileSize"
            :loading="loading"
            :error="error"
            :warn="warn"
          ></Composition>
        </div>
        <Settings
          :width="size.width"
          :height="size.height"
          :composition="composition"
          :natural-tile-size="naturalTileSize"
        ></Settings>
      </div>
      <div class="section section-storage">
        <Storage></Storage>
      </div>
    </div>
  </div>
</template>

<script>
import Composition from '../components/Composition.vue';
import InputImages from '../components/InputImages.vue';
import Settings from '../components/Settings.vue';
import Storage from '../components/Storage.vue';

export default {
  name: 'app',
  components: {
    Composition,
    InputImages,
    Settings,
    Storage
  },
  data: function() {
    return this.$root.state;
  }
};
</script>

<style lang="scss">
@import '../../css/main.scss';
</style>
