<template>
  <div v-show="notFound" class="box-alert box-error">
    Composition was not found
  </div>
  <Header v-show="!notFound" :title="title" />
  <main v-show="!notFound" class="main detail">
    <nav class="detail__nav">
      <router-link :to="{ name: 'list' }" class="button-link">back</router-link>
      <button @click="shuffle">shuffle</button>
      <router-link
        :to="{
          name: 'edit',
          params: {
            compositionId
          }
        }"
        class="button"
        >edit</router-link
      >
    </nav>
    <div class="detail__composition">
      <h2 class="sr-only">Composition</h2>
      <Composition
        :composition="state.composition"
        :edit="false"
        :loading="state.loading"
        :error="state.error"
        :warn="state.warn"
      />
    </div>
  </main>
</template>

<style lang="scss">
.detail {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
}
.detail__nav {
  margin-bottom: 1em;
  display: flex;
  justify-content: space-between;
}
.detail__composition {
  flex-grow: 1;
  min-height: 0;

  .composition {
    height: 100%;
  }
}
</style>

<script>
import * as StorageLib from '../storage.js';
import Composition from '../components/Composition.vue';
import Header from '../components/Header.vue';

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
    Composition,
    Header
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
  },
  methods: {
    shuffle: function () {
      this.$root.store.shuffleTiles();
    }
  }
};
</script>
