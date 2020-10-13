<template>
  <Header title="Explore" />
  <main class="main explore">
    <ul v-show="compositions.length" class="explore__list">
      <li
        v-for="composition in compositions"
        :key="composition.compositionId"
        class="explore__list__item button-box"
        title="click to view the composition"
      >
        <router-link
          :to="{
            name: 'detail',
            params: { compositionId: composition.compositionId }
          }"
          title="open composition"
        >
          <h3 class="sr-only has-permalink">{{ composition.name }}</h3>
          <div class="explore__list__item__images">
            <img
              v-for="image in composition.images"
              :key="image.ref"
              :src="image.url"
            />
          </div>
        </router-link>
      </li>
    </ul>
  </main>
</template>

<style lang="scss">
@import '../../css/_variables.scss';

.explore {
  position: relative;
  padding: 2em 0.75em;
  padding-bottom: 0;
  margin-bottom: 1em;
}
.explore__heading {
  position: absolute;
  left: 2em;
  top: 1em;
}
.explore__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0;
  padding: 0;
}
@media screen and (max-width: 1023px) {
  .explore {
    padding-top: 0;
  }
  .explore__heading {
    position: static;
    margin: 0;
    padding: 1em 1.25em;
  }
  .explore__list {
    justify-content: flex-start;
  }
}
.explore__list__item {
  display: flex;
  width: 15em;
  margin: 0 1.25em;
  margin-bottom: 2em;
  flex-direction: column;

  h3 {
    margin-top: 0;
  }
  .button {
    display: block;
    width: 100%;
    box-sizing: border-box;
    background-color: $color-background-light;
  }
}
.explore__list__item__images {
  display: flex;
  flex-grow: 1;
  flex-wrap: wrap;
  align-compositions: flex-start;
  background: $color-white;

  img {
    display: block;
    width: 50%;
  }
}
</style>

<script>
import * as StorageLib from '../storage.js';
import { formatDate } from '../utils/date.js';
import Header from '../components/Header.vue';

function loadCompositions() {
  StorageLib.getSampleCompositions().then(data => {
    this.compositions = data.map(composition => {
      return {
        compositionId: composition.slug,
        compositionUrl: composition.url,
        name: composition.name || formatDate(new Date(composition.created_at)),
        images: composition.images.slice(0, 4)
      };
    });
  });
}

export default {
  name: 'ListPage',
  components: {
    Header
  },
  data: function () {
    return {
      compositions: []
    };
  },
  mounted: function () {
    loadCompositions.call(this);
  },
  watch: {
    $route: function () {
      loadCompositions.call(this);
    }
  }
};
</script>
