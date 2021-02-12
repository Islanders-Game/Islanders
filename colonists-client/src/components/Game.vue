<template>
  <v-content>
  <v-container fluid class="fill-height" id="Game">
    <v-row no-gutters class="top-ui">
      <v-col sm="9" @mousemove="mouseOver" class="fill-height">
        <Error />
        <Map class="fill-height"></Map>
        <GameInfo v-bind:showGameInfo="showGameInfo"></GameInfo>
      </v-col>
      <v-col sm="3" class="fill-height">
        <Overview class="fill-height"/>
      </v-col>
    </v-row>
    <v-row no-gutters class="bottom-ui">
      <CustomizeGame v-if="!started"/>
      <Player v-else/>
    </v-row>
  </v-container>
  </v-content>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
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
.top-ui {
  height: 75%;
  padding: 0;
  margin: 0;
}

.bottom-ui {
  padding: 0;
  margin-top: 0px !important;
  height: 25%;
  background: #1e1e1e
}

#Game {
  height: 100%;
  padding: 0px;
}

</style>
