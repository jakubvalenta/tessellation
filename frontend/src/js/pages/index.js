import * as State from '../state.js';
import * as StorageLib from '../storage.js';
import Index from './Index.vue';
import Vue from 'vue';

Vue.config.productionTip = false;

new Vue({
  data: function() {
    const state = State.initState();
    const data = JSON.parse(
      document.getElementById('composition-data').textContent
    );
    const newState = StorageLib.deserializeState(data);
    state.updateState(newState);
    return {
      state
    };
  },
  render: h => h(Index)
}).$mount('#app');
