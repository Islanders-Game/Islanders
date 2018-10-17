<template>
    <div id="Player">
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
                <v-flex xs2>
                  <v-icon color="white">build</v-icon>
                </v-flex>
                <v-chip>
                  <v-avatar class="white">{{ resourceCount('wood') }}</v-avatar> lumber
                </v-chip>
                <v-chip>
                  <v-avatar class="white">{{ resourceCount('clay') }}</v-avatar> clay
                </v-chip>
                <v-chip>
                  <v-avatar class="white">{{ resourceCount('wool') }}</v-avatar> wool
                </v-chip>
                <v-chip>
                  <v-avatar class="white">{{ resourceCount('grain') }}</v-avatar> grain 
                </v-chip>
                <v-chip>
                  <v-avatar class="white">{{ resourceCount('stone') }}</v-avatar> stone
                </v-chip>
              </v-layout>
              <v-layout row align-center justify-start>
                <v-flex xs2>
                  <v-icon color="white">crop_portrait</v-icon>
                  <v-icon color="white">traffic</v-icon>
                </v-flex>
                <v-chip>
                  <v-avatar class="white">{{ devCardsLength }}</v-avatar> dev-cards
                </v-chip>
                <v-chip>
                  <v-avatar class="white">{{ knightCardsLength }}</v-avatar> knights
                </v-chip>
                <v-chip>
                  <v-avatar class="white">{{ roadLength }}</v-avatar> roads
                </v-chip>
              </v-layout>
            </v-layout>
          </v-flex>
          <v-flex xs3>
            <v-layout align-center row wrap fill-height>
              <v-btn dark>Build</v-btn>
              <v-btn dark>Trade</v-btn>
              <v-btn dark>Dev Cards</v-btn>
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
  background-color: #393939;
}
</style>
