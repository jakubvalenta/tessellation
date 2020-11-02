<template>
  <Header :user="$root.store.state.user" :showNav="false" />
  <main class="main index">
    <p>
      Tessellation is a tool to arrange tiles (several small images) into one
      large composition.
    </p>
    <ul>
      <li>
        <a href="/explore/" class="button">Explore</a>
      </li>
      <li>
        <a href="/create/" class="button">Create</a>
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
