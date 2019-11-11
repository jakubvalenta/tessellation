<template>
  <div class="detail">
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
      <div class="detail__composition__full_screen">
        <button v-if="edit" @click="toggle(false)">
          full screen
        </button>
        <button v-else @click="toggle(true)">
          edit
        </button>
      </div>
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
  </div>
</template>

<style lang="scss">
.detail {
  padding: 2em;
}
@media screen and (min-width: 800px) {
  .detail {
    display: flex;
  }
  .detail__composition {
    flex-grow: 1;
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
  .detail__composition {
    padding-right: 2em;
  }
  .detail__storage {
    width: 28em;
  }
}
@media screen and (min-width: 800px) {
  .detail__composition {
    padding-left: 2em;
    box-sizing: border-box;
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
    padding-right: 0;
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
import Composition from './Composition.vue';
import CompositionControls from './CompositionControls.vue';
import InputImages from './InputImages.vue';
import Intro from './Intro.vue';
import Storage from './Storage.vue';

function loadComposition(compositionId) {
  this.$root.state.setLoading(true);
  StorageLib.getPublishedComposition(compositionId).then(data => {
    const newState = StorageLib.deserializeState(data);
    this.$root.state.updateState(newState);
  });
}

function updateDataFromQuery(data, query) {
  data.edit = query.edit === 'true' || query.edit === true;
}

export default {
  name: 'Detail',
  components: {
    Composition,
    CompositionControls,
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
      updateDataFromQuery(this, to.query);
      loadComposition.call(this, to.params.compositionId);
    }
  },
  methods: {
    toggle: function(edit) {
      this.$router.push({
        ...this.$route,
        query: { ...this.$route.query, edit: edit }
      });
    }
  }
};
</script>
