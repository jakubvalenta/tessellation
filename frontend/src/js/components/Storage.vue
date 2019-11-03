<template>
  <div>
    <StorageLocal heading="Drafts"></StorageLocal>
    <StorageRemote
      heading="Published"
      v-bind:has-list-permission="isAuthenticated"
      v-bind:has-create-permission="isAuthenticated"
      v-bind:func-list="StorageLib.getPublishedCompositions"
      v-bind:func-load="StorageLib.getPublishedComposition"
    ></StorageRemote>
    <StorageRemote
      heading="Samples"
      v-bind:has-create-permission="false"
      v-bind:has-delete-permission="false"
      v-bind:func-list="StorageLib.getSampleCompositions"
      v-bind:func-load="StorageLib.getSampleComposition"
    ></StorageRemote>
  </div>
</template>

<script>
import * as StorageLib from '../storage.js';
import StorageLocal from './StorageLocal.vue';
import StorageRemote from './StorageRemote.vue';

export default {
  name: 'Storage',
  components: {
    StorageLocal,
    StorageRemote
  },
  data: function() {
    return {
      isAuthenticated: window.TESSELLATION_IS_AUTHENTICATED,
      StorageLib: StorageLib
    };
  }
};
</script>
