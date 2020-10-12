<template>
  <header class="header">
    <div class="header-section header-heading">
      <h1>{{ title }}</h1>
    </div>
    <div class="header-section header-nav">
      <span>
        <slot>
          <router-link :to="{ name: 'list' }" class="button"
            >Explore</router-link
          >
          <router-link :to="{ name: 'new' }" class="button"
            >Create</router-link
          ></slot
        >
      </span>
    </div>
    <div class="header-section header-user" ref="headerUser"></div>
  </header>
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
      type: String,
      default: 'Tessellation'
    }
  },
  mounted: function () {
    const elHeaderFromServer = document.getElementById('js-header');
    if (elHeaderFromServer) {
      elHeaderFromServer.parentNode.removeChild(elHeaderFromServer);
      elHeaderFromServer.style.display = 'inline';
      this.$refs.headerUser.appendChild(elHeaderFromServer);
    }
  }
};
</script>
