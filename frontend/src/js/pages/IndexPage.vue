<template>
  <Header :user="$root.store.state.user" />
  <main class="main index">
    <p>
      Tessellation is a tool to arrange tiles (several small images) into one
      large composition.
    </p>
    <ul>
      <li>
        <router-link :to="{ name: 'list' }" class="button">Explore</router-link>
      </li>
      <li>
        <router-link :to="{ name: 'create' }" class="button"
          >Create</router-link
        >
      </li>
    </ul>
  </main>
</template>

<style lang="scss">
.index {
  text-align: center;

  ul {
    padding-left: 0;
    margin-top: 2em;
  }
  li {
    display: block;
    margin: 1em 0;

    a {
      min-width: 5em;
    }
  }
}
</style>

<script>
import Header from '../components/Header.vue';

export default {
  name: 'IndexPage',
  components: {
    Header
  }
};
</script>
