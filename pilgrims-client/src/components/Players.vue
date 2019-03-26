<template>
  <v-container fluid id="Players">
    <v-list>
        <template v-for="player in players">
            <v-list-tile class="player-tile" :key="player.name">
                <v-layout column align-left>
                  <v-layout row align-left>
                      <v-list-tile-title>
                        <h3>
                          <span>{{player.name}}</span>
                          <span v-if="player.name === currentPlayer.name">'s turn</span>
                        </h3>
                      </v-list-tile-title>
                      <v-spacer></v-spacer>
                      <div style="display:contents">
                          {{ playerPoints(player.name) }}
                          <v-icon color="grey lighten-1">star</v-icon>
                      </div>
                  </v-layout>
                  <v-list-tile-sub-title>
                      <v-chip small>
                        <v-avatar small class="grey">
                          <v-icon small>build</v-icon>
                        </v-avatar>
                        {{ playerResources(player) }}
                      </v-chip>
                      <v-chip small>
                        <v-avatar small class="grey">
                          <v-icon small>crop_portrait</v-icon>
                        </v-avatar>
                        {{ playerDevCards(player) }}
                      </v-chip>
                      <v-chip small>
                          <v-avatar small class="grey">
                            <v-icon small>people</v-icon>
                          </v-avatar>
                          {{ playerKnightCards(player) }}                                
                      </v-chip>
                      <v-chip small>
                        <v-avatar small class="grey">
                          <v-icon small>traffic</v-icon>
                        </v-avatar>
                        {{ playerRoad(player) }}
                      </v-chip>
                  </v-list-tile-sub-title>
                </v-layout>
            </v-list-tile>
        </template>
    </v-list>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Player as PlayerModel } from '../../../pilgrims-shared/dist/Shared';
@Component({
  components: {},
})
export default class Players extends Vue {
  get players(): PlayerModel[] {
    return this.$store.getters['game/getPlayers'];
  }
  get currentPlayer(): PlayerModel {
    return this.$store.getters['game/getCurrentPlayer'];
  }
  private playerPoints(name: string) {
    return 0; // todo
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
#Players {
  padding: 0px;
}
.player-tile {
  padding: 20px;
}
</style>
