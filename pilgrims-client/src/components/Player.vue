<template>
    <div id="Player">
      <v-container dark fluid>
        <v-layout row justify-space-around>
          <v-flex xs2>
            <v-layout align-center justify-start row fill-height>
              <h1 style="padding:10px">{{playerName}}</h1>
            </v-layout>
          </v-flex>
          <v-flex xs6>
            <v-layout column align-space-around justify-start fill-height>
              <v-layout row align-center justify-start>
                <v-icon color="white">shopping_cart</v-icon>
                <v-chip>
                  Lumber: 5
                </v-chip>
                <v-chip>
                  Brick: 5
                </v-chip>
                <v-chip>
                  Wool: 5
                </v-chip>
                <v-chip>
                  Grain: 5
                </v-chip>
                <v-chip>
                  Ore: 5
                </v-chip>
              </v-layout>
              <v-layout row align-center justify-start>
                <v-icon color="white">shopping_cart</v-icon>
                <v-chip>
                  Dev-Cards: 5
                </v-chip>
                <v-chip>
                  Army: 5
                </v-chip>
                <v-chip>
                  Longest Road: 5
                </v-chip>
              </v-layout>
            </v-layout>
          </v-flex>
          <v-flex xs4>
            <v-layout row align-center justify-space-between fill-height>
              <v-btn>Build</v-btn>
              <v-btn>Trade</v-btn>
              <v-btn>Dev Cards</v-btn>
              <v-btn>End Turn</v-btn>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-container>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Player extends Vue {
  public playerName: string = undefined;
  public constructor() {
    super();
    this.playerName = this.$store.getters['game/getPlayerName'];
  }
}
</script>

<style lang="scss" scoped>
#Player {
  background-color: #bcaaa4;
}
</style>
