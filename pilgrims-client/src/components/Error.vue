<template>
    <v-snackbar id="error" left top :value="error" color="error" v-model="visibility">{{error}}</v-snackbar> 
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Error extends Vue {
  public visibility: boolean = false;

  get error() {
    const result = this.$store.getters['game/getError'];
    if (!result) {
      this.visibility = false;
    } else {
      this.visibility = true;
    }
    return result;
  }

  @Watch('visibility')
  public removeError(newValue, oldValue) {
    if (!newValue) {
      this.$store.commit('game/setError', '');
    }
  }
}
</script>
<style lang="scss" scoped>
</style>