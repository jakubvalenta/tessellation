<template>
  <div>
    <h2 class="sr-only">Featured compositions</h2>
    <StoragePublic v-if="list" />
    <div class="row-view">
      <button v-if="list" @click="toggleList(false)" class="button-secondary">
        hide featured compositions
      </button>
      <button v-else @click="toggleList(true)" class="button-secondary">
        browse featured compositions
      </button>
      <button v-if="edit" @click="toggleEdit(false)" class="button-secondary">
        full screen
      </button>
      <button v-else @click="toggleEdit(true)" class="button-secondary">
        exit full screen
      </button>
    </div>
    <div class="sections">
      <div v-show="edit" class="section section-input">
        <div class="header-row">
          <h2 class="section-heading">Input</h2>
          <Intro />
        </div>
        <InputImages :images="state.images" />
      </div>
      <div class="section section-composition">
        <h2 class="sr-only">Composition</h2>
        <div class="box-dark">
          <Composition
            :composition="state.composition"
            :compositionToRender="state.compositionToRender"
            :edit="edit"
            :loading="state.loading"
            :error="state.error"
            :warn="state.warn"
          />
        </div>
        <CompositionControls
          :edit="edit"
          :width="state.size.width"
          :height="state.size.height"
          :composition="state.composition"
          :natural-tile-size="state.naturalTileSize"
        />
      </div>
      <div v-show="edit" class="section section-storage">
        <StorageLocal />
        <StorageRemote :has-permissions="state.isAuthenticated" />
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

function loadComposition(compositionId) {
  this.$root.state.setLoading(true);
  StorageLib.getPublishedComposition(compositionId).then(data => {
    const newState = StorageLib.deserializeState(data);
    this.$root.state.updateState(newState);
  });
}

function updateDataFromQuery(data, query) {
  data.edit = query.edit === 'true' || query.edit === true;
  data.list = query.list === 'true' || query.list === true;
}

export default {
  name: 'Detail',
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
    }
  },
  data: function() {
    const data = {
      state: this.$root.state
    };
    updateDataFromQuery(data, this.$route.query);
    return data;
  },
  mounted: function() {
    loadComposition.call(this, this.compositionId);
  },
  watch: {
    $route: function(to) {
      loadComposition.call(this, to.params.compositionId);
      updateDataFromQuery(this, to.query);
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
