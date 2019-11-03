<template>
  <div>
    <StorageLocal heading="Drafts" />
    <StorageRemote
      heading="Published"
      :has-list-permission="isAuthenticated"
      :has-create-permission="isAuthenticated"
      :func-list="StorageLib.getPublishedCompositions"
      :func-load="StorageLib.getPublishedComposition"
    />
    <StorageRemote
      heading="Samples"
      :has-create-permission="false"
      :has-delete-permission="false"
      :func-list="StorageLib.getSampleCompositions"
      :func-load="StorageLib.getSampleComposition"
    />
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
