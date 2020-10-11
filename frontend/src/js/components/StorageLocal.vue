<template>
  <div>
    <div class="heading-row">
      <h2>Drafts</h2>
      <button
        @click="createItem"
        data-intro="You can save the generated composition to your device using this button. Note that when you open Tessellation on a second device, you will not see the compositions you saved on the first device."
      >
        save draft
      </button>
    </div>
    <p class="text-status">these compositions are stored only on this device</p>
    <p class="storage-empty text-status" v-show="!items.length">empty</p>
    <table class="storage-list">
      <tr v-for="item in items" :key="`${item.dataIndex}-${item.name}`">
        <td>{{ item.id }} {{ item.name }}</td>
        <td>
          <button @click="loadItem(item.dataIndex)">load</button>
        </td>
        <td>
          <button class="button-secondary" @click="deleteItem(item.dataIndex)">
            x
          </button>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import * as StorageLib from '../storage.js';
import { formatDate } from '../utils/date.js';
import { log } from '../log.js';

export default {
  name: 'StorageLocal',
  data: function () {
    return {
      items: []
    };
  },
  mounted: function () {
    this.listItems();
  },
  methods: {
    listItems: function () {
      const timestamps = StorageLib.readStorageTimestamps();
      this.items = timestamps.map(({ timestamp, dataIndex }, index) => {
        return {
          id: timestamps.length - index,
          name: formatDate(new Date(timestamp)),
          dataIndex
        };
      });
    },
    createItem: function () {
      log('Saving the state');
      StorageLib.storeState(this.$root.store.state);
      this.listItems();
    },
    loadItem: function (dataIndex) {
      log(`Loading stored state ${dataIndex}`);
      const data = StorageLib.getStorageItem(dataIndex);
      const newState = StorageLib.deserializeState(data);
      this.$root.store.updateState(newState);
    },
    deleteItem: function (dataIndex) {
      log(`Deleting stored state ${dataIndex}`);
      StorageLib.deleteStorageItem(dataIndex);
      this.listItems();
    }
  }
};
</script>
