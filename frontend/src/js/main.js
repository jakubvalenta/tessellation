import store from './store.js';
import App from './App.vue';
import Detail from './pages/Detail.vue';
import NotFound from './pages/NotFound.vue';
import { createApp, h } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'index',
    redirect: route => {
      return {
        name: 'detail',
        params: { compositionId: window.TESSELLATION_COMPOSITION_SLUG },
        query: {
          edit: route.query.edit !== undefined ? route.query.edit : true,
          featured:
            route.query.featured !== undefined ? route.query.featured : false
        }
      };
    }
  },
  {
    path: '/:compositionId',
    name: 'detail',
    component: Detail,
    props: route => {
      return {
        compositionId: route.params.compositionId
      };
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound
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
