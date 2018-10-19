<template>
    <div id="CustomizeGame">
      <v-container dark fluid>
        <v-layout row justify-space-around>
          <v-flex xs3>
            <v-layout align-center justify-start row fill-height>
              <h1 style="color: whitesmoke">{{playerName}}</h1>
            </v-layout>
          </v-flex>
          <v-flex xs6>
            <v-layout column align-space-around justify-start fill-height>
              <v-layout row align-center justify-start>
                <v-btn @click="randomizeMap">Randomize Map</v-btn>
              </v-layout>
              <v-layout row align-center justify-start>

              </v-layout>
            </v-layout>
          </v-flex>
          <v-flex xs3>
            <v-layout align-center row wrap fill-height>
                <v-btn @click="startGame">Start Game</v-btn>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-container>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { World, WorldGenerator, Tile } from '../../../pilgrims-shared/dist/Shared';
@Component
export default class CustomizeGame extends Vue {
  public playerName: string = undefined;
  private worldGenerator: WorldGenerator;

  public constructor() {
    super();
    this.playerName = this.$store.getters['game/getPlayerName'];
    this.worldGenerator = new WorldGenerator();
  }

  get world() {
    return this.$store.state.game.world as World;
  }

  private async startGame() {
      await this.$store.dispatch('game/startGame');
  }

  private async randomizeMap() {
    const map: Tile[] = this.worldGenerator.generateRandomMap();
    await this.$store.dispatch('game/updateMap', map);
  }
}
</script>

<style lang="scss" scoped>
#CustomizeGame {
  background-color: #393939;
}
</style>
