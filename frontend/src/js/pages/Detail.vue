<template>
  <div class="app">
    <div v-show="notFound" class="box-alert box-error">
      Composition not found
    </div>
    <Header :title="title">
      <span>
        <button v-if="!edit" @click="toggleEditMode">
          edit this composition
        </button>
        <button v-if="!featured" @click="toggleBrowseMode">
          browse featured compositions
        </button>
      </span>
    </Header>
    <Featured v-if="featured" />
    <main class="main detail">
      <div v-if="edit" class="detail__input">
        <div class="heading-row">
          <h2>Edit composition</h2>
          <Intro />
        </div>
        <InputImages :images="state.images" />
      </div>
      <div class="detail__composition">
        <h2 class="sr-only">Composition</h2>
        <Composition
          :composition="state.composition"
          :compositionToRender="state.compositionToRender"
          :edit="edit"
          :loading="state.loading"
          :error="state.error"
          :warn="state.warn"
        />
        <CompositionControls
          :edit="edit"
          :width="state.size.width"
          :height="state.size.height"
          :composition="state.composition"
          :natural-tile-size="state.naturalTileSize"
        />
      </div>
      <div v-if="edit" class="detail__storage">
        <Storage :isAuthenticated="state.isAuthenticated" />
      </div>
    </main>
  </div>
</template>

<style lang="scss">
@media screen and (min-width: 800px) {
  .detail {
    display: flex;
  }
  .detail__composition {
    flex-grow: 1;
  }
  .detail__input {
    padding-right: 2em;
    box-sizing: border-box;
  }
}
@media screen and (min-width: 1440px) {
  .detail__input {
    width: 40%;
  }
}
@media screen and (min-width: 1024px) and (max-width: 1439px) {
  .detail__input {
    width: 30%;
  }
}
@media screen and (min-width: 1024px) {
  .detail__storage {
    margin-left: 2em;
    width: 28em;
  }
}
@media screen and (min-width: 800px) and (max-width: 1023px) {
  .detail {
    flex-wrap: wrap;
  }
  .detail__input {
    width: 40%;
  }
  .detail__composition {
    width: 60%;
  }
}
@media screen and (max-width: 1023px) {
  .detail__storage {
    width: 100%;
    padding-top: 1em;
  }
}
@media screen and (max-width: 799px) {
  .detail__composition {
    padding-top: 1em;
  }
}
@media screen and (max-width: 1439px) {
  .detail__input .heading-row {
    display: block;
  }
}
.detail__composition {
  position: relative;
}
.detail__composition__full_screen {
  position: absolute;
  top: 1em;
  right: 3em;
}
</style>

<script>
import * as StorageLib from '../storage.js';
import Composition from '../components/Composition.vue';
import CompositionControls from '../components/CompositionControls.vue';
import Featured from '../components/Featured.vue';
import Header from '../components/Header.vue';
import InputImages from '../components/InputImages.vue';
import Intro from '../components/Intro.vue';
import Storage from '../components/Storage.vue';

function loadComposition(compositionId) {
  this.notFound = false;
  this.$root.state.setLoading(true);
  StorageLib.getPublishedComposition(compositionId).then(
    data => {
      const newState = StorageLib.deserializeState(data);
      this.$root.state.updateState(newState);
      document.title = this.title;
    },
    () => {
      this.notFound = true;
    }
  );
}

function updateDataFromQuery(data, query) {
  data.edit = query.edit === 'true' || query.edit === true;
  data.featured = query.featured === 'true' || query.featured === true;
}

export default {
  name: 'Detail',
  components: {
    Composition,
    CompositionControls,
    Featured,
    Header,
    InputImages,
    Intro,
    Storage
  },
  props: {
    compositionId: {
      type: String,
      required: true
    }
  },
  data: function() {
    const data = {
      state: this.$root.state,
      notFound: false
    };
    updateDataFromQuery(data, this.$route.query);
    return data;
  },
  computed: {
    title: function() {
      return this.loading
        ? 'Tessellation'
        : `Composition / ${this.compositionId}`;
    }
  },
  mounted: function() {
    loadComposition.call(this, this.compositionId);
  },
  watch: {
    $route: function(to) {
      updateDataFromQuery(this, to.query);
      loadComposition.call(this, to.params.compositionId);
    }
  },
  methods: {
    toggleEditMode: function() {
      this.$router.push({
        ...this.$route,
        query: { featured: false, edit: true }
      });
    },
    toggleBrowseMode: function() {
      this.$router.push({
        ...this.$route,
        query: { featured: true, edit: false }
      });
    }
  }
};
</script>
