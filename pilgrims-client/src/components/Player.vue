<template>
    <div id="Player">
      <h1 style="color: white">
        Player
      </h1>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Player extends Vue {
  @Prop()
  private msg!: string;
}
</script>

<style lang="scss" scoped>
#Player {
  order: 0;
  flex: 1 1 auto;
  align-self: auto;
  background-color: red;
  margin-right: 0;
}
</style>
