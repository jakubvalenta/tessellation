import * as State from '../state.js';
import * as StorageLib from '../storage.js';
import Composition from '../components/composition.js';
import Images from '../components/images.js';
import Settings from '../components/settings.js';
import Storage from '../components/storage.js';

export function init(data) {
  const state = State.initState();
  Images(state);
  Settings(state);
  Storage(state);
  Composition(state);
  const newState = StorageLib.deserializeState(data);
  State.updateState(state, newState);
}
