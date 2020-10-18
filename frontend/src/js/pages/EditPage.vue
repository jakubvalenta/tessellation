<template>
  <div v-show="notFound" class="box-alert box-error">Composition not found</div>
  <Header :title="title" :user="state.user" />
  <main v-show="!notFound" class="main edit">
    <div class="edit__input">
      <div class="heading-row">
        <h2>Create composition</h2>
        <Intro />
      </div>
      <InputImages :images="state.images" />
    </div>
    <div class="edit__composition">
      <h2 class="sr-only">Composition</h2>
      <CompositionControls
        :width="state.size.width"
        :height="state.size.height"
        :edit="true"
        :natural-tile-size="state.naturalTileSize"
        :show-overlay="showOverlay"
        @toggle-overlay="showOverlay = !showOverlay"
      />
      <Composition
        :width="state.size.width"
        :height="state.size.height"
        :edit="true"
        :loading="state.loading"
        :error="state.error"
        :warn="state.warn"
        :show-overlay="showOverlay"
      />
    </div>
    <div class="edit__storage">
      <Storage :user="state.user" />
    </div>
  </main>
</template>

<style lang="scss">
.edit__input {
  padding-top: 0.1em;
}
.edit__storage {
  padding-top: 0.1em;
}
@media screen and (min-width: 800px) {
  .edit {
    display: flex;
    min-height: 0;
    flex-grow: 1;
  }
  .edit__input,
  .edit__storage {
    overflow-y: auto;
  }
  .edit__composition {
    flex-grow: 1;
  }
  .edit__input {
    padding-right: 1.5em;
    margin-right: 1em;
    box-sizing: border-box;
  }
}
@media screen and (min-width: 1024px) {
  .edit__composition {
    padding-right: 1em;
    margin-right: 1em;
  }
  .edit__storage {
    width: 28em;
    padding-right: 1em;
  }
}
@media screen and (max-width: 1023px) {
  .edit {
    flex-wrap: wrap;
  }
  .edit__composition {
    width: min-content;
  }
  .edit__storage {
    width: 100%;
    padding-top: 2em;
  }
}
@media screen and (min-width: 800px) {
  .edit__input {
    width: 40%;
  }
}
@media screen and (max-width: 799px) {
  .edit__input .heading-row h2 {
    display: none;
  }
  .edit__composition {
    width: 100%;
  }
  .edit__composition {
    padding-top: 2em;
  }
}
@media screen and (max-width: 1439px) {
  .edit__input .heading-row {
    display: block;
  }
}
.edit__composition {
  position: relative;
  display: flex;
  flex-direction: column;

  .composition {
    min-height: 0;
    flex-grow: 1;
  }
}
.edit__composition__full_screen {
  position: absolute;
  top: 1em;
  right: 3em;
}
</style>

<script>
import * as api from '../api.js';
import Composition from '../components/Composition.vue';
import CompositionControls from '../components/CompositionControls.vue';
import Header from '../components/Header.vue';
import InputImages from '../components/InputImages.vue';
import Intro from '../components/Intro.vue';
import Storage from '../components/Storage.vue';

export default {
  name: 'EditPage',
  components: {
    Composition,
    CompositionControls,
    Header,
    InputImages,
    Intro,
    Storage
  },
  props: {
    compositionId: {
      type: String
    }
  },
  data: function () {
    const data = {
      state: this.$root.store.state,
      create: false,
      notFound: false,
      showOverlay: false
    };
    return data;
  },
  computed: {
    title: function () {
      if (this.state.loading) {
        return 'Loading...';
      }
      if (this.create) {
        return 'New composition';
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
  watch: {
    showOverlay: function () {
      document.body.classList.toggle('mode-final', !this.showOverlay);
    }
  },
  methods: {
    loadComposition(compositionId) {
      if (compositionId) {
        this.create = false;
      } else {
        this.create = true;
        compositionId = window.TESSELLATION_COMPOSITION_SLUG;
      }
      this.notFound = false;
      this.$root.store.setLoading(true);
      api
        .getPublishedComposition(compositionId)
        .then(data => {
          const newState = this.$root.store.deserialize(data);
          this.$root.store.updateState(newState);
          document.title = `Composition ${compositionId}`;
        })
        .catch(() => {
          this.notFound = true;
        });
    }
  }
};
</script>
