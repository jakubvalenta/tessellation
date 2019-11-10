<template>
  <ul class="composition-list">
    <li
      v-for="item in items"
      :key="item.compositionId"
      class="composition-list__item box-dark"
    >
      <h3 class="has-permalink">
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
      <div class="composition-list__item__images">
        <img v-for="image in item.images" :key="item.imgRef" :src="image.url" />
      </div>
      <button @click="loadItem(item.compositionId)">
        load
      </button>
    </li>
    <li class="text-status" v-show="loading">
      loading
    </li>
  </ul>
</template>

<script>
import * as StorageLib from '../storage.js';
import { formatDate } from '../utils/date.js';
import { log } from '../log.js';

export default {
  name: 'CompositionList',
  data: function() {
    return {
      items: [],
      loading: null
    };
  },
  mounted: function() {
    this.listItems();
  },
  methods: {
    listItems: function() {
      this.loading = true;
      StorageLib.getSampleCompositions().then(data => {
        this.loading = false;
        this.items = data.map(composition => {
          return {
            compositionId: composition.id,
            compositionUrl: composition.url,
            name:
              composition.name || formatDate(new Date(composition.created_at)),
            images: composition.images.slice(0, 4)
          };
        });
      });
    },
    loadItem: function(compositionId) {
      log(`Loading sample composition ${compositionId}`);
      this.$router.push({
        name: 'detail',
        params: { compositionId },
        query: this.$route.query
      });
    }
  }
};
</script>
