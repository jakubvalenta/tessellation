<template>
  <header class="header">
    <div class="header-section header-heading">
      <h1>{{ title }}</h1>
    </div>
    <div class="header-section header-nav">
      <span>
        <router-link :to="{ name: 'list' }" class="button">Explore</router-link>
        <router-link :to="{ name: 'create' }" class="button"
          >Create</router-link
        >
      </span>
    </div>
    <div class="header-section header-user">
      <span v-if="user.isAuthenticated">
        Logged in as
        <a :href="user.urlProfile">{{ user.username }}</a> /
        <a :href="`${user.urlLogout}?next=${location.pathname}`">logout</a>
        <span v-if="user.isStaff">
          / <a :href="user.urlAdmin">go to Django Admin</a>
        </span>
      </span>
      <a :href="`/accounts/login?next=${location.pathname}`" v-else>log in</a>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  props: {
    user: {
      type: Object,
      required: true
    },
    title: {
      type: String,
      default: 'Tessellation'
    }
  },
  computed: {
    location: function () {
      return window.location;
    }
  }
};
</script>
