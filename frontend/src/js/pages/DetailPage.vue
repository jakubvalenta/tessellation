<template>
  <Header :title="title" :user="$root.store.state.user" />
  <main class="main detail">
    <nav class="detail__nav">
      <a href="/explore/" class="button-link">back</a>
      <button @click="shuffle" class="button-primary">shuffle</button>
      <a :href="`/create/${compositionId}/`" class="button">edit</a>
    </nav>
    <div class="detail__composition">
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
import Composition from '../components/Composition.vue';
import Header from '../components/Header.vue';

export default {
  name: 'DetailPage',
  components: {
    Composition,
    Header
  },
  data: function () {
    const data = {
      state: this.$root.store.state,
      compositionId: null
    };
    return data;
  },
  computed: {
    title: function () {
      if (!this.compositionId) {
        return 'Loading...';
      }
      return `Composition ${this.compositionId}`;
    }
  },
  created() {
    const data = JSON.parse(
      document.getElementById('composition-data').textContent
    );
    console.log(data);
    this.compositionId = data.slug;
    const newState = this.$root.store.deserialize(data);
    return this.$root.store.updateState(newState);
  },
  methods: {
    shuffle: function () {
      return this.$root.store.shuffleTiles();
    }
  }
};
</script>
