<template>
  <div>
    <div class="heading-row">
      <h2>Published</h2>
      <button
        v-if="user.isAuthenticated"
        @click="createItem"
        :disabled="limitReached"
      >
        publish
      </button>
    </div>
    <p class="text-status">
      these compositions can be shared with other people
    </p>
    <div v-if="user.isAuthenticated">
      <p class="text-status text-success" v-show="successMsg">
        {{ successMsg }}
      </p>
      <p class="text-status text-error" v-show="errorMsg">{{ errorMsg }}</p>
      <p class="text-status text-error" v-if="limitReached">
        You have reached the maximum number of published compositions. Delete
        some compositions to be able to publish new ones.
      </p>
      <p class="storage-empty text-status" v-show="loading">loading</p>
      <p class="storage-empty text-status" v-show="!items.length && !loading">
        empty
      </p>
      <table class="storage-list">
        <StorageRemoteItem
          v-for="item in items"
          @update="loadItems"
          @error="
            msg => {
              errorMsg = msg;
              successMsg = null;
            }
          "
          @success="
            msg => {
              errorMsg = null;
              successMsg = msg;
            }
          "
          :key="item.compositionId"
          :item="item"
        />
      </table>
    </div>
    <div v-else>
      <p class="storage-empty text-status">
        <a href="/accounts/login?next=/">log in</a>
        to publish compositions
      </p>
    </div>
  </div>
</template>

<script>
import StorageRemoteItem from './StorageRemoteItem.vue';
import * as api from '../api.js';
import { error, log } from '../log.js';

export default {
  name: 'StorageRemote',
  components: {
    StorageRemoteItem
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data: function () {
    return {
      items: [],
      loading: null,
      successMsg: null,
      errorMsg: null
    };
  },
  mounted: function () {
    this.loadItems();
  },
  computed: {
    limitReached: function () {
      return (
        this.user.maxCompositions !== -1 &&
        this.user.maxCompositions <= this.items.length
      );
    }
  },
  methods: {
    loadItems: function () {
      this.loading = true;
      api.getCompositions().then(data => {
        this.items = data.map((composition, index) => {
          return {
            revIndex: data.length - index,
            compositionId: composition.slug,
            compositionUrl: composition.url,
            createdAt: composition.created_at,
            name: composition.name,
            public: composition.public,
            featured: composition.featured
          };
        });
        this.loading = false;
      });
    },
    createItem: function () {
      if (this.limitReached) {
        return;
      }
      log('Publishing new composition');
      const data = this.$root.store.serialize();
      api
        .createComposition(data)
        .then(() => {
          this.successMsg = 'Composition was successfully published';
          this.errorMsg = null;
          this.loadItems();
        })
        .catch(err => {
          this.successMsg = null;
          this.errorMsg = 'Error while publishing the composition';
          error(err);
        });
    }
  }
};
</script>
