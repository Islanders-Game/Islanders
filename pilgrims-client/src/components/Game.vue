<template>
  <v-container fluid id="Game">
    <v-layout column fill-height>
      <v-layout row class="main-area">
        <v-flex xs9 @mousemove="mouseOver">
          <v-snackbar style="text-align: left"
            v-model="showGameInfo"
            :timeout="5000"
            :top="'top'">
          <small v-if="gameID">Tell your friends to join this game at: <b>{{gameID}}</b></small>
          <small v-if="currentPlayer" class="pad">Current player:<b>{{currentPlayer.name}}</b></small>
          <small v-if="currentDie" class="pad">Current die: <b>{{currentDie.toString()}}</b></small>
          </v-snackbar>
          <Map/>
        </v-flex>
        <v-flex xs3>
          <Overview/>
        </v-flex>
      </v-layout>
      <CustomizeGame v-if="!started"/>
      <Player v-else/>
    </v-layout>
    <Error></Error>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Overview from './Overview.vue';
import Map from './Map.vue';
import Player from './Player.vue';
import CustomizeGame from './CustomizeGame.vue';
import Error from './Error.vue';

@Component({
  components: {
    Overview,
    Map,
    Player,
    CustomizeGame,
    Error,
  },
})
export default class Game extends Vue {
  public showGameInfo = false;

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

  public mouseOver(e: MouseEvent) {
    if (e.offsetY <= 70) {
      if (e) this.showGameInfo = true;
    } else {
      this.showGameInfo = false;
    }
  }
}
</script>

<style lang="scss" scoped>
#Game {
  padding: 0px;
}
#gameID {
  position: absolute;
  top: 0;
  background-color: rgba(255, 255, 255, 0.4);
  text-align: left;
  width: 100%;
  padding-left: 6px;
  font-size: 12px;
}

.pad {
  padding: 0px 10px;
}
</style>
