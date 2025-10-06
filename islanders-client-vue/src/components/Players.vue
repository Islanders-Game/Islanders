<template>
  <v-container id="Players">
    <v-list>
      <template v-for="player in players">
        <v-container :key="player.name">
          <v-card>
            <v-list-item three-line>
              <v-list-item-content>
                <div class="overline">
                  {{ player.name }}<span v-if="isCurrentPlayersTurn(player)">'s turn</span>
                </div>
                <v-list-item-title> {{ playerPoints(player) }} points </v-list-item-title>
                <v-list-item-subtitle>
                  <v-container>
                    <v-row dense>
                      <v-col>
                        <v-chip
                          label
                          outlined
                          small
                        >
                          <v-icon
                            dense
                            small
                            left
                            dark
                          >
                            mdi-cards
                          </v-icon>
                          {{ playerResources(player) }} resources
                        </v-chip>
                      </v-col>
                      <v-col>
                        <v-chip
                          label
                          outlined
                          small
                        >
                          <v-icon
                            dense
                            small
                            left
                            dark
                          >
                            mdi-cards-playing-outline
                          </v-icon>
                          {{ playerDevCards(player) }} dev. cards
                        </v-chip>
                      </v-col>
                    </v-row>
                    <v-row dense>
                      <v-col>
                        <v-chip
                          label
                          outlined
                          small
                        >
                          <v-icon
                            dense
                            small
                            left
                            dark
                          >
                            mdi-chess-knight
                          </v-icon>
                          {{ playerKnightCards(player) }} knights
                        </v-chip>
                      </v-col>
                      <v-col>
                        <v-chip
                          label
                          outlined
                          small
                        >
                          <v-icon
                            dense
                            small
                            left
                            dark
                          >
                            mdi-road
                          </v-icon>
                          {{ playerRoad(player) }} roads
                        </v-chip>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-avatar
                rounded
                :color="colorForAvatar(player)"
              />
            </v-list-item>
          </v-card>
        </v-container>
      </template>
    </v-list>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Player } from '../../../islanders-shared/dist/Shared';

@Component
export default class Players extends Vue {
  get players(): Player[] {
    return this.$store.getters['game/getPlayers'];
  }

  private colorForAvatar(player: Player): void {
    return this.$store.getters['game/getPlayerColorAsHex'](player.name);
  }

  private isCurrentPlayersTurn(player: Player): boolean {
    const currentPlayer = this.$store.getters['game/getCurrentPlayer'];
    const isStarted = this.$store.getters['game/getIsGameStarted'];
    return isStarted && player.name === currentPlayer.name;
  }

  private playerPoints(player: Player): number {
    return player.points;
  }

  private playerResources(player: Player): number {
    return (
      (player.resources.wood ? player.resources.wood : 0) +
      (player.resources.stone ? player.resources.stone : 0) +
      (player.resources.clay ? player.resources.clay : 0) +
      (player.resources.grain ? player.resources.grain : 0) +
      (player.resources.wool ? player.resources.wool : 0)
    );
  }

  private playerDevCards(player: Player): number {
    return player.devCards.filter((x) => x.type !== 'Knight').length;
  }

  private playerKnightCards(player: Player): number {
    return player.devCards.filter((x) => x.type === 'Knight').length;
  }

  private playerRoad(player: Player): number {
    return player.roads.length; // todo longest path :P
  }
}
</script>

<style lang="scss" scoped>
#align-right {
  text-align: right;
}
</style>
