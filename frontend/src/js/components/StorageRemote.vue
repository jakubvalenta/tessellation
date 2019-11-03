<template>
  <div>
    <div class="storage-header">
      <h2 class="section-heading">{{ heading }}</h2>
      <button v-if="hasCreatePermission" @click="createItem">publish</button>
    </div>
    <div v-if="hasListPermission">
      <p class="storage-status text-success" v-show="successMsg">
        {{ successMsg }}
      </p>
      <p class="storage-status text-error" v-show="errorMsg">{{ errorMsg }}</p>
      <p class="storage-empty" v-show="!items.length">empty</p>
      <p class="storage-empty" v-show="loading">
        loading
      </p>
      <table class="storage-list">
        <tr v-for="item in items">
          <td>{{ item.id }} {{ item.name }}</td>
          <td><a v-bind:href="item.compositionUrl">permalink</a></td>
          <td>
            <button @click="loadItem(item.compositionId)">
              load
            </button>
          </td>
          <td v-if="hasDeletePermission">
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
      <p class="storage-empty">
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
    heading: {
      type: String,
      required: true
    },
    hasListPermission: {
      type: Boolean,
      default: true
    },
    hasCreatePermission: {
      type: Boolean,
      default: true
    },
    hasDeletePermission: {
      type: Boolean,
      default: true
    },
    funcList: {
      type: Function,
      required: true
    },
    funcLoad: {
      type: Function,
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
      this.funcList().then(data => {
        this.loading = false;
        this.items = data.map((composition, index) => {
          return {
            id: data.length - index,
            compositionId: composition.id,
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
      this.funcLoad(compositionId).then(data => {
        const newState = StorageLib.deserializeState(data);
        this.$root.state.updateState(newState);
        this.listItems();
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
