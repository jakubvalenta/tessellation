import store from './store.js';
import App from './App.vue';
import DetailPage from './pages/DetailPage.vue';
import EditPage from './pages/EditPage.vue';
import IndexPage from './pages/IndexPage.vue';
import ListPage from './pages/ListPage.vue';
import NotFoundPage from './pages/NotFoundPage.vue';
import { createApp, h } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'index',
    component: IndexPage
  },
  {
    path: '/compositions/',
    name: 'list',
    component: ListPage
  },
  {
    path: '/compositions/new/',
    name: 'new',
    redirect: () => {
      return {
        name: 'edit',
        params: { compositionId: window.TESSELLATION_COMPOSITION_SLUG }
      };
    }
  },
  {
    path: '/compositions/:compositionId/',
    name: 'detail',
    component: DetailPage,
    props: route => {
      return {
        compositionId: route.params.compositionId
      };
    }
  },
  {
    path: '/compositions/:compositionId/edit/',
    name: 'edit',
    component: EditPage,
    props: route => {
      return {
        compositionId: route.params.compositionId
      };
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

const app = createApp({
  data() {
    return {
      store
    };
  },
  render() {
    return h(App);
  }
});

app.use(router);

app.mount('#app');
