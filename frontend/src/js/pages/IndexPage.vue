<template>
  <div class="app">
    <main class="main index">
      <nav>
        <ul>
          <li>
            <router-link :to="{ name: 'list' }">Explore</router-link>
          </li>
          <li>
            <router-link :to="{ name: 'new' }">Create</router-link>
          </li>
        </ul>
      </nav>
    </main>
  </div>
</template>

<style lang="scss"></style>
