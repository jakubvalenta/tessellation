<template>
  <Header :title="title" :user="state.user" />
  <main class="main edit">
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
        :show-overlay="showOverlay"
        @toggle-overlay="showOverlay = !showOverlay"
      />
      <Composition
        :loading="state.loading"
        :show-overlay="showOverlay"
        :error="state.error"
      />
    </div>
    <div class="edit__storage">
      <SettingsForm
        :width="state.size.width"
        :height="state.size.height"
        :update-stack-func-name="state.updateStackFuncName"
        :allow-rotation="state.allowRotation"
      />
      <Storage :user="state.user" />
    </div>
  </main>
</template>

<style lang="scss">
.edit__input {
  flex-shrink: 0;
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
    padding-right: 1em;
  }
  .edit__input,
  .edit__storage {
    overflow-y: auto;
  }
  .edit__input {
    width: 48em;
    padding-right: 1.5em;
    margin-right: 1em;
    box-sizing: border-box;
  }
  .edit__composition {
    position: relative;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding-right: 1em;

    .composition {
      min-height: 0;
      flex-grow: 1;
    }
  }
  .edit__storage {
    width: 24em;
    padding-right: 1em;
  }
}
@media screen and (min-width: 1023px) {
  .edit__composition {
    margin-right: 1em;
  }
}
@media screen and (min-width: 1920px) {
  .edit__input {
    width: 75em;
  }
}
@media screen and (max-width: 1023px) {
  #app {
    display: block;
    min-height: auto;
  }
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
@media screen and (max-width: 799px) {
  .edit__composition {
    width: 100%;
  }
  .edit__composition {
    padding-top: 2em;
  }
}
</style>

<script>
import Composition from '../components/Composition.vue';
import CompositionControls from '../components/CompositionControls.vue';
import Header from '../components/Header.vue';
import InputImages from '../components/InputImages.vue';
import Intro from '../components/Intro.vue';
import SettingsForm from '../components/SettingsForm.vue';
import Storage from '../components/Storage.vue';

export default {
  name: 'EditPage',
  components: {
    Composition,
    CompositionControls,
    Header,
    InputImages,
    Intro,
    SettingsForm,
    Storage
  },
  data: function () {
    const data = {
      state: this.$root.store.state,
      showOverlay: false
    };
    return data;
  },
  computed: {
    title: function () {
      if (this.state.loading) {
        return 'Loading...';
      }
      return 'Tessellation';
    }
  },
  created() {
    const data = JSON.parse(
      document.getElementById('composition-data').textContent
    );
    const newState = this.$root.store.deserialize(data);
    return this.$root.store.updateState(newState);
  },
  watch: {
    showOverlay: function () {
      document.body.classList.toggle('mode-final', !this.showOverlay);
    }
  }
};
</script>
