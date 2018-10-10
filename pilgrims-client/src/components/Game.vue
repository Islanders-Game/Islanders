<template>
  <v-container fluid id="Game">
    <v-layout column fill-height>
      <v-layout row>
        <v-flex xs8>
          <Map/>
        </v-flex>
        <v-flex>
          <Overview/>
        </v-flex>
      </v-layout>
      <Player/>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Overview from './Overview.vue';
import Map from './Map.vue';
import Player from './Player.vue';

@Component({
  components: {
    Overview,
    Map,
    Player,
  },
})
export default class Game extends Vue {
  @Prop()
  private msg!: string;
}
</script>

<style lang="scss" scoped>
#Game {
  padding: 0px;
}
</style>
