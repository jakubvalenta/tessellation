<template>
  <div class="heading-row">
    <h2>Settings</h2>
  </div>
  <form action="javascript:void(0)">
    <table class="settings">
      <tr>
        <td>size</td>
        <td>
          <label for="form-settings-width" class="sr-only">columns</label>
          <input
            type="number"
            :value="width"
            @change="changeWidth"
            min="1"
            class="input-number"
            id="form-settings-width"
          />
          x
          <label for="form-settings-height" class="sr-only">rows</label>
          <input
            type="number"
            :value="height"
            @change="changeHeight"
            min="1"
            class="input-number"
            id="form-settings-height"
          />
        </td>
      </tr>
      <tr>
        <td>
          <label for="form-settings-update-stack-func-name">algorithm</label>
        </td>
        <td>
          <select
            id="form-settings-update-stack-func-name"
            @change="changeUpdateStackFuncName"
          >
            <option
              v-for="(updateStackFunc, name) in updateStackFuncs"
              :key="name"
              :value="name"
              :selected="updateStackFuncName === name"
            >
              {{ updateStackFunc.label }}
            </option>
          </select>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <label>
            <input
              type="checkbox"
              :checked="allowRotation"
              @change="changeAllowRotation"
            />
            allow tile rotation
          </label>
        </td>
      </tr>
    </table>
  </form>
</template>

<style lang="scss">
.settings {
  width: 100%;
  margin-top: 0;
  margin-bottom: 1em;
  border-collapse: collapse;

  td {
    padding: 0.25em 0;

    &:first-child {
      width: 100%;
    }
  }
}
</style>

<script>
import { UPDATE_STACK_FUNCS } from '../composition.js';

export default {
  name: 'SettingsForm',
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    updateStackFuncName: {
      type: String,
      required: true
    },
    allowRotation: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      updateStackFuncs: Object.fromEntries(
        Object.entries(UPDATE_STACK_FUNCS).sort((a, b) =>
          a[1].label.localeCompare(b[1].label)
        )
      )
    };
  },
  methods: {
    changeHeight: function (evt) {
      return this.$root.store.setSize({ height: evt.currentTarget.value });
    },
    changeWidth: function (evt) {
      return this.$root.store.setSize({ width: evt.currentTarget.value });
    },
    changeUpdateStackFuncName: function (evt) {
      return this.$root.store.setUpdateStackFuncName(evt.currentTarget.value);
    },
    changeAllowRotation: function (evt) {
      return this.$root.store.setAllowRotation(evt.currentTarget.checked);
    }
  }
};
</script>
