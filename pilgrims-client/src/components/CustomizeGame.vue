<template>
    <v-footer dark color="#393939" id="CustomizeGame" height="auto">
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
              <v-flex xs3>
                <v-slider dark 
                  v-model="radius"
                  thumb-label
                  label="Radius"
                  max="30"
                  min="2"
                ></v-slider>
              </v-flex>
              <v-flex xs1></v-flex>
              <v-flex xs2>
                  <v-slider dark 
                  v-model="numberOfIslands"
                  thumb-label
                  label="Landmasses"
                  max="12"
                  min="0"
                ></v-slider>
              </v-flex>
            </v-layout>
          </v-layout>
        </v-flex>
        <v-flex xs3>
          <v-layout align-center row wrap fill-height>
              <v-btn @click="startGame">Start Game</v-btn>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-footer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  World,
  WorldGenerator,
  Tile,
} from '../../../pilgrims-shared/dist/Shared';
@Component
export default class CustomizeGame extends Vue {
  public playerName: string = undefined;
  public mask = '##';
  public radius: number = 2;
  public numberOfIslands: number = 0;
  private worldGenerator: WorldGenerator;

  public constructor() {
    super();
    this.playerName = this.$store.state.game.playerName;
    this.worldGenerator = new WorldGenerator();
  }

  get world() {
    return this.$store.state.game.world as World;
  }

  private async startGame() {
    await this.$store.dispatch('game/startGame');
  }

  private async randomizeMap() {
    const map: Tile[] = this.worldGenerator.generateRandomMap(
      this.radius,
      this.numberOfIslands,
    );
    await this.$store.dispatch('game/updateMap', map);
  }
}
</script>

<style lang="scss" scoped>
#CustomizeGame {
  padding: 20px;
}
</style>
