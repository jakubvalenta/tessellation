<template>
  <Header :user="$root.store.state.user" :showNav="false" />
  <main class="main index">
    <p>A web app to arrange tiles according to specified rules.</p>
    <p>
      Tessellation allows you to upload square images and define how they
      connect. The app will then try to arrange the tiles into a larger
      composition adhering to the connection rules. This is similar to the
      <a href="https://en.wikipedia.org/wiki/Wang_tile" target="_blank"
        >Wang tiles problem</a
      >.
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
  max-width: 34em;
  margin: 0 auto;

  ul {
    text-align: center;
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
