<template>
  <header class="header">
    <div class="header-section header-heading">
      <h1>{{ title }}</h1>
    </div>
    <div class="header-section header-nav">
      <span v-if="showNav">
        <a
          href="/explore/"
          class="button"
          :class="{ active: location.pathname.startsWith('/explore/') }"
          >Explore</a
        >
        <a
          href="/create/"
          class="button"
          :class="{ active: location.pathname.startsWith('/create/') }"
          >Create</a
        >
      </span>
    </div>
    <div class="header-section header-user">
      <span v-if="user.isAuthenticated">
        <a :href="user.urlProfile">{{ user.username }}</a> /
        <form id="logout-form" method="post" :action="user.urlLogout">
          <input type="hidden" name="csrfmiddlewaretoken" :value="csrfToken" />
          <input type="hidden" name="next" :value="location.pathname" />
          <button type="submit" class="button-link" style="padding: 0">
            x
          </button>
        </form>
        <span v-if="user.isStaff"> / <a :href="user.urlAdmin">dj</a> </span>
      </span>
      <a :href="`/accounts/login?next=${location.pathname}`" v-else>log in</a>
    </div>
  </header>
</template>

<script>
import { getCSRFToken } from '../utils/http';

export default {
  name: 'PageHeader',
  props: {
    user: {
      type: Object,
      required: true
    },
    title: {
      type: String,
      default: 'Tessellation'
    },
    showNav: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    location: function () {
      return window.location;
    },
    csrfToken: function () {
      return getCSRFToken();
    }
  }
};
</script>
