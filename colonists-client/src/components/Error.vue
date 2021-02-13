<template>
  <span id="error-bar">
      <template v-for="(error, index) in errors">
        <div class="individual-error" @click="remove(index)" :key="index"><v-label dark>×</v-label> {{error}}</div>
      </template>
  </span>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Error extends Vue {
  private currentErrors: string[] = [];
  
  get errors() {
    const result = this.$store.getters['game/getError'];
    if (result !== '') this.currentErrors.push(result);
    return this.currentErrors;
  }

  public remove(index: number) {
    this.currentErrors.splice(index);
    this.$store.commit('game/setError', '');
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
  cursor: pointer;
}

.individual-error {
  border-bottom: darkred solid 1px;
}

</style>