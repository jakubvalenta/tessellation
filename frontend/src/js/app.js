import store from './store.js';
import App from './App.vue';
import { createApp, h } from 'vue';

export function createPage(component) {
  const app = createApp({
    components: {
      App,
      component
    },
    data() {
      return {
        store
      };
    },
    render() {
      return h(App, {}, h(component));
    }
  });

  app.mount('#app');
}
