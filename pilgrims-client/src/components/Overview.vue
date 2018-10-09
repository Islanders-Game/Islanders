<template>
    <div id="Overview">
      <h1 style="color: white">
        Overview
      </h1>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Overview extends Vue {
  @Prop()
  private msg!: string;
}
</script>

<style scoped lang="scss">
#Overview {
  order: 0;
  flex: 1 1 auto;
  align-self: auto;
  background-color: #25262a;
  margin-right: 0;
}
</style>
