<template>
  <v-container fluid id="Chat">
    <v-layout column fill-height justify-end>    
        <v-list two-line>
            <v-list-tile>
                <v-list-tile-avatar>
                    <img src="/img/icons/apple-touch-icon-180x180.png" alt="avatar">
                </v-list-tile-avatar>
                <v-list-tile-content>
                    <v-list-tile-title>Player1</v-list-tile-title>
                    <v-list-tile-sub-title>Hej her er en besked tilbage</v-list-tile-sub-title>
                </v-list-tile-content>
            </v-list-tile>
            <v-list-tile>
                <v-list-tile-avatar>
                    <img src="/img/icons/apple-touch-icon-180x180.png" alt="avatar">
                </v-list-tile-avatar>
                <v-list-tile-content>
                    <v-list-tile-title>Player2</v-list-tile-title>
                    <v-list-tile-sub-title>Hej her er en besked yo</v-list-tile-sub-title>
                </v-list-tile-content>
            </v-list-tile>
        </v-list>
        <v-layout row style="padding:5px">
            <v-text-field>
                
            </v-text-field>
            <v-btn>
                Send
            </v-btn>
        </v-layout>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class Chat extends Vue {
  @Prop()
  private msg!: string;
}
</script>

<style lang="scss" scoped>
#Chat {
  padding: 0px;
}
</style>
