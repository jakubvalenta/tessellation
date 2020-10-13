<template>
  <div v-show="notFound" class="box-alert box-error">Composition not found</div>
  <Header v-show="!notFound" :title="title" />
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
        :edit="true"
        :width="state.size.width"
        :height="state.size.height"
        :composition="state.composition"
        :natural-tile-size="state.naturalTileSize"
      />
      <Composition
        :composition="state.composition"
        :edit="true"
        :loading="state.loading"
        :error="state.error"
        :warn="state.warn"
      />
    </div>
    <div class="edit__storage">
      <Storage :isAuthenticated="state.isAuthenticated" />
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
import * as StorageLib from '../storage.js';
import Composition from '../components/Composition.vue';
import CompositionControls from '../components/CompositionControls.vue';
import Header from '../components/Header.vue';
import InputImages from '../components/InputImages.vue';
import Intro from '../components/Intro.vue';
import Storage from '../components/Storage.vue';

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
      return !this.state.loading && `Composition / ${this.compositionId}`;
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
