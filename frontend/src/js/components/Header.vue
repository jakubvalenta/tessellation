<template>
  <header class="header">
    <div class="header-section header-heading">
      <h1>{{ title }}</h1>
    </div>
    <div class="header-section header-nav">
      <span>
        <slot></slot>
      </span>
    </div>
    <div class="header-section header-user" ref="headerUser"></div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  mounted: function () {
    const elHeaderFromServer = document.getElementById('js-header');
    document.body.removeChild(elHeaderFromServer);
    elHeaderFromServer.style.display = 'inline';
    this.$refs.headerUser.appendChild(elHeaderFromServer);
  }
};
</script>
