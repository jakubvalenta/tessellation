<template>
  <StorageLocal />
  <StorageRemote :user="user" />
</template>

<style lang="scss">
@import '../../css/_variables.scss';

.storage-list {
  min-height: 1em;
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1em;

  td {
    border-top: 1px solid $color-border;
    padding-left: 0.5em;

    &:first-child {
      width: 100%;
      padding-left: 0;
    }
  }
  button {
    margin: 0.1em 0;
  }
}
.storage-empty {
  border-top: 1px solid $color-border;
  padding: 0.5em 0;
}
</style>

<script>
import StorageLocal from './StorageLocal.vue';
import StorageRemote from './StorageRemote.vue';

export default {
  name: 'Storage',
  components: {
    StorageLocal,
    StorageRemote
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  }
};
</script>
