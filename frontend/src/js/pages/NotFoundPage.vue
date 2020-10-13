<template>
  <main class="main">
    <div class="text">
      <h2>Page not found</h2>
      <p>
        <router-link :to="{ name: 'index' }">go to homepage</router-link>
      </p>
    </div>
  </main>
</template>

<script>
export default {
  name: 'NotFoundPage'
};
</script>
