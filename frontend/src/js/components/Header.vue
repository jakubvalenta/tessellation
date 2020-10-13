<template>
  <teleport to="#header-title">{{ title ? ` / ${title}` : null }}</teleport>
  <teleport to="#header-nav">
    <slot>
      <router-link :to="{ name: 'list' }" class="button">Explore</router-link>
      <router-link :to="{ name: 'create' }" class="button">Create</router-link>
    </slot>
  </teleport>
</template>

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
