<template>
    <v-container fluid id="CustomizeGame">
      <v-row>
        <v-col sm="2">
          <v-card
            dark
            outlined class="fill-height">
            <v-list-item three-line>
              <v-list-item-content>
                <div class="overline">
                  You
                </div>
                <v-list-item-title class="headline">{{playerName}}</v-list-item-title>                
              </v-list-item-content>
              <v-list-item-avatar
                rounded
                size="30"
                :color="playerColor" 
              ></v-list-item-avatar>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col sm="7">
          <v-row no-gutters>
            <v-btn light @click="randomizeMap">Randomize Map</v-btn>
          </v-row>
          <v-row><p/></v-row>
          <v-row>
            <v-col sm="3">
              <v-text-field dark outlined dense
                v-model="radius"
                label="Radius"
                max="12"
                min="2"
                type="number"
              ></v-text-field>
            </v-col>
            <v-col sm="3">
              <v-text-field dark outlined dense
              v-model="numberOfIslands"
              thumb-label
              label="Number of Islands"
              type="number"
              max="12"
              min="0"
            ></v-text-field>
            </v-col>
            <v-col sm="3">
                <v-text-field dark outlined dense
                v-model="pointsToWin"
                max="100"
                min="3"
                label="Points to Win"
                type="number"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-col>
        <v-col sm="3">
          <v-row no-gutters>
            <v-btn light @click="startGame">Start Game</v-btn>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  World,
  WorldGenerator,
  Tile,
} from '../../../colonists-shared/dist/Shared';
@Component
export default class CustomizeGame extends Vue {
  public playerName: string = undefined;
  public mask = '##';
  public radius: number = 2;
  public numberOfIslands: number = 0;
  public pointsToWin: number = 3;
  private worldGenerator: WorldGenerator;

  public constructor() {
    super();
    this.playerName = this.$store.state.game.playerName;
    this.worldGenerator = new WorldGenerator();
  }

  get world() {
    return this.$store.state.game.world as World;
  }

  get playerColor() {
    return this.$store.getters['game/getPlayerColorAsHex'](this.playerName);
  }

  private async startGame() {
    await this.$store.dispatch('game/startGame');
  }

  @Watch('pointsToWin')
  private setPointsToWin(newPoints: number, oldPoints) {
    this.$store.commit('game/setPointsToWin', this.pointsToWin);
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

}

#player-name {
  color: white;
}
</style>
