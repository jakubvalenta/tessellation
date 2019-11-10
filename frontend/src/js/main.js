import * as State from './state.js';
import App from './App.vue';
import Index from './pages/Index.vue';
import NotFound from './pages/NotFound.vue';
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.config.productionTip = false;
Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: Index,
      props: route => {
        return {
          compositionId: route.query.c,
          edit: route.query.edit || false,
          list: route.query.list || false
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
