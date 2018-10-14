<template>
<div id="app">
    <v-app>
      <StartGame v-if="!showGame"></StartGame>
      <transition name="fade">
        <Game v-if="showGame"></Game>
      </transition>
    </v-app>
</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Game from './components/Game.vue';
import StartGame from './components/StartGame.vue';

@Component({
  components: {
    Game,
    StartGame,
  },
})
export default class App extends Vue {
  public showGame: boolean = false;

  created() {
    this.$on('gameChoosen', (gameId) => {
      this.$store.commit('game/setGameId', gameId);
      this.showGame = true;
    });
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
