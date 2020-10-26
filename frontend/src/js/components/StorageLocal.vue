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
import { formatDate } from '../utils/date.js';
import { log } from '../log.js';

function setStorageObject(obj) {
  window.localStorage.setItem('tiles', JSON.stringify(obj));
}

function getStorageObject() {
  const dataStr = window.localStorage.getItem('tiles');
  return dataStr && JSON.parse(dataStr);
}

function pushStorageItem(dataItem) {
  const data = getStorageObject() || [];
  dataItem.timestamp = new Date().toISOString();
  data.push(dataItem);
  setStorageObject(data);
}

function getStorageItem(dataIndex) {
  return getStorageObject()[dataIndex];
}

function deleteStorageItem(dataIndex) {
  const data = getStorageObject();
  data.splice(dataIndex, 1);
  setStorageObject(data);
}

function readStorageTimestamps() {
  const data = getStorageObject() || [];
  return data
    .map(({ timestamp }, dataIndex) => {
      return {
        timestamp,
        dataIndex
      };
    })
    .sort((a, b) => {
      if (a.timestamp < b.timestamp) {
        return -1;
      }
      if (a.timestamp > b.timestamp) {
        return 1;
      }
      return 0;
    })
    .reverse();
}

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
      const timestamps = readStorageTimestamps();
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
      const dataItem = this.$root.store.serialize();
      pushStorageItem(dataItem);
      this.listItems();
    },
    loadItem: function (dataIndex) {
      log(`Loading stored state ${dataIndex}`);
      const data = getStorageItem(dataIndex);
      const newState = this.$root.store.deserialize(data);
      return this.$root.store.updateState(newState);
    },
    deleteItem: function (dataIndex) {
      log(`Deleting stored state ${dataIndex}`);
      deleteStorageItem(dataIndex);
      this.listItems();
    }
  }
};
</script>
