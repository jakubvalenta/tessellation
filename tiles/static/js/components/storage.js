import * as HTML from '../html.js';
import * as State from '../state.js';
import * as StorageLib from '../storage.js';

function createDraftsLoadButtonClickHandler(dataIndex) {
  return state => {
    console.log(`Loading stored state ${dataIndex}`);
    const data = StorageLib.getStorageItem(dataIndex);
    const newState = StorageLib.deserializeState(data);
    State.updateState(state, newState);
  };
}

function createDraftsDeleteButtonClickHandler(dataIndex) {
  return state => {
    console.log(`Deleting stored state ${dataIndex}`);
    StorageLib.deleteStorageItem(dataIndex);
    initDraftsForm(state);
  };
}

function initDraftsItemLoadButton(state, dataIndex, elItem) {
  const elButton = document.createElement('button');
  elButton.textContent = 'load';
  const handler = createDraftsLoadButtonClickHandler(dataIndex);
  elButton.addEventListener('click', () => {
    handler(state);
  });
  elItem.appendChild(elButton);
}

function initDraftsItemDeleteButton(state, dataIndex, elItem) {
  const elButton = document.createElement('button');
  elButton.textContent = 'delete';
  const handler = createDraftsDeleteButtonClickHandler(dataIndex);
  elButton.addEventListener('click', () => {
    handler(state);
  });
  elItem.appendChild(elButton);
}

function initDraftsItemForm(state, timestamp, dataIndex, elContainer) {
  const elItem = document.createElement('div');
  elItem.textContent = timestamp;
  initDraftsItemLoadButton(state, dataIndex, elItem);
  initDraftsItemDeleteButton(state, dataIndex, elItem);
  elContainer.appendChild(elItem);
}

function initDraftsForm(state) {
  const elContainer = document.getElementById('js-drafts-list');
  HTML.clearElement(elContainer);
  StorageLib.readStorageTimestamps().forEach((timestamp, dataIndex) =>
    initDraftsItemForm(state, timestamp, dataIndex, elContainer)
  );
}

function createPublishedLoadButtonClickHandler(compositionId) {
  return state => {
    console.log(`Loading published state ${compositionId}`);
    StorageLib.getPublishedComposition(compositionId).then(data => {
      const newState = StorageLib.deserializeState(data);
      State.updateState(state, newState);
    });
  };
}

function createPublishedDeleteButtonClickHandler(compositionId, elStatus) {
  return state => {
    console.log(`Deleting published state ${compositionId}`);
    StorageLib.deletePublishedComposition(compositionId).then(
      () => {
        elStatus.textContent = 'Composition was successfully deleted';
        elStatus.classList.remove('error');
        elStatus.classList.add('success');
        initPublishedForm(state, elStatus);
      },
      () => {
        elStatus.textContent = 'Error while deleting composition';
        elStatus.classList.remove('success');
        elStatus.classList.add('error');
      }
    );
  };
}

function initPublishedItemLoadButton(state, compositionId, elItem) {
  const elButton = document.createElement('button');
  elButton.textContent = 'load';
  const handler = createPublishedLoadButtonClickHandler(compositionId);
  elButton.addEventListener('click', () => {
    handler(state);
  });
  elItem.appendChild(elButton);
}

function initPublishedItemDeleteButton(state, compositionId, elItem, elStatus) {
  const elButton = document.createElement('button');
  elButton.textContent = 'delete';
  const handler = createPublishedDeleteButtonClickHandler(
    compositionId,
    elStatus
  );
  elButton.addEventListener('click', () => {
    handler(state);
  });
  elItem.appendChild(elButton);
}

function createTableCell(elRow) {
  const elCell = document.createElement('td');
  elRow.appendChild(elCell);
  return elCell;
}

function createLink(href, text) {
  const elLink = document.createElement('a');
  elLink.href = href;
  elLink.textContent = text;
  return elLink;
}

function initPublishedItemForm(
  state,
  timestamp,
  compositionId,
  compositionUrl,
  elContainer,
  elStatus
) {
  const elRow = document.createElement('tr');
  createTableCell(elRow).textContent = timestamp;
  createTableCell(elRow).appendChild(createLink(compositionUrl, 'permalink'));
  initPublishedItemLoadButton(state, compositionId, createTableCell(elRow));
  initPublishedItemDeleteButton(
    state,
    compositionId,
    createTableCell(elRow),
    elStatus
  );
  elContainer.appendChild(elRow);
}

function initPublishedForm(state, elStatus) {
  const elContainer = document.getElementById('js-published-list');
  const elEmpty = document.getElementById('js-published-empty');
  const elLoading = document.getElementById('js-published-loading');
  elEmpty.style.display = 'none';
  elLoading.style.display = 'block';
  StorageLib.getPublishedCompositions().then(data => {
    HTML.clearElement(elContainer);
    elLoading.style.display = 'none';
    if (!data.length) {
      elEmpty.style.display = 'block';
      return;
    }
    data.forEach(composition =>
      initPublishedItemForm(
        state,
        composition.created_at,
        composition.id,
        composition.url,
        elContainer,
        elStatus
      )
    );
  });
}

function bindDraftsEvents(state) {
  const elButton = document.getElementById('js-drafts-save');
  elButton.addEventListener('click', () => {
    console.log('Saving the state');
    StorageLib.storeState(state);
    initDraftsForm(state);
  });
}

function bindPublishEvents(state, elStatus) {
  const elSubmitButton = document.getElementById('js-published-submit');
  elSubmitButton.addEventListener('click', () => {
    StorageLib.publishState(state)
      .then(() => {
        elStatus.textContent = 'Composition was successfully published';
        elStatus.classList.remove('error');
        elStatus.classList.add('success');
        initPublishedForm(state, elStatus);
      })
      .catch(err => {
        elStatus.textContent = 'Error while publishing the composition';
        elStatus.classList.remove('success');
        elStatus.classList.add('error');
        console.error(err);
      });
  });
}

export default function Storage(state) {
  initDraftsForm(state);
  bindDraftsEvents(state);

  const elStatus = document.getElementById('js-published-status');
  if (elStatus) {
    initPublishedForm(state, elStatus);
    bindPublishEvents(state, elStatus);
  }
}
