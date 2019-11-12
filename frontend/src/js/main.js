import * as State from './state.js';
import App from './App.vue';
import Detail from './pages/Detail.vue';
import NotFound from './pages/NotFound.vue';
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.config.productionTip = false;
Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: route => {
        return {
          name: 'detail',
          params: { compositionId: window.TESSELLATION_COMPOSITION_SLUG },
          query: {
            edit: route.query.edit !== undefined ? route.query.edit : false,
            featured:
              route.query.featured !== undefined ? route.query.featured : true
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
      path: '*',
      component: NotFound
    }
  ]
});

new Vue({
  router,
  data: function() {
    const state = State.initState();
    return {
      state
    };
  },
  render: h => h(App)
}).$mount('#app');
