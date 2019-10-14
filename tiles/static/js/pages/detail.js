import * as State from '../state.js';
import * as StorageLib from '../storage.js';
import Composition from '../components/composition.js';

export function init(data) {
  const state = State.initState();
  Composition(state);
  const newState = StorageLib.readState(data);
  State.updateState(state, newState);
}
