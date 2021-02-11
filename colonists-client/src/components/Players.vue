<template>
  <v-container id="Players">
    {{players}}
    <v-list>
      <template v-for="player in players">
        <v-list-item class="player-tile" :key="player.name">
          <v-list-item-content>
            <v-list-item-title>
              <v-container>
                <v-row no-gutters>
                  <v-col sm="6">{{player.name}}<span v-if="player.name === currentPlayer.name">'s turn</span></v-col>
                  <v-col sm="6" class="align-right">{{playerPoints(player)}} points</v-col>
                </v-row>
              </v-container>
            </v-list-item-title>

            <v-list-item-subtitle>
                <v-container>
                  <v-row>
                    <v-col sm="6">
                      <v-chip label outlined small>
                        {{ playerResources(player) }} resource cards
                      </v-chip>
                    </v-col>
                    <v-col sm="6" class="align-right">                    
                      <v-chip label outlined small>
                        {{ playerDevCards(player) }} dev cards
                      </v-chip>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col sm="6">                    
                      <v-chip label outlined small>
                        {{ playerKnightCards(player) }} knights
                      </v-chip>
                    </v-col>
                    <v-col sm="6" class="align-right">                    
                      <v-chip label outlined small>
                        {{ playerRoad(player) }} roads
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-container>
            </v-list-item-subtitle>

          </v-list-item-content>
        </v-list-item>
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
  get currentPlayer(): PlayerModel {
    return this.$store.getters['game/getCurrentPlayer'];
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
#Players {
  padding: 0px;
}
.player-tile {
  padding: 0px;
}

#align-right {
  text-align: right;
}
</style>
