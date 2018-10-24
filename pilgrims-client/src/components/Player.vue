<template>
    <v-footer color="#393939" id="Player" height="auto">
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
              <v-menu bottom offset-y>
                <v-btn dark slot="activator">Build</v-btn>
                <v-list dark>
                  <v-list-tile @click="setIsBuildingHouse(true)">
                    <v-list-tile-title>House</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile @click="setIsBuildingCity(true)">
                    <v-list-tile-title>City</v-list-tile-title>
                  </v-list-tile>
                  <v-list-tile @click="setIsBuildingRoad(true)">
                    <v-list-tile-title dark>Road</v-list-tile-title>
                  </v-list-tile>
                </v-list>
              </v-menu>
              <Trade></Trade>
              <v-btn dark>Dev Cards</v-btn>
              <v-btn @click="endTurn">End Turn</v-btn>
            </v-layout>
          </v-flex>
        </v-layout>
    </v-footer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Player as PlayerState } from '../../../pilgrims-shared/dist/Shared';
import Trade from './Trade.vue';
import { EndTurnAction } from '../../../pilgrims-shared/dist/Action';

@Component({
  components: {
    Trade,
  },
})
export default class Player extends Vue {
  public playerName: string = undefined;

  public constructor() {
    super();
    this.playerName = this.$store.state.game.playerName;
  }

  public setIsBuildingHouse(flag: boolean) {
    this.$store.commit('ui/setIsBuildingHouse', flag);
  }

  public setIsBuildingCity(flag: boolean) {
    this.$store.commit('ui/setIsBuildingCity', flag);
  }

  public setIsBuildingRoad(flag: boolean) {
    this.$store.commit('ui/setIsBuildingRoad', flag);
  }

  public endTurn() {
    this.$store.dispatch('game/sendAction', new EndTurnAction(this.playerName));
  }

  private resourceCount(type: string) {
    const player = this.player;
    if (!player) {
      return 0;
    }
    const result = player.resources[type];
    return result ? result : 0;
  }

  get player(): PlayerState {
    return this.$store.getters['game/getPlayer'](this.playerName);
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

  get isBuildingHouse() {
    return this.$store.state.ui.isBuildingHouse;
  }
}
</script>

<style lang="scss" scoped>
#Player {
  padding: 20px;
}
</style>
