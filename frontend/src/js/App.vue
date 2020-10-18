<template>
  <router-view></router-view>
</template>

<style lang="scss">
@import '../css/main.scss';
</style>

<script>
import * as api from './api.js';

export default {
  name: 'App',
  created() {
    api.getCurrentUser().then(user => this.$root.store.setUser(user));
  }
};
</script>
