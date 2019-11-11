<template>
  <div>
    <Featured />
    <Detail :compositionId="compositionId" />
  </div>
</template>

<script>
import Detail from '../components/Detail.vue';
import Featured from '../components/Featured.vue';

export default {
  name: 'Index',
  props: {
    compositionId: {
      type: String,
      required: true
    }
  },
  components: {
    Detail,
    Featured
  }
};
</script>
