<template>
  <div id="error-bar" window dark v-show="visible">{{error}}</div> 
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Error extends Vue {
  public visible = true;

  get error() {
    const result = this.$store.getters['game/getError'];
    console.log(result);
    this.visible = !!result && result.length > 0;
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
#error-bar {
  padding-left: 6px;
  position: absolute;
  background-color: #B71C1C;
  width: 100%;
  font-family: Roboto, sans-serif;
  font-size: 0.9rem;
  color: white;
  box-shadow: black 0 0px 6px;
}
</style>