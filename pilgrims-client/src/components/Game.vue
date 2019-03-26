<template>
  <v-container fluid id="Game">
    <Error></Error>
    <v-layout column fill-height>
      <v-layout row class="main-area">
        <v-flex xs9 @mousemove="mouseOver">
          <GameInfo v-bind:showGameInfo="showGameInfo"></GameInfo>
          <Map/>
        </v-flex>
        <v-flex xs3>
          <Overview/>
        </v-flex>
      </v-layout>
      <CustomizeGame v-if="!started"/>
      <Player v-else/>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Overview from './Overview.vue';
import Map from './Map.vue';
import Player from './Player.vue';
import CustomizeGame from './CustomizeGame.vue';
import Error from './Error.vue';
import GameInfo from './GameInfo.vue';

@Component({
  components: {
    Overview,
    Map,
    Player,
    CustomizeGame,
    Error,
    GameInfo,
  },
})
export default class Game extends Vue {
  public showGameInfo: boolean = true;

  get started() {
    return this.$store.getters['game/getIsGameStarted'];
  }

  public mouseOver(e: MouseEvent) {
    if (e.offsetY <= 70) {
      this.showGameInfo = true;
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
</style>
