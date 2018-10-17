<template>
  <v-container fluid id="Players">
    <v-list>
        <template v-for="player in players">
            <v-list-tile class="player-tile" :key="player.name">
                <v-layout column>
                    <v-layout row align-center>
                        <v-list-tile-title>{{player.name}}</v-list-tile-title>
                        <v-spacer></v-spacer>
                        <div style="display:contents">
                            {{ playerPoints(player.name) }}
                            <v-icon color="grey lighten-1">star</v-icon>
                        </div>
                    </v-layout>
                    <v-list-tile-content>
                        <v-list-tile-sub-title>
                            <v-chip small>
                                <v-icon small>shopping_cart</v-icon>
                                {{ playerResources(player) }}
                            </v-chip>
                            <v-chip small>
                                <v-icon small>shopping_cart</v-icon>
                                {{ playerDevCards(player) }}
                            </v-chip>
                            <v-chip small>
                                <v-icon small>shopping_cart</v-icon>
                                {{ playerKnightCards(player) }}                                
                            </v-chip>
                            <v-chip small>
                                <v-icon small>shopping_cart</v-icon>
                                {{ playerRoad(player) }}
                            </v-chip>
                        </v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-layout>
            </v-list-tile>
        </template>
    </v-list>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Player as PlayerState } from '../../../pilgrims-shared/dist/Shared';
@Component({
  components: {},
})
export default class Players extends Vue {
  get players(): PlayerState[] {
    return this.$store.getters['game/getPlayers'];
  }
  playerPoints(name: string) {
    return 0; // todo
  }
  playerResources(player: PlayerState) {
    return (
      (player.resources.wood ? player.resources.wood : 0) +
      (player.resources.stone ? player.resources.stone : 0) +
      (player.resources.clay ? player.resources.clay : 0) +
      (player.resources.grain ? player.resources.grain : 0) +
      (player.resources.wool ? player.resources.wool : 0)
    );
  }
  playerDevCards(player: PlayerState) {
    return player.devCards.filter((x) => x.type !== 'Knight').length;
  }
  playerKnightCards(player: PlayerState) {
    return player.devCards.filter((x) => x.type === 'Knight').length;
  }
  playerRoad(player: PlayerState) {
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
