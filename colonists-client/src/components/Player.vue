<template>
  <v-container
    id="Player"
    fluid
    class="fill-height"
  >
    <v-dialog v-if="proposedTrade" v-model="notDismissedTrade" persistent max-width="650px">
      <v-card>
        <v-card-title>
          {{ proposedTrade.player }} proposed a trade
        </v-card-title>

        <v-container>
          <v-row>
            <v-col sm="5">
              <h3 class="overline">They offer</h3>
            </v-col>
            <v-col sm="2">
              <v-icon small>mdi-arrow-left-bold</v-icon>
              <v-icon small>mdi-arrow-right-bold</v-icon>
            </v-col>
            <v-col sm="5">
              <h3 class="overline">They want</h3>
            </v-col>
          </v-row>
          <v-row>
            <v-col sm="5">
              <v-chip v-if="proposedTrade.resources.wood" dark color="grey darken-3" label small>
                <v-icon small left :color="colorForResourceType('Wood')">
                  {{ iconForResourceType('Wood') }}
                </v-icon> {{ proposedTrade.resources.wood }}x
              </v-chip>
              <v-chip v-if="proposedTrade.resources.wool" dark color="grey darken-3" label small>
                <v-icon small left :color="colorForResourceType('Wool')">
                  {{ iconForResourceType('Wool') }}
                </v-icon> {{ proposedTrade.resources.wool }}x
              </v-chip>
              <v-chip v-if="proposedTrade.resources.stone" dark color="grey darken-3" label small>
                <v-icon small left :color="colorForResourceType('Stone')">
                  {{ iconForResourceType('Stone') }}
                </v-icon> {{ proposedTrade.resources.stone }}x
              </v-chip>
              <v-chip v-if="proposedTrade.resources.grain" dark color="grey darken-3" label small>
                <v-icon small left :color="colorForResourceType('Grain')">
                  {{ iconForResourceType('Grain') }}
                </v-icon> {{ proposedTrade.resources.grain }}x
              </v-chip>
              <v-chip v-if="proposedTrade.resources.clay" dark color="grey darken-3" label small>
                <v-icon small left :color="colorForResourceType('Clay')">
                  {{ iconForResourceType('Clay') }}
                </v-icon> {{ proposedTrade.resources.clay }}x
              </v-chip>
            </v-col>
            <v-col sm="2" />
            <v-col sm="5">
              <v-chip v-if="proposedTrade.wants.wood" dark color="grey darken-3" label small>
                <v-icon small left :color="colorForResourceType('Wood')">
                  {{ iconForResourceType('Wood') }}
                </v-icon> {{ proposedTrade.wants.wood }}x
              </v-chip>
              <v-chip v-if="proposedTrade.wants.wool" dark color="grey darken-3" label small>
                <v-icon small left :color="colorForResourceType('Wool')">
                  {{ iconForResourceType('Wool') }}
                </v-icon> {{ proposedTrade.wants.wool }}x
              </v-chip>
              <v-chip v-if="proposedTrade.wants.stone" dark color="grey darken-3" label small>
                <v-icon small left :color="colorForResourceType('Stone')">
                  {{ iconForResourceType('Stone') }}
                </v-icon> {{ proposedTrade.wants.stone }}x
              </v-chip>
              <v-chip v-if="proposedTrade.wants.grain" dark color="grey darken-3" label small>
                <v-icon small left :color="colorForResourceType('Grain')">
                  {{ iconForResourceType('Grain') }}
                </v-icon> {{ proposedTrade.wants.grain }}x
              </v-chip>
              <v-chip v-if="proposedTrade.wants.clay" dark color="grey darken-3" label small>
                <v-icon small left :color="colorForResourceType('Clay')">
                  {{ iconForResourceType('Clay') }}
                </v-icon> {{ proposedTrade.wants.clay }}x
              </v-chip>
            </v-col>
          </v-row>
        </v-container>

        <v-card-actions>
          <v-btn @click="acceptTrade">Accept</v-btn>
          <v-btn color="red lighten-1" @click="notDismissedTrade = false">Reject</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isStealingFromPlayers" persistent max-width="750px">
      <v-card>
        <v-card-title>
          Who do you want to steal from?
        </v-card-title>

        <v-container>
          <v-row>
            <template v-for="(p, playerIndex) in players">
              <v-col :key="playerIndex" sm="3">
                <v-card
                  class="player-card"
                  @click="selectPlayer(playerIndex)"
                >
                  <v-card-title class="subtitle-2">
                    {{ p.name }}
                    <v-spacer />
                  </v-card-title>
                  <v-container fluid>
                    <v-row
                      v-for="(resources, resourceIndex) in resourceCountForPlayer(p.name)"
                      :key="resourceIndex"
                      dense
                      no-gutters
                    >
                      <v-chip dark color="grey darken-3" label small>
                        <v-icon small left :color="colorForResourceType(resources[0])">
                          {{ iconForResourceType(resources[0]) }}
                        </v-icon> {{ resources[1] }}x
                      </v-chip>
                    </v-row>
                  </v-container>
                </v-card>
              </v-col>
            </template>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-btn
            :disabled="currentlySelectedPlayer === 'None'"
            @click="stealFromPlayer"
          >
            Select Player
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDevelopmentCardPicker" persistent max-width="650px">
      <v-card>
        <v-card-title>Play a development card</v-card-title>
        <v-container>
          <v-row>
            <v-col sm="6">
              <v-card
                :disabled="devCardsOfType('Monopoly', true) === 0"
                class="development-card"
                @click="selectedCard('Monopoly')"
              >
                <v-card-title class="subtitle-2">
                  Monopoly
                  <v-spacer />
                  <v-chip right outlined label small>{{ devCardsOfType('Monopoly', true) }}x</v-chip>
                </v-card-title>
                <v-card-text>Take all of a chosen resource from all players.</v-card-text>
                <v-combobox
                  v-show="currentlySelectedCard === 'Monopoly'"
                  v-model="chosenResources"
                  :items="resourceTypes"
                  hint="Maximum of 1 resource type"
                  label="Choose a resource type"
                  dense
                  small-chips
                  outlined
                  multiple
                  type="number"
                />
              </v-card>
            </v-col>
            <v-col sm="6">
              <v-card
                :disabled="devCardsOfType('Year of Plenty', true) === 0"
                class="development-card"
                @click="selectedCard('Year of Plenty')"
              >
                <v-card-title class="subtitle-2">
                  Year of Plenty
                  <v-spacer />
                  <v-chip right outlined label small>{{ devCardsOfType('Year of Plenty', true) }}x</v-chip>
                </v-card-title>
                <v-card-text>Take any 2 resources from the bank.</v-card-text>
                <v-combobox
                  v-show="currentlySelectedCard === 'Year of Plenty'"
                  v-model="chosenResources"
                  :items="resourceTypes"
                  small-chips
                  dense
                  label="Choose resource types"
                  hint="Maximum of 2 resource types"
                  outlined
                  multiple
                  type="number"
                />
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col sm="4">
              <v-card
                :disabled="devCardsOfType('Road Building', true) === 0"
                class="development-card"
                @click="selectedCard('Road Building')"
              >
                <v-card-title class="subtitle-2">
                  Road Building
                  <v-spacer />
                  <v-chip right outlined label small>{{ devCardsOfType('Road Building', true) }}x</v-chip>
                </v-card-title>
                <v-card-text>Place 2 new roads as if you just built them.</v-card-text>
              </v-card>
            </v-col>
            <v-col sm="4">
              <v-card
                :disabled="devCardsOfType('Victory Point', true) === 0"
                class="development-card"
                @click="selectedCard('Victory Point')"
              >
                <v-card-title class="subtitle-2">
                  Victory Point
                  <v-spacer />
                  <v-chip right outlined label small>{{ devCardsOfType('Victory Point', true) }}x</v-chip>
                </v-card-title>
                <v-card-text>Gain a Victory Point.</v-card-text>
              </v-card>
            </v-col>
            <v-col sm="4">
              <v-card
                :disabled="devCardsOfType('Knight', true) === 0"
                class="development-card"
                @click="selectedCard('Knight')"
              >
                <v-card-title class="subtitle-2">
                  Knight
                  <v-spacer />
                  <v-chip right outlined label small>{{ devCardsOfType('Knight', true) }}x</v-chip>
                </v-card-title>
                <v-card-text>Move the thief and take 2 cards from another player.</v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions>
          <v-btn
            :disabled="!canSelectCard"
            @click="selectDevelopmentCard"
          >
            Select Card
          </v-btn>
          <v-btn right color="red" @click="showDevelopmentCardPicker = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row class="fill-height">
      <v-col sm="2">
        <v-card
          :dark="!isCurrentTurn"
          outlined
          class="fill-height"
        >
          <v-list-item three-line>
            <v-list-item-content>
              <div class="overline">
                You<span v-if="isCurrentTurn">r turn</span>
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
            <v-col>
              <v-container fluid>
                <v-row fluid>
                  <v-col sm="8">
                    <v-row dense>
                      <v-col sm="6">
                        <v-chip
                          fluid
                          label
                          dark
                          outlined
                        >
                          <v-icon
                            small
                            :color="colorForResourceType('Wood')"
                            left
                          >
                            {{ iconForResourceType('Wood') }}
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
                            small
                            :color="colorForResourceType('Grain')"
                            left
                          >
                            {{ iconForResourceType('Grain') }}
                          </v-icon> {{ resourceCount('grain') }} grain
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
                            left
                            :color="colorForResourceType('Stone')"
                          >
                            {{ iconForResourceType('Stone') }}
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
                            left
                            :color="colorForResourceType('Clay')"
                          >
                            {{ iconForResourceType('Clay') }}
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
                            left
                            :color="colorForResourceType('Wool')"
                          >
                            {{ iconForResourceType('Wool') }}
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
                            left
                            color="grey lighten-2"
                          >
                            mdi-cards-playing-outline
                          </v-icon> {{ devCardsLength }} dev. cards
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
                            left
                            color="grey lighten-2"
                          >
                            mdi-chess-knight
                          </v-icon> {{ devCardsOfType('Knight') }} knights
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
                            left
                            color="grey lighten-2"
                          >
                            mdi-road
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
                      <v-list-item :disabled="!canPurchase('House')" @click="setIsBuildingHouse">
                        <v-icon left>mdi-home</v-icon> House
                      </v-list-item>
                      <v-list-item :disabled="!canPurchase('Road')" @click="setIsBuildingRoad">
                        <v-icon left>mdi-road</v-icon> Road
                      </v-list-item>
                      <v-list-item :disabled="!canPurchase('City')" @click="setIsBuildingCity">
                        <v-icon left>mdi-city</v-icon> City
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-menu>
              </v-col>

              <v-col sm="6">
                <Trade :disabled="resources === 0" />
              </v-col>
            </v-row>
            <v-row dense>
              <v-col sm="6">
                <v-btn
                  block
                  dark
                  :disabled="!canPurchase('DevelopmentCard')"
                  @click="devCard"
                >
                  Buy Dev. Card
                </v-btn>
              </v-col>

              <v-col sm="6">
                <v-btn
                  :disabled="!canPlayThief"
                  block
                  dark
                  :class="canPlayThief && !didMoveThief ? 'glowing' : ''"
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
                  @click="showDevelopmentCardPicker = true"
                >
                  Play Dev. Card
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
                  color="grey lighten-1"
                  @click="undo"
                >
                  <v-icon left>mdi-undo</v-icon> Undo
                </v-btn>
              </v-col>
              <v-col sm="1" />
            </v-row>
            <v-row dense>
              <v-col sm="1" />
              <v-col sm="10">
                <v-btn
                  block
                  light
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
import { Component, Vue, Watch } from 'vue-property-decorator';
import { City, House, Player as PlayerState,
  Resources, resourcesAreNonNegative, Road,
  subtractResources, TileType, World } from '../../../colonists-shared/dist/Shared';
