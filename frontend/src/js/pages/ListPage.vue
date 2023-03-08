<template>
  <PageHeader :user="$root.store.state.user" />
  <main class="main">
    <ul v-show="compositions.length" class="explore-list">
      <li
        v-for="composition in compositions"
        :key="composition.compositionId"
        class="explore-list__item button-box"
        title="click to view the composition"
      >
        <a
          :href="`/explore/${composition.compositionId}`"
          :title="`View composition ${composition.compositionId}`"
        >
          <div
            class="explore-list__item__image"
            :style="{
              backgroundImage: composition.image
                ? `url('${composition.image}')`
                : null
            }"
          ></div>
          <h3 class="sr-only">Composition {{ composition.compositionId }}</h3>
        </a>
      </li>
    </ul>
  </main>
</template>

<style lang="scss">
@import '../../css/_mixins.scss';
@import '../../css/_variables.scss';

#app {
  flex-shrink: 0;
}
.explore-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 2em;
  margin: 1em 0;
  padding: 0;
}
.explore-list__item {
  display: block;
}
.explore-list__item__image {
  background: $color-white;
  background-size: cover;
  box-shadow: 0 0 0.1em $color-background-darker;

  @include square;
}
@media screen and (max-width: 1439px) {
  .explore-list {
    margin: 0;
    grid-template-columns: repeat(4, 1fr);
  }
}
@media screen and (max-width: 799px) {
  .explore-list {
    grid-template-columns: repeat(3, 1fr);
    column-gap: 1em;
    row-gap: 1em;
    margin: 0;
  }
}
@media screen and (max-width: 479px) {
  .explore-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media screen and (max-width: 359px) {
  .explore-list {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>

<script>
import PageHeader from '../components/PageHeader.vue';

export default {
  name: 'ListPage',
  components: {
    PageHeader
  },
  data: function () {
    return {
      compositions: []
    };
  },
  created() {
    const data = JSON.parse(
      document.getElementById('compositions-data').textContent
    );
    this.compositions = data.map(composition => {
      return {
        compositionId: composition.slug,
        compositionUrl: composition.url,
        images: composition.images.slice(0, 4),
        image: composition.image
      };
    });
  }
};
</script>
