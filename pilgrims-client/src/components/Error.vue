<template>
    <v-alert id="error" dismissible :value="error" type="error" transition="scale-transition" v-model="visibility">{{error}}</v-alert> 
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Error extends Vue {
  public visibility: boolean = false;

  get error() {
    const result = this.$store.getters['game/getError'];
    if (!result) this.visibility = false;
    else this.visibility = true;
    return result;
  }

  @Watch('visibility')
  public removeError(newValue, oldValue) {
    if (!newValue) this.$store.commit('game/setError', '');
  }
}
</script>
<style lang="scss" scoped>
#error {
  position: absolute;
  top: 2%;
}
</style>