import Trade from './Trade.vue';
import { EndTurnAction, BuyCardAction, UndoAction,
  PlayCardAction, StealFromPlayerAction, PlayerTradeAction } from '../../../colonists-shared/dist/Action';
import { DevelopmentCard, DevelopmentCardType } from '../../../colonists-shared/dist/Entities/DevelopmentCard';

@Component({
  components: {
    Trade,
  },
})
export default class Player extends Vue {
  public playerName: string = undefined;
  public showDevelopmentCardPicker = false;
  public chosenResources: [TileType] | [TileType, TileType] = ['Wood'];
  private currentlySelectedCard: DevelopmentCardType = 'None';
  private currentlySelectedPlayer = 'None';
  private notDismissedTrade = false;

  public constructor () {
    super();
    this.playerName = this.$store.state.game.playerName;
  }

  public setIsMovingThief (): void {
    if ((this.$store.state.game.world as World).conditions?.rolledASeven) {
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

  get players (): PlayerState[] {
    const { player } = this;
    return this.$store.getters['game/getPlayers'].filter((p) => p.name !== this.playerName);
  }

  get canPlayThief(): boolean {
    return (this.$store.getters['game/getWorld'] as World).conditions?.rolledASeven !== undefined;
  }

  get didMoveThief(): boolean {
    return (this.$store.getters['game/getWorld'] as World).conditions?.rolledASeven?.movedThief;
  }

  get isCurrentTurn (): boolean {
    return this.player.name === this.playerName;
  }

  get playerColor (): PlayerState {
    return this.$store.getters['game/getPlayerColorAsHex'](this.playerName);
  }

  get devCardsLength (): number {
    const { player } = this;
    if (!player) {
      return 0;
    }
    return player.devCards.length;
  }

  get isStealingFromPlayers(): boolean {
    return this.$store.state.ui.isStealingFromPlayers;
  }

  get isMovingThief(): boolean {
    return this.$store.state.ui.isMovingThief;
  }

  public resourceCountForPlayer (name: string): [TileType, number][] {
    const player = (this.$store.getters['game/getWorld'] as World).players.find((p) => p.name === name);
    if (!player) return [];
    return [
      ['Wood', player.resources.wood],
      ['Clay', player.resources.clay],
      ['Grain', player.resources.grain],
      ['Wool', player.resources.wool],
      ['Stone', player.resources.stone],
    ];
  }

  get resources (): number {
    const { player } = this;
    if (!player) return 0;
    return player.resources.wood
      + player.resources.wool
      + player.resources.stone
      + player.resources.clay
      + player.resources.grain;
  }

  public devCardsOfType (type: DevelopmentCardType, shouldFilterPlayed?: boolean): number {
    const player: PlayerState = this.$store.getters['game/getCurrentPlayer'];
    if (!player || !player.devCards) {
      return 0;
    }
    if (shouldFilterPlayed) {
      return player.devCards.filter((x) => x.type === type && !x.played).length;
    }
    return player.devCards.filter((x) => x.type === type).length;
  }

  get roadLength (): number {
    const { player } = this;
    if (!player) {
      return 0;
    }
    return player.roads.length; // todo calculate longest path ;D
  }

  get hasLongestRoad (): boolean {
    // This needs to be implemented based on the roadLength function above
    // but for all players
    const players: PlayerState[] = this.$store.getters['game/getPlayers'];
    if (players.length === 1 && players[0].roads.length > 4) {
      return true;
    }
    const playerRoads = players
      .filter((p: PlayerState) => p.name !== this.playerName)
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
      .filter((p: PlayerState) => p.name !== this.playerName)
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

  get canSelectCard(): boolean {
    const chosen = this.currentlySelectedCard
    if (chosen === 'Monopoly') return this.chosenResources && this.chosenResources.length === 1
    if (chosen === 'Year of Plenty') return this.chosenResources && this.chosenResources.length >= 1
    return this.currentlySelectedCard !== 'None'
  }

  get resourceTypes(): TileType[] {
    return ['Wood', 'Stone', 'Clay', 'Grain', 'Wool']
  }

  public iconForResourceType(type: TileType): string {
    switch (type) {
      case 'Wood': return 'mdi-pine-tree'
      case 'Grain': return 'mdi-grain'
      case 'Clay': return 'mdi-toy-brick'
      case 'Wool': return 'mdi-sheep'
      case 'Stone': return 'mdi-checkbox-blank-circle'
      default: return ''
    }
  }

  public colorForResourceType(type: TileType): string {
    switch (type) {
      case 'Wood': return 'green'
      case 'Grain': return 'yellow'
      case 'Clay': return 'red'
      case 'Wool': return 'grey lighten-3'
      case 'Stone': return 'blue-grey darken-1'
      default: return ''
    }
  }

  public selectedCard(type: DevelopmentCardType): void {
    this.currentlySelectedCard = type;
  }

  public canPurchase(item: 'House'|'City'|'Road'|'DevelopmentCard'): boolean {
    const canAfford = (cost: Resources): boolean => {
      const currentResources = this.player.resources;
      const subtracted = subtractResources(currentResources, cost);
      return resourcesAreNonNegative(subtracted);
    }

    const isInPregame = this.$store.getters['game/getWorld'].gameState === 'Pregame';
    switch (item) {
      case 'House': return isInPregame ? true : canAfford(new House().cost);
      case 'Road': return isInPregame ? true : canAfford(new Road().cost);
      case 'DevelopmentCard': return canAfford(new DevelopmentCard().cost);
      case 'City': return canAfford(new City().cost);
      default: return false;
    }
  }

  public selectPlayer(index: number): void {
    const { players } = this.$store.getters['game/getWorld'] as World;
    this.currentlySelectedPlayer = players[index].name;
  }

  public selectDevelopmentCard(): void {
    const card = this.player.devCards.filter((c) => c.type === this.currentlySelectedCard)[0];
    if (!card) return
    if (card.type === 'Year of Plenty') {
      if (this.chosenResources.length === 2) {
        const chosen = this.chosenResources as [TileType, TileType]
        this.$store.dispatch('game/sendAction',
          new PlayCardAction(this.playerName, card, chosen));
      } else if (this.chosenResources.length === 1) {
        const asTwoResources: [TileType, TileType] = [this.chosenResources[0], this.chosenResources[0]]
        this.$store.dispatch('game/sendAction',
          new PlayCardAction(this.playerName, card, asTwoResources));
      }
    } else if (card.type === 'Monopoly') {
      this.$store.dispatch('game/sendAction',
        new PlayCardAction(this.playerName, card, this.chosenResources as [TileType, TileType]));
    } else {
      this.$store.dispatch('game/sendAction',
        new PlayCardAction(this.playerName, card));
    }
    this.showDevelopmentCardPicker = false
    this.currentlySelectedCard = 'None'
  }

  public stealFromPlayer(): void {
    this.$store.commit('ui/setIsStealingFromPlayers', false);
    this.$store.dispatch('game/sendAction', new StealFromPlayerAction(this.playerName, this.currentlySelectedPlayer));
    this.currentlySelectedPlayer = 'None';
  }

  @Watch('chosenResources')
  public onChosenResoucesChanged(value: TileType[]): void {
    if (this.currentlySelectedCard === 'Year of Plenty' && value.length > 2) {
      this.$nextTick(() => (this.chosenResources as [TileType, TileType]).shift())
    } else if (this.currentlySelectedCard === 'Monopoly' && value.length > 1) {
      this.$nextTick(() => { this.chosenResources.shift() })
    }
  }

  @Watch('currentlySelectedCard')
  public onCurrentlySelectedCardChanged(value: DevelopmentCardType): void {
    if (value === 'Monopoly' && this.chosenResources.length > 2) {
      this.$nextTick(() => (this.chosenResources as [TileType, TileType]).shift())
    } else if (value && this.chosenResources.length > 1) {
      this.$nextTick(() => { this.chosenResources.pop() })
    }
  }

  get proposedTrade(): { player: string, resources: Resources, wants: Resources } {
    this.notDismissedTrade = true;
    return this.$store.state.ui.playerProposesTrade;
  }

  public acceptTrade(): void {
    this.notDismissedTrade = false;
    const trade = this.$store.state.ui.playerProposesTrade;
    this.$store.dispatch('game/sendAction',
      new PlayerTradeAction(trade.player, this.playerName, trade.resources, trade.wants));
  }
}
</script>

<style lang="scss" scoped>
.development-card {
  height: 100%;
  min-height: 180px;
}

.glowing {
  box-shadow: white 0px 0px 0px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
0% {
  box-shadow: white 0 0 2px;
}

40% {
  box-shadow: white 0 0 8px;
}

100% {
  box-shadow: white 0 0 2px;
}
}
</style>
