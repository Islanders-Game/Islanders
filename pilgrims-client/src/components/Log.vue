<template>
  <v-container fluid id="Log">
    <v-list three-line>
        <v-list-tile>
            <v-list-tile-content>
                <v-list-tile-title>Info</v-list-tile-title>
                <v-list-tile-sub-title>Move successful</v-list-tile-sub-title>
            </v-list-tile-content>
             <v-list-tile-action>
                  <v-list-tile-action-text>13 min</v-list-tile-action-text>
             </v-list-tile-action>
        </v-list-tile>
        <v-list-tile>
            <v-list-tile-content>
                <v-list-tile-title>Error</v-list-tile-title>
                <v-list-tile-sub-title>Player could not place house on tile [1,4]</v-list-tile-sub-title>
            </v-list-tile-content>
             <v-list-tile-action>
                  <v-list-tile-action-text>15 min</v-list-tile-action-text>
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
export default class Log extends Vue {
  @Prop()
  private msg!: string;
}
</script>

<style lang="scss" scoped>
#Log {
  padding: 0px;
}
</style>
