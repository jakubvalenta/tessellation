<template>
  <tr>
    <td>
      {{ item.revIndex }}
      <a
        v-if="item.public"
        :href="`/explore/${item.compositionId}`"
        title="permanent link"
      >
        {{ item.name || this.formattedCreatedAt }}
      </a>
      <span v-else>
        {{ item.name || this.formattedCreatedAt }}
      </span>
    </td>
    <td>
      <a :href="`/create/${item.compositionId}/`" class="button">load</a>
    </td>
    <td>
      <button class="button-secondary" @click="deleteComposition">x</button>
    </td>
  </tr>
  <tr class="storage-remote__second-row">
    <td colspan="3">
      <form
        v-if="rename"
        action="javascript:void(0)"
        @submit.prevent="setCompositionName"
      >
        <input
          type="text"
          v-model="name"
          ref="name"
          placeholder="type name"
          class="storage-remote__input"
        />
        <button type="submit">save</button>
        <button type="button" @click="toggleRename" class="button-secondary">
          cancel
        </button>
      </form>
      <span v-else>
        <button
          @click="toggleRename"
          class="button-secondary"
          style="margin-right: 0.5em"
        >
          rename
        </button>
        <button
          @click="toggleCompositionFeatured"
          class="button-secondary"
          :title="
            item.featured
              ? 'Don\'t show this composition on the Explore page anymore'
              : 'Put this composition on the Explore page'
          "
        >
          {{ item.featured ? 'hide from Explore' : 'show in Explore' }}
        </button>
      </span>
    </td>
  </tr>
</template>

<style lang="scss">
.storage-list .storage-remote__second-row td {
  border: 0;
  padding: 0.25em 0;
  text-align: right;
}
.storage-remote__input {
  float: left;
}
</style>

<script>
import * as api from '../api.js';
import { error, log } from '../log.js';
import { formatDate } from '../utils/date.js';

export default {
  name: 'TessellationStorageRemoteItem',
  emits: ['error', 'success', 'update'],
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      name: this.item.name,
      rename: false
    };
  },
  computed: {
    formattedCreatedAt: function () {
      return formatDate(new Date(this.item.createdAt));
    }
  },
  methods: {
    deleteComposition: function () {
      log(`Deleting published composition ${this.item.compositionId}`);
      api
        .deleteComposition(this.item.compositionId)
        .then(() => {
          this.$emit('success', 'Composition deleted');
          this.$emit('update');
        })
        .catch(err => {
          this.$emit('error', 'Error while deleting the composition');
          error(err);
        });
    },
    setCompositionName: function () {
      log(
        `Renaming composition ${this.item.compositionId} to ${this.item.name}`
      );
      api
        .patchCompositionName(this.item.compositionId, this.name)
        .then(() => {
          this.rename = false;
          this.$emit('success', 'Composition renamed');
          this.$emit('update');
        })
        .catch(err => {
          this.rename = false;
          this.$emit('error', 'Error while renaming the composition');
          error(err);
        });
    },
    toggleCompositionFeatured: function () {
      log(
        `Setting the featured flag on the composition ${this.item.compositionId}`
      );
      api
        .patchCompositionFeatured(this.item.compositionId, !this.item.featured)
        .then(() => {
          this.$emit('success', 'Composition updated');
          this.$emit('update');
        })
        .catch(err => {
          this.$emit('error', 'Error while updating the composition');
          error(err);
        });
    },
    toggleRename: function () {
      this.rename = !this.rename;

      if (this.rename) {
        this.$nextTick(function () {
          this.$refs.name.focus();
        });
      }
    }
  }
};
</script>
