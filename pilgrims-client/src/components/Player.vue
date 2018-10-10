<template>
    <div id="Player">
      <v-container fluid>
        <h1 style="color: white">
          Player
        </h1>
      </v-container>
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
  background-color: red;
}
</style>
