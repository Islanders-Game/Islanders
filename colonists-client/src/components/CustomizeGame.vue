<template>
  <v-container
    id="CustomizeGame"
    fluid
  >
    <v-row>
      <v-col sm="2">
        <v-card
          dark
          outlined
          class="fill-height"
        >
          <v-list-item three-line>
            <v-list-item-content>
              <div class="overline">
                You
              </div>
              <v-list-item-title class="headline">
                {{ playerName }}
              </v-list-item-title>                
            </v-list-item-content>
            <v-list-item-avatar
              rounded
              size="30"
              :color="playerColor" 
            />
          </v-list-item>
        </v-card>
      </v-col>
      <v-col sm="7">
        <v-row no-gutters>
          <v-btn
            light
            @click="randomizeMap"
          >
            Randomize Map
          </v-btn>
        </v-row>
        <v-row><p /></v-row>
        <v-row>
          <v-col sm="3">
            <v-text-field
              v-model="radius"
              dark
              outlined
              dense
              label="Radius"
              max="12"
              min="2"
              type="number"
            />
          </v-col>
          <v-col sm="3">
            <v-text-field
              v-model="numberOfIslands"
              dark
              outlined
              dense
              thumb-label
              label="Number of Islands"
              type="number"
              max="12"
              min="0"
            />
          </v-col>
          <v-col sm="3">
            <v-text-field
              v-model="pointsToWin"
              dark
              outlined
              dense
              max="100"
              min="3"
              label="Points to Win"
              type="number"
            />
          </v-col>
        </v-row>
      </v-col>
      <v-col sm="3">
        <v-row no-gutters>
          <v-btn
            light
            @click="startGame"
          >
            Start Game
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import {
  World,
  WorldGenerator,
  Tile,
} from '../../../colonists-shared/dist/Shared';
@Component
export default class CustomizeGame extends Vue {
  public playerName: string = undefined;
  public mask = '##';
  public radius = 2;
  public numberOfIslands = 0;
  public pointsToWin = 10;
  private worldGenerator: WorldGenerator;

  public constructor() {
    super();
    this.playerName = this.$store.state.game.playerName;
    this.worldGenerator = new WorldGenerator();
  }

  get world(): World {
    return this.$store.state.game.world as World;
  }

  get playerColor(): string {
    return this.$store.getters['game/getPlayerColorAsHex'](this.playerName);
  }

  private async startGame() {
    await this.$store.dispatch('game/startGame');
  }

  @Watch('pointsToWin')
  private setPointsToWin() {
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
#player-name {
  color: white;
}
</style>
