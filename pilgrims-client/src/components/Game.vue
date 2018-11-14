<template>
  <v-container fluid id="Game">
    <v-layout column fill-height>
      <v-layout row class="main-area">
        <p id=gameID>
          <span v-if="gameID">Tell your friends to join this game at: <b>{{gameID}}</b></span>
          <span v-if="currentPlayer" class="pad">Current player: <b>{{currentPlayer.name}}</b></span>
          <span v-if="currentDie" class="pad">Current die: <b>{{currentDie.toString()}}</b></span>
        </p>
        <v-flex xs9>
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
