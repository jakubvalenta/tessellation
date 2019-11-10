<template>
  <div>
    <h2 class="sr-only">Featured compositions</h2>
    <div v-if="list">
      <StoragePublic />
      <button @click="toggleList(false)">hide</button>
    </div>
    <button v-else @click="toggleList(true)">show featured compositions</button>
    <div v-show="!loading" class="edit">
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
import * as StorageLib from '../storage.js';
import Composition from '../components/Composition.vue';
import CompositionControls from '../components/CompositionControls.vue';
import InputImages from '../components/InputImages.vue';
import Intro from '../components/Intro.vue';
import StorageLocal from '../components/StorageLocal.vue';
import StoragePublic from '../components/StoragePublic.vue';
import StorageRemote from '../components/StorageRemote.vue';

export default {
  name: 'Index',
  components: {
    Composition,
    CompositionControls,
    InputImages,
    Intro,
    StorageLocal,
    StoragePublic,
    StorageRemote
  },
  props: {
    compositionId: {
      type: String,
      required: true
    },
    edit: {
      type: Boolean,
      required: true
    },
    list: {
      type: Boolean,
      required: true
    }
  },
  data: function() {
    return this.$root.state;
  },
  mounted: function() {
    const func = this.edit
      ? StorageLib.getPublishedComposition
      : StorageLib.getSampleComposition;
    func(this.compositionId).then(data => {
      const newState = StorageLib.deserializeState(data);
      this.$root.state.updateState(newState);
    });
  },
  watch: {
    $route: function(to) {
      this.edit = to.query.edit;
      this.list = to.query.list;
    }
  },
  methods: {
    toggleEdit: function(edit) {
      this.$router.push({
        name: 'detail',
        params: { compositionId: this.compositionId },
        query: { edit: edit, list: this.list }
      });
    },
    toggleList: function(list) {
      this.$router.push({
        name: 'detail',
        params: { compositionId: this.compositionId },
        query: { edit: this.edit, list: list }
      });
    }
  }
};
</script>
