import store from './store.js';
import App from './App.vue';
import { createApp, h } from 'vue';

export function createPage(mainComponent) {
  const app = createApp({
    components: {
      App,
      mainComponent
    },
    data() {
      return {
        store
      };
    },
    render() {
      return h(App, {}, h(mainComponent));
    }
  });

  app.mount('#app');
}
