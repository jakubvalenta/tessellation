<template>
  <div>
    <div class="composition-container">
      <composition
        v-bind:images="images"
        v-bind:tiles="tiles"
        v-bind:size="size"
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
  }
};
</script>
