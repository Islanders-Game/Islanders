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
                  Lumber: {{ resourceCount('wood') }}
                </v-chip>
                <v-chip>
                  Brick: {{ resourceCount('clay')}}
                </v-chip>
                <v-chip>
                  Wool: {{ resourceCount('wool') }}
                </v-chip>
                <v-chip>
                  Grain: {{ resourceCount('grain') }}
                </v-chip>
                <v-chip>
                  Ore: {{ resourceCount('stone') }}
                </v-chip>
              </v-layout>
              <v-layout row align-center justify-start>
                <v-icon color="white">shopping_cart</v-icon>
                <v-chip>
                  Dev-Cards: {{ devCardsLength }}
                </v-chip>
                <v-chip>
                  Army: {{ knightCardsLength }}
                </v-chip>
                <v-chip>
                  Longest Road: {{ roadLength }}
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
import { Player as PlayerState } from '../../../pilgrims-shared/dist/Shared';
@Component
export default class Player extends Vue {
  public playerName: string = undefined;

  public constructor() {
    super();
    this.playerName = this.$store.getters['game/getPlayerName'];
  }

  get player(): PlayerState {
    return this.$store.getters['game/getPlayer'](this.playerName);
  }

  resourceCount(type: string) {
    const player = this.player;
    if (!player) {
      return 0;
    }
    const result = player.resources[type];
    return result ? result : 0;
  }

  get devCardsLength() {
    const player = this.player;
    if (!player) {
      return 0;
    }
    return player.devCards.filter((x) => x.type !== 'Knight').length;
  }

  get knightCardsLength() {
    const player = this.player;
    if (!player) {
      return 0;
    }
    return player.devCards.filter((x) => x.type === 'Knight').length;
  }

  get roadLength() {
    const player = this.player;
    if (!player) {
      return 0;
    }
    return player.roads.length; // todo calculate longest path ;D
  }
}
</script>

<style lang="scss" scoped>
#Player {
  background-color: #bcaaa4;
}
</style>
