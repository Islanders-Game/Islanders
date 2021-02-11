<template>
  <v-container id="Players">
    <v-list>
      <template v-for="player in players">
        <v-container :key="player.name">
        <v-card>
          <v-list-item three-line>
            <v-list-item-content>
              <div class="overline">{{player.name}}<span v-if="isCurrentPlayersTurn(player)">'s turn</span></div>
              <v-list-item-title>
                    {{playerPoints(player)}} points
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-container>
                  <v-row dense>
                    <v-col>
                      <v-chip label outlined small>
                        {{ playerResources(player) }} resource cards
                      </v-chip>
                    </v-col>
                    <v-col>
                      <v-chip label outlined small>
                        {{ playerDevCards(player) }} dev cards
                      </v-chip>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col>
                    <v-chip label outlined small>
                      {{ playerKnightCards(player) }} knights
                    </v-chip>
                  </v-col>
                  <v-col>
                    <v-chip label outlined small>
                      {{ playerRoad(player) }} roads
                    </v-chip>
                  </v-col>
                  </v-row>
                </v-container>
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-avatar rounded :color="colorForAvatar(player)"></v-list-item-avatar>
          </v-list-item>
        </v-card>
        </v-container>
      </template>
    </v-list>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Player as PlayerModel } from '../../../colonists-shared/dist/Shared';
@Component({
  components: {},
})
export default class Players extends Vue {
  get players(): PlayerModel[] {
    return this.$store.getters['game/getPlayers'];
  }
  public colorForAvatar(player: PlayerModel) {
    return this.$store.getters['game/getPlayerColorAsHex'](player.name);
  }
  public isCurrentPlayersTurn(player: PlayerModel) {
    const currentPlayer = this.$store.getters['game/getCurrentPlayer'];
    const isStarted = this.$store.getters['game/getIsGameStarted'];
    return isStarted && player.name === currentPlayer.name;
  }
  private playerPoints(player: PlayerModel) {
    return player.points;
  }
  private playerResources(player: PlayerModel) {
    return (
      (player.resources.wood ? player.resources.wood : 0) +
      (player.resources.stone ? player.resources.stone : 0) +
      (player.resources.clay ? player.resources.clay : 0) +
      (player.resources.grain ? player.resources.grain : 0) +
      (player.resources.wool ? player.resources.wool : 0)
    );
  }
  private playerDevCards(player: PlayerModel) {
    return player.devCards.filter((x) => x.type !== 'Knight').length;
  }
  private playerKnightCards(player: PlayerModel) {
    return player.devCards.filter((x) => x.type === 'Knight').length;
  }
  private playerRoad(player: PlayerModel) {
    return player.roads.length; // todo longest path :P
  }
}
</script>

<style lang="scss" scoped>

#align-right {
  text-align: right;
}
</style>
