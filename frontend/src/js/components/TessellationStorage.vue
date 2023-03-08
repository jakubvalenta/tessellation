<template>
  <TessellationStorageLocal />
  <TessellationStorageRemote :user="user" />
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
import TessellationStorageLocal from './TessellationStorageLocal.vue';
import TessellationStorageRemote from './TessellationStorageRemote.vue';

export default {
  name: 'TessellationStorage',
  components: {
    TessellationStorageLocal,
    TessellationStorageRemote
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  }
};
</script>
