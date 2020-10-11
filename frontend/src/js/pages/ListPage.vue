<template>
  <div class="app">
    <main class="main featured">
      <h2 class="featured__heading">Featured compositions</h2>
      <ul v-show="compositions.length" class="featured__list">
        <li
          v-for="composition in compositions"
          :key="composition.compositionId"
          @click="loadComposition(composition.compositionId)"
          class="featured__list__item button-box"
          title="click to view the composition"
        >
          <h3 class="sr-only has-permalink">
            {{ composition.name }}
            <router-link
              :to="{
                name: 'detail',
                params: { compositionId: composition.compositionId }
              }"
              title="permalink"
              >§</router-link
            >
          </h3>
          <div class="featured__list__item__images">
            <img
              v-for="image in composition.images"
              :key="image.ref"
              :src="image.url"
            />
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>

<style lang="scss">
@import '../../css/_variables.scss';

.featured {
  position: relative;
  background: $color-background-dark;
  padding: 2em 0.75em;
  padding-bottom: 0;
  margin-bottom: 1em;
}
.featured__heading {
  position: absolute;
  left: 2em;
  top: 1em;
  color: $color-text;
}
.featured__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0;
  padding: 0;
}
@media screen and (max-width: 1023px) {
  .featured {
    padding-top: 0;
  }
  .featured__heading {
    position: static;
    margin: 0;
    padding: 1em 1.25em;
  }
  .featured__list {
    justify-content: flex-start;
  }
}
.featured__list__item {
  display: flex;
  width: 15em;
  margin: 0 1.25em;
  margin-bottom: 2em;
  flex-direction: column;

  h3 {
    margin-top: 0;
  }
  button {
    display: block;
    width: 100%;
    box-sizing: border-box;
    background-color: $color-background-light;
  }
}
.featured__list__item__images {
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
import { log } from '../log.js';

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
  },
  methods: {
    loadComposition: function (compositionId) {
      log(`Loading sample composition ${compositionId}`);
      this.$router.push({
        ...this.$route,
        params: { compositionId }
      });
    }
  }
};
</script>
