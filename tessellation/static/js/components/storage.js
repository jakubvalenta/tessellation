import * as HTML from '../html.js';
import * as State from '../state.js';
import * as StorageLib from '../storage.js';
import { formatDate } from '../utils/date.js';

const TEXT_DELETE = 'x';
const CLASS_BUTTON_SECONDARY = 'button-secondary';

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
  elButton.className = CLASS_BUTTON_SECONDARY;
  elButton.textContent = TEXT_DELETE;
  const handler = createDraftsDeleteButtonClickHandler(dataIndex);
  elButton.addEventListener('click', () => {
    handler(state);
  });
  elItem.appendChild(elButton);
}

function initDraftsItemForm(state, date, id, dataIndex, elContainer) {
  const elRow = document.createElement('tr');
  HTML.createTableCell(elRow).textContent = `${id} ${formatDate(date)}`;
  initDraftsItemLoadButton(state, dataIndex, HTML.createTableCell(elRow));
  initDraftsItemDeleteButton(state, dataIndex, HTML.createTableCell(elRow));
  elContainer.appendChild(elRow);
}

function initDraftsForm(state) {
  const elContainer = document.getElementById('js-drafts-list');
  const elEmpty = document.getElementById('js-drafts-empty');
  const timestamps = StorageLib.readStorageTimestamps();
  HTML.clearElement(elContainer);
  if (timestamps.length) {
    elEmpty.style.display = 'none';
    timestamps.forEach(({ timestamp, dataIndex }, index) => {
      initDraftsItemForm(
        state,
        new Date(timestamp),
        timestamps.length - index,
        dataIndex,
        elContainer
      );
    });
  } else {
    elEmpty.style.display = 'block';
  }
}

function createPublishedLoadButtonClickHandler(compositionId, func) {
  return state => {
    console.log(`Loading published state ${compositionId}`);
    func(compositionId).then(data => {
      const newState = StorageLib.deserializeState(data);
      State.updateState(state, newState);
    });
  };
}

function createPublishedDeleteButtonClickHandler(
  localState,
  compositionId,
  elStatus
) {
  return state => {
    console.log(`Deleting published state ${compositionId}`);
    StorageLib.deletePublishedComposition(compositionId).then(
      () => {
        elStatus.textContent = 'Composition was successfully deleted';
        elStatus.classList.remove('error');
        elStatus.classList.add('success');
        initPublishedForm(state, localState, elStatus);
      },
      () => {
        elStatus.textContent = 'Error while deleting composition';
        elStatus.classList.remove('success');
        elStatus.classList.add('error');
      }
    );
  };
}

function initPublishedItemLoadButton(state, compositionId, elItem, func) {
  const elButton = document.createElement('button');
  elButton.textContent = 'load';
  const handler = createPublishedLoadButtonClickHandler(compositionId, func);
  elButton.addEventListener('click', () => {
    handler(state);
  });
  elItem.appendChild(elButton);
}

function initPublishedItemDeleteButton(
  state,
  localState,
  compositionId,
  elItem,
  elStatus
) {
  const elButton = document.createElement('button');
  elButton.className = CLASS_BUTTON_SECONDARY;
  elButton.textContent = TEXT_DELETE;
  const handler = createPublishedDeleteButtonClickHandler(
    localState,
    compositionId,
    elStatus
  );
  elButton.addEventListener('click', () => {
    handler(state);
  });
  elItem.appendChild(elButton);
}

function initPublishedItemForm(
  state,
  localState,
  date,
  id,
  compositionId,
  compositionUrl,
  name,
  isPublic,
  elContainer,
  elStatus
) {
  const elRow = document.createElement('tr');
  HTML.createTableCell(elRow).textContent =
    id + ' ' + (name || formatDate(date));
  const elCellLink = HTML.createTableCell(elRow);
  if (isPublic) {
    elCellLink.appendChild(HTML.createLink(compositionUrl, 'permalink'));
  }
  initPublishedItemLoadButton(
    state,
    compositionId,
    HTML.createTableCell(elRow),
    StorageLib.getPublishedComposition
  );
  initPublishedItemDeleteButton(
    state,
    localState,
    compositionId,
    HTML.createTableCell(elRow),
    elStatus
  );
  elContainer.appendChild(elRow);
}

function initSamplesItemForm(state, id, compositionId, name, elContainer) {
  const elRow = document.createElement('tr');
  HTML.createTableCell(elRow).textContent = id + ' ' + name;
  initPublishedItemLoadButton(
    state,
    compositionId,
    HTML.createTableCell(elRow),
    StorageLib.getSampleComposition
  );
  elContainer.appendChild(elRow);
}

function initPublishedForm(state, localState, elStatus) {
  const elContainer = document.getElementById('js-published-list');
  const elEmpty = document.getElementById('js-published-empty');
  const elLoading = document.getElementById('js-published-loading');
  elEmpty.style.display = 'none';
  elLoading.style.display = 'block';
  StorageLib.getPublishedCompositions().then(data => {
    localState.publishedCompositions = data;
    HTML.clearElement(elContainer);
    elLoading.style.display = 'none';
    if (!data.length) {
      elEmpty.style.display = 'block';
      return;
    }
    data.forEach((composition, index) =>
      initPublishedItemForm(
        state,
        localState,
        new Date(composition.created_at),
        data.length - index,
        composition.id,
        composition.url,
        composition.name,
        composition.public,
        elContainer,
        elStatus
      )
    );
  });
}

function initSamplesForm(state, elStatus) {
  const elContainer = document.getElementById('js-samples-list');
  const elLoading = document.getElementById('js-samples-loading');
  elLoading.style.display = 'block';
  StorageLib.getSampleCompositions().then(data => {
    HTML.clearElement(elContainer);
    elLoading.style.display = 'none';
    data.forEach((composition, index) =>
      initSamplesItemForm(
        state,
        data.length - index,
        composition.id,
        composition.name,
        elContainer
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

function validateLocalStateBeforePublish(localState) {
  if (
    localState.publishedCompositions.length >=
    StorageLib.MAX_COMPOSITIONS_PER_USER
  ) {
    return 'You have reached the maximum number of published compositions. Delete some compositions to be able to publish new ones.';
  }
  return null;
}

function validate(func, elStatus) {
  const err = func();
  if (!err) {
    return true;
  }
  elStatus.textContent = err;
  elStatus.classList.remove('success');
  elStatus.classList.add('error');
  return false;
}

function validateAll(funcs, elStatus) {
  let i, func;
  for (let i = 0; i < funcs.length; i++) {
    func = funcs[i];
    if (!validate(func, elStatus)) {
      return false;
    }
  }
  return true;
}

function bindPublishEvents(state, localState, elStatus) {
  const elSubmitButton = document.getElementById('js-published-submit');
  elSubmitButton.addEventListener('click', () => {
    if (
      !validateAll(
        [
          () => validateLocalStateBeforePublish(localState),
          () => StorageLib.validateStateBeforePublish(state)
        ],
        elStatus
      )
    ) {
      return;
    }
    StorageLib.publishState(state)
      .then(() => {
        elStatus.textContent = 'Composition was successfully published';
        elStatus.classList.remove('error');
        elStatus.classList.add('success');
        initPublishedForm(state, localState, elStatus);
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
  const localState = {
    publishedCompositions: []
  };

  initDraftsForm(state);
  bindDraftsEvents(state);

  const elStatus = document.getElementById('js-published-status');
  if (elStatus) {
    initPublishedForm(state, localState, elStatus);
    bindPublishEvents(state, localState, elStatus);
  }

  initSamplesForm(state, elStatus);
}
