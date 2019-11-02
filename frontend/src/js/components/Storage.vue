<template>
  <div>
    <storage-local heading="Drafts"></storage-local>
    <storage-remote
      heading="Published"
      v-bind:hasListPermission="isAuthenticated"
      v-bind:hasCreatePermission="isAuthenticated"
      v-bind:funcList="StorageLib.getPublishedCompositions"
      v-bind:funcLoad="StorageLib.getPublishedComposition"
    ></storage-remote>
    <storage-remote
      heading="Samples"
      v-bind:hasCreatePermission="false"
      v-bind:hasDeletePermission="false"
      v-bind:funcList="StorageLib.getSampleCompositions"
      v-bind:funcLoad="StorageLib.getSampleComposition"
    ></storage-remote>
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
