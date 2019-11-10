<template>
  <div id="app">
    <h2 class="sr-only">Featured compositions</h2>
    <StoragePublic />
    <div class="edit">
      <button v-show="!edit" @click="toggleEdit(true)" class="button-start">
        start editing
      </button>
      <button v-show="edit" @click="toggleEdit(false)" class="button-stop">
        stop editing
      </button>
    </div>
    <div class="sections">
      <div v-show="edit" class="section section-input">
        <div class="header-row">
          <h2 class="section-heading">Input</h2>
          <Intro />
        </div>
        <InputImages :images="images" />
      </div>
      <div class="section section-composition">
        <h2 class="sr-only">Composition</h2>
        <div class="box-dark">
          <Composition
            :composition="composition"
            :compositionToRender="compositionToRender"
            :edit="edit"
            :loading="loading"
            :error="error"
            :warn="warn"
          />
        </div>
        <CompositionControls
          :edit="edit"
          :width="size.width"
          :height="size.height"
          :composition="composition"
          :natural-tile-size="naturalTileSize"
        />
      </div>
      <div v-show="edit" class="section section-storage">
        <StorageLocal />
        <StorageRemote :has-permissions="isAuthenticated" />
      </div>
    </div>
  </div>
</template>

<script>
import Composition from '../components/Composition.vue';
import CompositionControls from '../components/CompositionControls.vue';
import InputImages from '../components/InputImages.vue';
import Intro from '../components/Intro.vue';
import StorageLocal from '../components/StorageLocal.vue';
import StoragePublic from '../components/StoragePublic.vue';
import StorageRemote from '../components/StorageRemote.vue';

export default {
  name: 'app',
  components: {
    Composition,
    CompositionControls,
    InputImages,
    Intro,
    StorageLocal,
    StoragePublic,
    StorageRemote
  },
  data: function() {
    return this.$root.state;
  },
  methods: {
    toggleEdit: function(edit) {
      this.$root.state.setEdit(edit);
    }
  }
};
</script>

<style lang="scss">
@import '../../css/main.scss';
</style>
