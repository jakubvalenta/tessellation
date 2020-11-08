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
        <tr v-for="item in items" :key="item.compositionId">
          <td>
            {{ item.id }} {{ item.name }}
            <br />

            <a :href="`/explore/${item.compositionId}`" title="permanent link"
              ><span v-if="item.public">public link</span
              ><span v-else>private link</span></a
            >
            /
            <a
              href="javascript:void(0)"
              v-if="item.featured"
              @click="setFeatured(item.compositionId, false)"
              title="Don't show this composition on the Explore page anymore"
            >
              hide from Explore
            </a>
            <a
              href="javascript:void(0)"
              v-else
              @click="setFeatured(item.compositionId, true)"
              title="Put this composition on the Explore page"
            >
              show in Explore
            </a>
          </td>
          <td>
            <a :href="`/create/${item.compositionId}/`" class="button">load</a>
          </td>
          <td v-if="user.isAuthenticated">
            <button
              class="button-secondary"
              @click="deleteItem(item.compositionId)"
            >
              x
            </button>
          </td>
        </tr>
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
import * as api from '../api.js';
import { error, log } from '../log.js';
import { formatDate } from '../utils/date.js';

export default {
  name: 'StorageRemote',
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
    this.listItems();
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
    listItems: function () {
      this.loading = true;
      api.getPublishedCompositions().then(data => {
        this.loading = false;
        this.items = data.map((composition, index) => {
          return {
            id: data.length - index,
            compositionId: composition.slug,
            compositionUrl: composition.url,
            name:
              composition.name || formatDate(new Date(composition.created_at)),
            public: composition.public,
            featured: composition.featured
          };
        });
      });
    },
    createItem: function () {
      if (this.limitReached) {
        return;
      }
      log('Publishing new composition');
      const data = this.$root.store.serialize();
      api
        .publishComposition(data)
        .then(() => {
          this.successMsg = 'Composition was successfully published';
          this.errorMsg = null;
          this.listItems();
        })
        .catch(err => {
          this.successMsg = null;
          this.errorMsg = 'Error while publishing the composition';
          error(err);
        });
    },
    setFeatured: function (compositionId, featured) {
      log(`Setting the featured flag on the composition ${compositionId}`);
      api
        .setFeatured(compositionId, featured)
        .then(() => {
          this.successMsg = 'Successfully updated the composition';
          this.errorMsg = null;
          this.listItems();
        })
        .catch(err => {
          this.successMsg = null;
          this.errorMsg = 'Error while updating the composition';
          error(err);
        });
    },
    deleteItem: function (compositionId) {
      log(`Deleting published composition ${compositionId}`);
      api
        .deletePublishedComposition(compositionId)
        .then(() => {
          this.successMsg = 'Composition was successfully deleted';
          this.errorMsg = null;
          this.listItems();
        })
        .catch(err => {
          this.successMsg = null;
          this.errorMsg = 'Error while deleting the composition';
          error(err);
        });
    }
  }
};
</script>
