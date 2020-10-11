<template>
  <div class="app">
    <div v-show="notFound" class="box-alert box-error">
      Composition not found
    </div>
    <main class="main detail">
      <div class="detail__composition">
        <h2 class="sr-only">Composition</h2>
        <CompositionControls
          :edit="false"
          :width="state.size.width"
          :height="state.size.height"
          :composition="state.composition"
          :natural-tile-size="state.naturalTileSize"
        />
        <Composition
          :composition="state.composition"
          :edit="false"
          :loading="state.loading"
          :error="state.error"
          :warn="state.warn"
        />
      </div>
    </main>
  </div>
</template>

<style lang="scss"></style>

<script>
import * as StorageLib from '../storage.js';
import Composition from '../components/Composition.vue';

function loadComposition(compositionId) {
  if (!compositionId) {
    this.notFound = true;
    return;
  }
  this.notFound = false;
  this.$root.store.setLoading(true);
  StorageLib.getPublishedComposition(compositionId).then(
    data => {
      const newState = StorageLib.deserializeState(data);
      this.$root.store.updateState(newState);
      document.title = this.title;
    },
    () => {
      this.notFound = true;
    }
  );
}

export default {
  name: 'DetailPage',
  components: {
    Composition
  },
  props: {
    compositionId: {
      type: String,
      required: true
    }
  },
  data: function () {
    const data = {
      state: this.$root.store.state,
      notFound: false
    };
    return data;
  },
  computed: {
    title: function () {
      return this.state.loading
        ? 'Tessellation'
        : `Composition / ${this.compositionId}`;
    }
  },
  mounted: function () {
    loadComposition.call(this, this.compositionId);
  },
  watch: {
    $route: function (to) {
      loadComposition.call(this, to.params.compositionId);
    }
  }
};
</script>
