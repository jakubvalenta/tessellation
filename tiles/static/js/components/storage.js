import * as HTML from '../html.js';
import * as State from '../state.js';
import * as StorageLib from '../storage.js';

function createStorageLoadButtonClickHandler(dataIndex) {
  return state => {
    console.log(`Loading stored state ${dataIndex}`);
    const data = StorageLib.getStorageItem(dataIndex);
    const newState = StorageLib.readState(data);
    State.updateState(state, newState);
  };
}

function createStorageRemoveButtonClickHandler(dataIndex) {
  return state => {
    console.log(`Removing stored state ${dataIndex}`);
    StorageLib.removeStorageItem(dataIndex);
    initStorageForm(state);
  };
}

function initStorageItemLoadButton(state, dataIndex, elStorageItem) {
  const elLoadButton = document.createElement('button');
  elLoadButton.innerHTML = 'load';
  const loadHandler = createStorageLoadButtonClickHandler(dataIndex);
  elLoadButton.addEventListener('click', () => {
    loadHandler(state);
  });
  elStorageItem.appendChild(elLoadButton);
}

function initStorageItemRemoveButton(state, dataIndex, elStorageItem) {
  const elRemoveButton = document.createElement('button');
  elRemoveButton.innerHTML = 'remove';
  const removeHandler = createStorageRemoveButtonClickHandler(dataIndex);
  elRemoveButton.addEventListener('click', () => {
    removeHandler(state);
  });
  elStorageItem.appendChild(elRemoveButton);
}

function initStorageItemForm(state, timestamp, dataIndex, elContainer) {
  const elStorageItem = document.createElement('div');
  elStorageItem.innerHTML = timestamp;
  initStorageItemLoadButton(state, dataIndex, elStorageItem);
  initStorageItemRemoveButton(state, dataIndex, elStorageItem);
  elContainer.appendChild(elStorageItem);
}

function initStorageForm(state) {
  const elContainer = document.getElementById('js-storage');
  HTML.clearElement(elContainer);
  StorageLib.readStorageTimestamps().forEach((timestamp, dataIndex) =>
    initStorageItemForm(state, timestamp, dataIndex, elContainer)
  );
}

function bindStorageEvents(state) {
  const elSaveButton = document.getElementById('js-storage-save');
  elSaveButton.addEventListener('click', () => {
    console.log('Saving the state');
    StorageLib.storeState(state);
    initStorageForm(state);
  });
}

function bindPublishEvents(state) {
  const elSubmitButton = document.getElementById('js-publish-submit');
  const elStatus = document.getElementById('js-publish-status');
  elSubmitButton.addEventListener('click', () => {
    StorageLib.publishState(state)
      .then(() => {
        elStatus.innerHTML = 'Composition was successfully published';
      })
      .catch(err => {
        elStatus.innerHTML = 'Error while publishing the composition';
        console.error(err);
      });
  });
}

export default function Storage(state) {
  initStorageForm(state);
  bindStorageEvents(state);
  bindPublishEvents(state);
}
