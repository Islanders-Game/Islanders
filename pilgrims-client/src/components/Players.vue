<template>
  <v-container fluid id="Players">
    <v-list>
        <v-list-tile class="player-tile">
            <v-layout column>
                <v-layout row align-center>
                    <v-list-tile-title>Player</v-list-tile-title>
                    <v-spacer></v-spacer>
                    <div style="display:contents">
                        2
                        <v-icon color="grey lighten-1">star</v-icon>
                    </div>
                </v-layout>
                <v-list-tile-content>
                    <v-list-tile-sub-title>
                        <v-chip small>
                            <v-icon small>shopping_cart</v-icon>
                            9
                        </v-chip>
                        <v-chip small>
                            <v-icon small>shopping_cart</v-icon>
                            4
                        </v-chip>
                        <v-chip small>
                            <v-icon small>shopping_cart</v-icon>
                            2
                        </v-chip>
                        <v-chip small>
                            <v-icon small>shopping_cart</v-icon>
                            3
                        </v-chip>
                    </v-list-tile-sub-title>
                </v-list-tile-content>
            </v-layout>
        </v-list-tile>
        <v-list-tile class="player-tile">
            <v-layout column>
                <v-layout row align-center>
                    <v-list-tile-title>Player</v-list-tile-title>
                    <v-spacer></v-spacer>
                    <div style="display:contents">
                        2
                        <v-icon color="grey lighten-1">star</v-icon>
                    </div>
                </v-layout>
                <v-list-tile-content>
                    <v-list-tile-sub-title>
                        <v-chip small>
                            <v-icon small>shopping_cart</v-icon>
                            9
                        </v-chip>
                        <v-chip small>
                            <v-icon small>shopping_cart</v-icon>
                            4
                        </v-chip>
                        <v-chip small>
                            <v-icon small>shopping_cart</v-icon>
                            2
                        </v-chip>
                        <v-chip small>
                            <v-icon small>shopping_cart</v-icon>
                            3
                        </v-chip>
                    </v-list-tile-sub-title>
                </v-list-tile-content>
            </v-layout>
        </v-list-tile>
    </v-list>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class Players extends Vue {
  @Prop()
  private msg!: string;
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
