<template>
  <v-container fluid id="Players">
    <v-list two-line>
        <v-list-tile class="player-tile">
            <v-list-tile-avatar>
                <img src="/img/icons/apple-touch-icon-180x180.png" alt="avatar">
            </v-list-tile-avatar>
            <v-list-tile-content>
                <v-list-tile-title>Player1</v-list-tile-title>
                <v-list-tile-sub-title>
                    <v-chip>
                        <v-icon>shopping_cart</v-icon>
                        9
                    </v-chip>
                    <v-chip>
                        <v-icon>shopping_cart</v-icon>
                        4
                    </v-chip>
                    <v-chip>
                        <v-icon>shopping_cart</v-icon>
                        2
                    </v-chip>
                    <v-chip>
                        <v-icon>shopping_cart</v-icon>
                        3
                    </v-chip>
                </v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <v-btn icon ripple>
                    2
                    <v-icon color="grey lighten-1">star</v-icon>
                </v-btn>
            </v-list-tile-action>
        </v-list-tile>
        <v-list-tile class="player-tile">
            <v-list-tile-avatar>
                <img src="/img/icons/apple-touch-icon-180x180.png" alt="avatar">
            </v-list-tile-avatar>
            <v-list-tile-content>
                <v-list-tile-title>Player2</v-list-tile-title>
                <v-list-tile-sub-title>
                    <v-chip>
                        <v-icon>shopping_cart</v-icon>
                        9
                    </v-chip>
                    <v-chip>
                        <v-icon>shopping_cart</v-icon>
                        4
                    </v-chip>
                    <v-chip>
                        <v-icon>shopping_cart</v-icon>
                        2
                    </v-chip>
                    <v-chip>
                        <v-icon>shopping_cart</v-icon>
                        3
                    </v-chip>
                </v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
                <v-btn icon ripple>
                    1
                    <v-icon color="grey lighten-1">star</v-icon>
                </v-btn>
            </v-list-tile-action>
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
