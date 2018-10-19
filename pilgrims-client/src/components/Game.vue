<template>
  <v-container fluid id="Game">
    <v-layout column fill-height>
      <v-layout row class="main-area">
        <v-flex xs9>
          <Map/>
        </v-flex>
        <v-flex xs3>
          <Overview/>
        </v-flex>
      </v-layout>
      <CustomizeGame v-if="!started"/>
      <Player v-if="started"/>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Overview from './Overview.vue';
import Map from './Map.vue';
import Player from './Player.vue';
import CustomizeGame from './CustomizeGame.vue';

@Component({
  components: {
    Overview,
    Map,
    Player,
    CustomizeGame,
  },
})
export default class Game extends Vue {
  get started() {
    return this.$store.getters['game/getIsGameStarted'];
  }
}
</script>

<style lang="scss" scoped>
#Game {
  padding: 0px;
}
</style>
