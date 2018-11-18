<template>
    <v-snackbar style="text-align: left"
      v-model="showGameInfo"
      :timeout="5000"
      :top="'top'">
    <small v-if="gameID">Tell your friends to join this game at: <b>{{gameID}}</b></small>
    <small v-if="currentPlayer" class="pad">Current player:<b>{{currentPlayer.name}}</b></small>
    <small v-if="currentDie" class="pad">Current die: <b>{{currentDie.toString()}}</b></small>
    </v-snackbar>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class GameInfo extends Vue {
  @Prop
  public showGameInfo: boolean;

  get started() {
    return this.$store.getters['game/getIsGameStarted'];
  }
  get gameID() {
    return this.$store.state.game.gameId;
  }
  get currentPlayer() {
    return this.$store.getters['game/getCurrentPlayer'];
  }
  get currentDie() {
    return this.$store.getters['game/getCurrentDie'];
  }
}
</script>
<style lang="scss" scoped>
</style>