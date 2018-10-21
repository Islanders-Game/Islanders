<template>
    <v-alert id="error" dismissible :value="error" type="error" transition="scale-transition"> {{error}}</v-alert> 
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Error extends Vue {
  get error() {
    return this.$store.getters['game/getError'];
  }
}
</script>
<style lang="scss" scoped>
#error {
  position: absolute;
  top: 2%;
}
</style>