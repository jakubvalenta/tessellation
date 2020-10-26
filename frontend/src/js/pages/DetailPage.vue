<template>
  <div v-if="notFound" class="box-alert box-error">
    Composition was not found
  </div>
  <Header :title="title" :user="$root.store.state.user" />
  <main class="main detail">
    <nav class="detail__nav">
      <router-link :to="{ name: 'list' }" class="button-link">back</router-link>
      <button v-if="!notFound" @click="shuffle">shuffle</button>
      <router-link
        v-if="!noFound"
        :to="{
          name: 'edit',
          params: {
            compositionId
          }
        }"
        class="button button-secondary"
        >edit</router-link
      >
    </nav>
    <div v-if="!notFound" class="detail__composition">
      <h2 class="sr-only">Composition</h2>
      <Composition
        :loading="state.loading"
        :show-overlay="false"
        :error="state.error"
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
@media screen and (min-width: 800px) {
  .detail__composition {
    flex-grow: 1;
    min-height: 0;

    .composition {
      height: 100%;
    }
  }
}
</style>

<script>
import * as api from '../api.js';
import Composition from '../components/Composition.vue';
import Header from '../components/Header.vue';

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
      if (this.notFound) {
        return '';
      }
      if (this.state.loading) {
        return 'Loading...';
      }
      return `Composition ${this.compositionId}`;
    }
  },
  created() {
    this.$watch(
      () => this.$route.params,
      () => {
        this.loadComposition(this.$route.params.compositionId);
      },
      { immediate: true }
    );
  },
  methods: {
    loadComposition(compositionId) {
      if (!compositionId) {
        this.notFound = true;
        return;
      }
      this.notFound = false;
      this.$root.store.setLoading(true);
      api
        .getPublishedComposition(compositionId)
        .then(data => {
          const newState = this.$root.store.deserialize(data);
          document.title = `Composition ${compositionId}`;
          return this.$root.store.updateState(newState);
        })
        .catch(() => {
          document.title = 'Not found';
          this.notFound = true;
        });
    },
    shuffle: function () {
      return this.$root.store.shuffleTiles();
    }
  }
};
</script>
