<template>
  <v-footer color="#393939" id="Player" height="auto">
    <v-container row justify-space-around>
      <v-flex xs3>
        <v-container align-center justify-start row>
          <h1 color="whitesmoke">{{playerName}}</h1>
        </v-container>
      </v-flex>
      <v-flex xs6>
        <v-container column align-space-around justify-start>
          <v-container row align-center justify-start>
            <v-flex xs2>
              <v-icon color="white">build</v-icon>
            </v-flex>
            <v-chip>
              <v-avatar class="white">{{ resourceCount('wood') }}</v-avatar>lumber
            </v-chip>
            <v-chip>
              <v-avatar class="white">{{ resourceCount('clay') }}</v-avatar>clay
            </v-chip>
            <v-chip>
              <v-avatar class="white">{{ resourceCount('wool') }}</v-avatar>wool
            </v-chip>
            <v-chip>
              <v-avatar class="white">{{ resourceCount('grain') }}</v-avatar>grain
            </v-chip>
            <v-chip>
              <v-avatar class="white">{{ resourceCount('stone') }}</v-avatar>stone
            </v-chip>
          </v-container>
          <v-container row align-center justify-start>
            <v-flex xs2>
              <v-icon color="white">crop_portrait</v-icon>
              <v-icon color="white">traffic</v-icon>
            </v-flex>
            <v-chip>
              <v-avatar class="white">{{ devCardsLength }}</v-avatar>dev-cards
            </v-chip>
            <v-chip>
              <v-avatar class="white">{{ knightCardsLength }}</v-avatar>knights
            </v-chip>
            <v-chip>
              <v-avatar class="white">{{ roadLength }}</v-avatar>roads
            </v-chip>
          </v-container>
        </v-container>
      </v-flex>
      <v-flex xs3>
        <v-container align-center row wrap="">
          <v-menu bottom offset-y>
            <v-btn dark slot="activator">Build</v-btn>
            <v-list dark>
              <v-list-item @click="setIsBuildingHouse">
                <v-list-item-title>House</v-list-item-title>
              </v-list-item>
              <v-list-item @click="setIsBuildingCity">
                <v-list-item-title>City</v-list-item-title>
              </v-list-item>
              <v-list-item @click="setIsBuildingRoad">
                <v-list-item-title dark>Road</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <Trade></Trade>
          <v-btn dark @click="setIsMovingThief">Move Thief</v-btn>
          <v-btn dark @click="devCard">Buy Dev Card</v-btn>
          <v-btn @click="endTurn">End Turn</v-btn>
        </v-container>
      </v-flex>
    </v-container>
  </v-footer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import {
  DiceRollType,
  Player as PlayerState,
} from '../../../colonists-shared/dist/Shared';
import Trade from './Trade.vue';
import {
  EndTurnAction,
  BuyCardAction,
} from '../../../colonists-shared/dist/Action';
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

  public setIsMovingThief() {
    if ((this.$store.state.game.world.currentDie as DiceRollType) === 7) {
      this.$store.commit('ui/setIsMovingThief', true);
    }
  }

  public setIsBuildingHouse() {
    this.$store.commit('ui/setIsBuilding', 'House');
  }

  public setIsBuildingCity() {
    this.$store.commit('ui/setIsBuilding', 'City');
  }

  public setIsBuildingRoad() {
    this.$store.commit('ui/setIsBuilding', 'Road');
  }

  public devCard() {
    this.$store.dispatch('game/sendAction', new BuyCardAction(this.playerName));
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
}
</script>

<style lang="scss" scoped>
#Player {
  padding: 20px;
}
</style>
