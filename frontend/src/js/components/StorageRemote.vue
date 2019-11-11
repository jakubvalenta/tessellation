<template>
  <div>
    <div class="heading-row">
      <h2>Published</h2>
      <button v-if="hasPermissions" @click="createItem">publish</button>
    </div>
    <p class="text-status">
      these compositions can be shared with other people
    </p>
    <div v-if="hasPermissions">
      <p class="text-status text-success" v-show="successMsg">
        {{ successMsg }}
      </p>
      <p class="text-status text-error" v-show="errorMsg">{{ errorMsg }}</p>
      <p class="text-status" v-show="!items.length">empty</p>
      <p class="text-status" v-show="loading">
        loading
      </p>
      <table class="storage-list">
        <tr v-for="item in items" :key="item.compositionId">
          <td>{{ item.id }} {{ item.name }}</td>
          <td>
            <router-link
              :to="{
                name: 'detail',
                params: { compositionId: item.compositionId }
              }"
              title="permanent link"
              >link</router-link
            >
          </td>
          <td>
            <button @click="loadItem(item.compositionId)">
              load
            </button>
          </td>
          <td v-if="hasPermissions">
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
      <p class="text-status">
        <a href="/accounts/login?next=/">log in</a>
        to publish compositions
      </p>
    </div>
  </div>
</template>

<script>
import * as StorageLib from '../storage.js';
import { error, log } from '../log.js';
import { formatDate } from '../utils/date.js';

function validateLocalStateBeforePublish() {
  if (this.items.length >= StorageLib.MAX_COMPOSITIONS_PER_USER) {
    return 'You have reached the maximum number of published compositions. Delete some compositions to be able to publish new ones.';
  }
  return null;
}

function validate(func) {
  const err = func();
  if (!err) {
    return true;
  }
  this.errorMsg = err;
  this.successMsg = null;
  return false;
}

function validateAll(funcs) {
  let i, func;
  for (i = 0; i < funcs.length; i++) {
    func = funcs[i];
    if (!validate(func)) {
      return false;
    }
  }
  return true;
}

export default {
  name: 'StorageRemote',
  props: {
    hasPermissions: {
      type: Boolean,
      required: true
    }
  },
  data: function() {
    return {
      items: [],
      loading: null,
      successMsg: null,
      errorMsg: null
    };
  },
  mounted: function() {
    this.listItems();
  },
  methods: {
    listItems: function() {
      this.loading = true;
      StorageLib.getPublishedCompositions().then(data => {
        this.loading = false;
        this.items = data.map((composition, index) => {
          return {
            id: data.length - index,
            compositionId: composition.slug,
            compositionUrl: composition.url,
            name:
              composition.name || formatDate(new Date(composition.created_at)),
            isPublic: composition.public
          };
        });
      });
    },
    createItem: function() {
      if (
        !validateAll([
          validateLocalStateBeforePublish.bind(this),
          () => StorageLib.validateStateBeforePublish(this.$root.state)
        ])
      ) {
        return;
      }
      log('Publishing new composition');
      StorageLib.publishState(this.$root.state)
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
    loadItem: function(compositionId) {
      log(`Loading published composition ${compositionId}`);
      this.$router.push({
        name: 'detail',
        params: { compositionId },
        query: this.$route.query
      });
    },
    deleteItem: function(compositionId) {
      log(`Deleting published composition ${compositionId}`);
      StorageLib.deletePublishedComposition(compositionId).then(
        () => {
          this.successMsg = 'Composition was successfully deleted';
          this.errorMsg = null;
          this.listItems();
        },
        () => {
          this.successMsg = null;
          this.errorMsg = 'Error while deleting the composition';
        }
      );
    }
  }
};
</script>
