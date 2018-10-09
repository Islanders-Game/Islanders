<template>
    <div id="Map">
      <h1>
        Map
      </h1>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Map extends Vue {
  @Prop()
  private msg!: string;
}
</script>

<style lang="scss" scoped>
#Map {
  order: 0;
  flex: 3 1 auto;
  align-self: auto;
  background-color: #b3e5fc;
  margin-right: 0;
}
</style>
