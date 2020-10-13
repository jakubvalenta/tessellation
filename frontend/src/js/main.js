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
    path: '/explore/',
    component: { render: () => h(App) },
    children: [
      {
        path: '',
        name: 'list',
        component: ListPage
      },
      {
        path: ':compositionId/',
        name: 'detail',
        component: DetailPage,
        props: route => {
          return {
            compositionId: route.params.compositionId
          };
        }
      }
    ]
  },
  {
    path: '/create/',
    component: { render: () => h(App) },
    children: [
      {
        path: '',
        name: 'create',
        component: EditPage,
        props: () => {
          return {
            compositionId: window.TESSELLATION_COMPOSITION_SLUG,
            create: true
          };
        }
      },
      {
        path: ':compositionId/',
        name: 'edit',
        component: EditPage,
        props: route => {
          return {
            compositionId: route.params.compositionId
          };
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: 'active',
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
