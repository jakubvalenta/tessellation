<template>
  <teleport to="#header-title">{{ title ? ` / ${title}` : null }}</teleport>
  <teleport to="#header-nav">
    <router-link :to="{ name: 'list' }" class="button">Explore</router-link>
    <router-link :to="{ name: 'new' }" class="button">Create</router-link>
  </teleport>
</template>

<style lang="scss">
@import '../../css/_variables.scss';

.header {
  background-color: $color-background-dark;
}
</style>

<script>
export default {
  name: 'Header',
  props: {
    title: {
      type: String
    }
  }
};
</script>
