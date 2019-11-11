<template>
  <div class="featured">
    <h2 class="featured__heading">Featured compositions</h2>
    <ul class="featured__list">
      <li
        v-for="item in items"
        :key="item.compositionId"
        class="featured__list__item"
      >
        <h3 class="sr-only has-permalink">
          {{ item.name }}
          <router-link
            :to="{
              name: 'detail',
              params: { compositionId: item.compositionId }
            }"
            title="permalink"
            >§</router-link
          >
        </h3>
        <div class="featured__list__item__images">
          <img
            v-for="image in item.images"
            :key="item.imgRef"
            :src="image.url"
          />
        </div>
        <button @click="loadItem(item.compositionId)">
          load
        </button>
      </li>
      <li class="featured__list__item text-status" v-show="loading">
        loading
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
@import '../../css/_variables.scss';

.featured {
  position: relative;
  background: $color-background-dark;
  padding: 2em;
  margin-bottom: 1em;
}
.featured__heading {
  position: absolute;
  left: 2em;
  top: 1em;
}
.featured__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin: 0;
  padding: 0;
}
.featured__list__item {
  display: flex;
  width: 15em;
  margin: 0 1.25em;
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
  align-items: flex-start;
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

function loadItems() {
  this.loading = true;
  StorageLib.getSampleCompositions().then(data => {
    this.loading = false;
    this.items = data.map(composition => {
      return {
        compositionId: composition.id,
        compositionUrl: composition.url,
        name: composition.name || formatDate(new Date(composition.created_at)),
        images: composition.images.slice(0, 4)
      };
    });
  });
}

export default {
  name: 'CompositionFeatured',
  data: function() {
    return {
      items: [],
      loading: null
    };
  },
  mounted: function() {
    loadItems.call(this);
  },
  watch: {
    $route: function() {
      loadItems.call(this);
    }
  },
  methods: {
    loadItem: function(compositionId) {
      log(`Loading sample composition ${compositionId}`);
      this.$router.push({
        ...this.$route,
        params: { compositionId }
      });
    }
  }
};
</script>
