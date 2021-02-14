<template>
  <v-container
    id="Player"
    fluid
    class="fill-height"
  >
    <v-row class="fill-height">
      <v-col sm="2">
        <v-card
          :dark="isCurrentTurn ? false : true"
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
              <v-list-item-subtitle>{{ playerPoints }} points</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-avatar
              rounded
              size="30"
              :color="playerColor"
            />
          </v-list-item>
        </v-card>
      </v-col>
      <v-col sm="1">
        <v-card
          dark
          outlined
          class="fill-height"
        >
          <v-list-item three-line>
            <v-list-item-content>
              <div class="overline">
                Dice
              </div>
              <v-list-item-title class="headline">
                {{ diceRoll !== 'None' ? diceRoll : '-' }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-card>
      </v-col>

      <v-col sm="4">
        <v-card
          dark
          outlined
          class="fill-height"
        >
          <v-row class="fill-height">
            <v-col sm="9">
              <v-container>
                <v-row>
                  <v-col sm="8">
                    <v-row dense>
                      <v-col sm="6">
                        <!-- TODO: Replace emojis with mdi-icons/fontawesome -->
                        <v-chip
                          fluid
                          label
                          dark
                          outlined
                        >
                          <v-icon
                            dense
                            small
                            color="green"
                          >
                            🌲
                          </v-icon> {{ resourceCount('wood') }} wood
                        </v-chip>
                      </v-col>
                      <v-col sm="6">
                        <v-chip
                          label
                          dark
                          outlined
                        >
                          <v-icon
                            dense
                            small
                            color="green"
                          >
                            🌾
                          </v-icon> {{ resourceCount('grain') }} wheat
                        </v-chip>
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col sm="6">
                        <v-chip
                          label
                          dark
                          outlined
                        >
                          <v-icon
                            dense
                            small
                            color="green"
                          >
                            🪨
                          </v-icon> {{ resourceCount('stone') }} stone
                        </v-chip>
                      </v-col>
                      <v-col sm="6">
                        <v-chip
                          fluid
                          label
                          dark
                          outlined
                        >
                          <v-icon
                            dense
                            small
                            color="green"
                          >
                            🧱
                          </v-icon> {{ resourceCount('clay') }} clay
                        </v-chip>
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col sm="6">
                        <v-chip
                          label
                          dark
                          outlined
                        >
                          <v-icon
                            dense
                            small
                            color="green"
                          >
                            🐑
                          </v-icon> {{ resourceCount('wool') }} wool
                        </v-chip>
                      </v-col>
                    </v-row>
                  </v-col>

                  <v-col sm="4">
                    <v-row dense>
                      <v-col>
                        <v-chip
                          label
                          dark
                          outlined
                        >
                          <v-icon
                            dense
                            small
                            color="green"
                          >
                            🂠
                          </v-icon> {{ devCardsLength }} cards
                        </v-chip>
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col>
                        <v-chip
                          label
                          :color="hasMostKnights ? 'green' : 'dark'"
                          outlined
                        >
                          <v-icon
                            dense
                            small
                            color="green"
                          >
                            🂬
                          </v-icon> {{ knightCardsLength }} knights
                        </v-chip>
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col>
                        <v-chip
                          label
                          :color="hasLongestRoad ? 'green' : 'dark'"
                          outlined
                        >
                          <v-icon
                            dense
                            small
                            color="green"
                          >
                            🚦
                          </v-icon> {{ roadLength }} roads
                        </v-chip>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <v-col sm="3">
        <v-card
          outlined
          dark
          class="fill-height"
        >
          <v-container>
            <v-row dense>
              <v-col sm="6">
                <v-menu
                  :close-on-content-click="true"
                  offset-x
                >
                  <template #activator="{ on, attrs }">
                    <v-btn
                      block
                      dark
                      v-bind="attrs"
                      v-on="on"
                    >
                      Build
                    </v-btn>
                  </template>

                  <v-card
                    outlined
                    dark
                  >
                    <v-list dense>
                      <v-list-item @click="setIsBuildingHouse">
                        House
                      </v-list-item>
                      <v-list-item @click="setIsBuildingRoad">
                        Road
                      </v-list-item>
                      <v-list-item @click="setIsBuildingCity">
                        City
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-menu>
              </v-col>

              <v-col sm="6">
                <Trade />
              </v-col>
            </v-row>
            <v-row dense>
              <v-col sm="6">
                <v-btn
                  block
                  dark
                  @click="devCard"
                >
                  Buy Card
                </v-btn>
              </v-col>

              <v-col sm="6">
                <v-btn
                  block
                  dark
                  @click="setIsMovingThief"
                >
                  Move Thief
                </v-btn>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col sm="6">
                <v-btn
                  block
                  dark
                  :disabled="player.devCards.length === 0"
                >
                  Play Card
                </v-btn>
              </v-col>

              <v-col sm="6" />
            </v-row>
          </v-container>
        </v-card>
      </v-col>

      <v-col sm="2">
        <v-card
          class="fill-height"
          dark
          outlined
        >
          <v-container>
            <v-row dense>
              <v-col sm="1" />
              <v-col sm="10">
                <v-btn
                  block
                  dark
                  outlined
                  @click="undo"
                >
                  Undo
                </v-btn>
              </v-col>
              <v-col sm="1" />
            </v-row>
            <v-row dense>
              <v-col sm="1" />
              <v-col sm="10">
                <v-btn
                  block
                  color="red darken-4"
                  @click="endTurn"
                >
                  End Turn
                </v-btn>
              </v-col>
              <v-col sm="1" />
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { DiceRollType, Player as PlayerState } from '../../../colonists-shared/dist/Shared';
import Trade from './Trade.vue';
import { EndTurnAction, BuyCardAction, UndoAction } from '../../../colonists-shared/dist/Action';

@Component({
  components: {
    Trade,
  },
})
export default class Player extends Vue {
  public playerName: string = undefined;

  public constructor () {
    super();
    this.playerName = this.$store.state.game.playerName;
  }

  public setIsMovingThief (): void {
    if ((this.$store.state.game.world.currentDie as DiceRollType) === 7) {
      this.$store.commit('ui/setIsMovingThief', true);
    }
  }

  public setIsBuildingHouse (): void {
    this.$store.commit('ui/setIsBuilding', 'House');
  }

  public setIsBuildingCity (): void {
    this.$store.commit('ui/setIsBuilding', 'City');
  }

  public setIsBuildingRoad (): void {
    this.$store.commit('ui/setIsBuilding', 'Road');
  }

  public devCard (): void {
    this.$store.dispatch('game/sendAction', new BuyCardAction(this.playerName));
  }

  public endTurn (): void {
    this.$store.dispatch('game/sendAction', new EndTurnAction(this.playerName));
  }

  public undo (): void {
    this.$store.dispatch('game/sendAction', new UndoAction());
  }

  private resourceCount (type: string) {
    const { player } = this;
    if (!player) {
      return 0;
    }
    const result = player.resources[type];
    return result || 0;
  }

  get player (): PlayerState {
    return this.$store.getters['game/getCurrentPlayer'];
  }

  get isCurrentTurn (): boolean {
    return this.player.name === this.playerName;
  }

  get playerColor (): PlayerState {
    const player = this.$store.getters['game/getCurrentPlayer'];
    return this.$store.getters['game/getPlayerColorAsHex'](player.name);
  }

  get devCardsLength (): number {
    const { player } = this;
    if (!player) {
      return 0;
    }
    return player.devCards.filter((x) => x.type !== 'Knight').length;
  }

  get knightCardsLength (): number {
    const { player } = this;
    if (!player) {
      return 0;
    }
    return player.devCards.filter((x) => x.type === 'Knight').length;
  }

  get roadLength (): number {
    const { player } = this;
    if (!player) {
      return 0;
    }
    return player.roads.length; // todo calculate longest path ;D
  }

  get hasLongestRoad (): boolean {
    const players: PlayerState[] = this.$store.getters['game/getPlayers'];
    if (players.length === 1 && players[0].roads.length > 4) {
      return true;
    }
    const playerRoads = players
      .filter((p: PlayerState) => p.name !== this.player.name)
      .map((p: PlayerState) => p.roads.length)
      .filter((r: number) => r > 4);
    if (playerRoads.length === 0) {
      return false;
    }
    const longestRoad = Math.max(...playerRoads);
    return longestRoad >= this.roadLength;
  }

  get hasMostKnights (): boolean {
    const players: PlayerState[] = this.$store.getters['game/getPlayers'];
    if (players.length === 1 && players[0].knights > 2) {
      return true;
    }
    const playerKnights = players
      .filter((p: PlayerState) => p.name !== this.player.name)
      .map((p: PlayerState) => p.knights)
      .filter((r: number) => r > 2);
    if (playerKnights.length === 0) {
      return false;
    }
    const mostKnights = Math.max(...playerKnights);
    return mostKnights >= this.roadLength;
  }

  get playerPoints (): number {
    return this.$store.getters['game/getCurrentPlayer'].points;
  }

  get diceRoll (): number {
    return this.$store.getters['game/getCurrentDie'];
  }
}
</script>

<style lang="scss" scoped>
</style>
