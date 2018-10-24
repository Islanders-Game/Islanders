<template>
  <v-container fluid id="Game">
    <v-layout column fill-height>
      <v-layout row class="main-area">
        <p v-if="gameID" id=gameID>Tell your friends to join this game at: <b>{{gameID}}</b></p>
        <v-flex xs9>
          <Map/>
        </v-flex>
        <v-flex xs3>
          <Overview/>
        </v-flex>
      </v-layout>
      <CustomizeGame v-if="!started"/>
      <Player v-if="started"/>
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
</style>
