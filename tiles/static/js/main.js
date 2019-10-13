((window, document) => {
  const SIDES = [0, 1, 2, 3];
  const CONNECTIONS = [1, 2, 3, 4, 5];
  const [LEFT, TOP, RIGHT, BOTTOM] = SIDES;

  /**
   * Shuffles array in place.
   * @param {Array} a items An array containing the items.
   * @see https://stackoverflow.com/a/6274381
   */
  function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

  /**
   * @see https://stackoverflow.com/a/2117523
   */
  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function isImageComplete(image) {
    return (
      image.url && image.connections.every(connection => connection !== null)
    );
  }

  function generateTiles(images) {
    const out = [];
    let i = 0;
    images.forEach(image => {
      if (isImageComplete(image)) {
        for (let rotation = 0; rotation < SIDES.length; rotation++) {
          out.push({
            image,
            rotation
          });
        }
      }
    });
    return out;
  }

  function createTileElement({ image, rotation }) {
    const el = document.createElement('div');
    el.classList.add('tile', `img-${image.imgId}`, `rot-${rotation}`);
    const elInner = document.createElement('div');
    elInner.classList.add(
      'tile-inner',
      ...image.connections.map((connection, i) => `conn-${i}-${connection}`)
    );
    el.appendChild(elInner);
    return el;
  }

  function clearElement(el) {
    el.innerHTML = '';
  }

  function shiftImageConnection(state, image, side) {
    const connection =
      image.connections[side] === null
        ? CONNECTIONS[0]
        : ((image.connections[side] + 1) % CONNECTIONS.length) + 1;
    image.connections[side] = connection;
    onImagesChange(state);
  }

  function renderImageConnections(state, image, elTile) {
    image.connections.forEach((connection, side) => {
      const elConnButton = document.createElement('button');
      elConnButton.classList.add('conn-button', `conn-button-${side}`);
      elConnButton.innerHTML = 'change connection';
      elConnButton.addEventListener('click', () =>
        shiftImageConnection(state, image, side)
      );
      elTile.appendChild(elConnButton);
    });
  }

  function renderImageFile(state, image, elImage) {
    const reader = new FileReader();
    reader.addEventListener('load', () =>
      changeImage(state, image, reader.result)
    );
    const elFile = document.createElement('input');
    elFile.type = 'file';
    elFile.addEventListener('change', evt => {
      const file = evt.currentTarget.files[0];
      if (file) {
        reader.readAsDataURL(file);
      }
    });
    elImage.appendChild(elFile);
  }

  function renderImageRemove(state, image, elImage) {
    const elRemove = document.createElement('button');
    elRemove.innerHTML = 'remove';
    elRemove.addEventListener('click', () => removeImage(state, image));
    elImage.appendChild(elRemove);
  }

  function renderImages(state) {
    const elContainer = document.getElementById('js-images');
    clearElement(elContainer);
    state.images.forEach(image => {
      if (image.url) {
        setImageBackground(image);
      }
      const elImage = document.createElement('div');
      elImage.className = 'col';
      const elTile = createTileElement({ image, rotation: 0 });
      renderImageConnections(state, image, elTile);
      elImage.appendChild(elTile);
      renderImageFile(state, image, elImage);
      renderImageRemove(state, image, elImage);
      elContainer.appendChild(elImage);
    });
  }

  function renderComposition(composition, elContainer) {
    composition.forEach(rowTiles => {
      const elRow = document.createElement('div');
      rowTiles.forEach(tile => elRow.appendChild(createTileElement(tile)));
      elContainer.appendChild(elRow);
    });
  }

  function findLeftTile(composition, col, row) {
    if (col === 0) {
      return null;
    }
    return composition[row][col - 1];
  }

  function findTopTile(composition, col, row) {
    if (row === 0) {
      return null;
    }
    return composition[row - 1][col];
  }

  function getConnection(tile, i) {
    return tile.image.connections[(i + tile.rotation) % SIDES.length];
  }

  function findRequirements(composition, col, row) {
    const leftTile = findLeftTile(composition, col, row);
    const topTile = findTopTile(composition, col, row);
    console.log('Left tile', leftTile);
    console.log('Top tile', topTile);
    const requirements = [
      [LEFT, leftTile ? getConnection(leftTile, RIGHT) : null],
      [TOP, topTile ? getConnection(topTile, BOTTOM) : null]
    ];
    console.log('Tile requirements', requirements);
    return requirements;
  }

  function fits(tile, requirements) {
    let i, side, requirement;
    console.log(`Trying if tile fits`, tile);
    for (i = 0; i < requirements.length; i++) {
      [side, requirement] = requirements[i];
      if (requirement !== null && getConnection(tile, side) !== requirement) {
        return false;
      }
    }
    return true;
  }

  function chooseTile(stack, requirements) {
    let i, tile;
    for (i = 0; i < stack.length; i++) {
      tile = stack[i];
      if (fits(tile, requirements)) {
        stack.splice(i, 1);
        stack.push(tile);
        return tile;
      }
    }
    return null;
  }

  function generateComposition(tiles, [width, height]) {
    const composition = Array.from(Array(height), () => new Array(width));
    const stack = Array.from(tiles);
    let row, col, tile;
    for (row = 0; row < height; row++) {
      for (col = 0; col < width; col++) {
        console.log(`Choosing tile for position ${row} ${col}`);
        tile = chooseTile(stack, findRequirements(composition, col, row));
        if (tile !== null) {
          console.log('Inserting tile on position', tile, row, col);
          composition[row][col] = tile;
        } else {
          console.log('No fitting tile found, stopping composition generation');
          return composition;
        }
      }
    }
    return composition;
  }

  function initState(state) {
    state.size = { width: 5, height: 5 };
    state.tiles = null;
    state.images = [];
  }

  function setSize(state, { width, height }) {
    if (width) {
      state.size.width = Math.max(width, 0);
    }
    if (height) {
      state.size.height = Math.max(height, 0);
    }
    onTilesChange(state);
  }

  function setImageBackground({ imgId, url }) {
    const rule = `.img-${imgId} { background-image: url('${url}') }`;
    const index = document.styleSheets[0].cssRules.length;
    console.log(`Inserting CSS rule ${rule} on index ${index}`);
    document.styleSheets[0].insertRule(rule, index);
  }

  function setAllImageBackgrounds(images) {
    images.forEach(image => image.url && setImageBackground(image));
  }

  function addImages(state, images) {
    images.forEach(image => {
      const imgId = uuidv4();
      console.log(`Adding new image ${imgId}`);
      state.images.push({
        imgId,
        ...image
      });
    });
    onImagesChange(state);
  }

  function newImage(state) {
    addImages(state, [
      {
        connections: [null, null, null, null],
        url: null
      }
    ]);
  }

  function changeImage(state, image, url) {
    console.log(`Picked file ${url}`);
    image.url = url;
    setImageBackground(image);
  }

  function findImageIndex(state, imgId) {
    let i, image;
    for (i = 0; i < state.images.length; i++) {
      image = state.images[i];
      if (image.imgId === imgId) {
        return i;
      }
    }
    return null;
  }

  function removeImage(state, { imgId }) {
    console.log(`Removing image ${imgId}`);
    const imgIndex = findImageIndex(state, imgId);
    state.images.splice(imgIndex, 1);
    onImagesChange(state);
  }

  function onImagesChange(state) {
    renderImages(state);
    state.tiles = generateTiles(state.images);
    onTilesChange(state);
  }

  function shuffleTiles(state) {
    shuffle(state.tiles);
    onTilesChange(state);
  }

  function onTilesChange(state) {
    const elComposition = document.getElementById('js-composition');
    const composition = generateComposition(state.tiles, [
      state.size.width,
      state.size.height
    ]);
    clearElement(elComposition);
    renderComposition(composition, elComposition);
  }

  function initSizeForm(state) {
    const elWidth = document.getElementById('js-width');
    const elHeight = document.getElementById('js-height');
    elWidth.value = state.size.width;
    elHeight.value = state.size.height;
  }

  function setStorageObject(obj) {
    window.localStorage.setItem('tiles', JSON.stringify(obj));
  }

  function getStorageObject() {
    const dataStr = window.localStorage.getItem('tiles');
    return dataStr && JSON.parse(dataStr);
  }

  function pushStorageItem(dataItem) {
    const data = getStorageObject() || [];
    data.push(dataItem);
    setStorageObject(data);
  }

  function getStorageItem(dataIndex) {
    return getStorageObject()[dataIndex];
  }

  function removeStorageItem(dataIndex) {
    const data = getStorageObject();
    data.splice(dataIndex, 1);
    setStorageObject(data);
  }

  function storeState(state) {
    const dataItem = {
      timestamp: new Date().toISOString(),
      size: state.size,
      images: state.images,
      tiles: state.tiles.map(({ image, rotation }) => {
        return { imgId: image.imgId, rotation };
      })
    };
    pushStorageItem(dataItem);
  }

  function getImage(state, imgId) {
    const imageIndex = findImageIndex(state, imgId);
    return imageIndex !== null ? state.images[imageIndex] : null;
  }

  function loadState(state, data) {
    if (data.size && data.size.width && data.size.height) {
      state.size.width = data.size.width;
      state.size.height = data.size.height;
    } else {
      console.error('Invalid size');
    }
    if (data.images) {
      state.images = [];
      data.images.forEach(image => {
        if (
          image.connections &&
          image.connections.length === SIDES.length &&
          image.url &&
          image.imgId
        ) {
          state.images.push(image);
        } else {
          console.error('Invalid image');
        }
      });
    }
    if (data.tiles) {
      state.tiles = [];
      data.tiles.forEach(({ imgId, rotation }) => {
        if (imgId && rotation !== undefined) {
          const image = getImage(state, imgId);
          if (image !== null) {
            state.tiles.push({ image, rotation });
          } else {
            console.error('Invalid tile');
          }
        }
      });
    }
    console.log('Loaded state', state);
  }

  function readStorageTimestamps() {
    const data = getStorageObject() || [];
    return data.map(({ timestamp }) => timestamp);
  }

  function createStorageLoadButtonClickHandler(dataIndex) {
    return state => {
      console.log(`Loading stored state ${dataIndex}`);
      const data = getStorageItem(dataIndex);
      loadState(state, data);
      renderImages(state);
      initSizeForm(state);
      onTilesChange(state);
    };
  }

  function createStorageRemoveButtonClickHandler(dataIndex) {
    return state => {
      console.log(`Removing stored state ${dataIndex}`);
      removeStorageItem(dataIndex);
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
    clearElement(elContainer);
    readStorageTimestamps().forEach((timestamp, dataIndex) =>
      initStorageItemForm(state, timestamp, dataIndex, elContainer)
    );
  }

  function bindStorageEvents(state) {
    const elSaveButton = document.getElementById('js-storage-save');
    elSaveButton.addEventListener('click', () => {
      console.log('Saving the state');
      storeState(state);
      initStorageForm(state);
    });
  }

  function bindImagesEvents(state) {
    const elAddButton = document.getElementById('js-images-add');
    elAddButton.addEventListener('click', () => newImage(state));
  }

  function bindModeEvents(state) {
    const elRadios = document.getElementsByName('js-mode-preview');
    elRadios.forEach(el => {
      el.checked = el.getAttribute('checked');
      el.addEventListener('click', evt =>
        document.body.classList.toggle(
          'mode-final',
          evt.currentTarget.value !== '1'
        )
      );
    });
  }

  function bindShuffleEvents(state) {
    const elButton = document.getElementById('js-shuffle');
    elButton.addEventListener('click', () => shuffleTiles(state));
  }

  function bindSizeEvents(state) {
    const elWidth = document.getElementById('js-width');
    const elHeight = document.getElementById('js-height');
    elWidth.addEventListener('change', evt =>
      setSize(state, { width: evt.currentTarget.value })
    );
    elHeight.addEventListener('change', evt =>
      setSize(state, { height: evt.currentTarget.value })
    );
  }

  function pageNew(data) {
    const state = {};
    initState(state);
    loadState(state, data);

    initSizeForm(state);
    initStorageForm(state);

    bindImagesEvents(state);
    bindModeEvents(state);
    bindShuffleEvents(state);
    bindSizeEvents(state);
    bindStorageEvents(state);

    onImagesChange(state);
  }

  function pageDetail(data) {
    const state = {};
    initState(state);
    loadState(state, data);

    setAllImageBackgrounds(state.images);
    onTilesChange(state);
  }

  window.tiles = { pageNew, pageDetail };
})(this, this.document);
