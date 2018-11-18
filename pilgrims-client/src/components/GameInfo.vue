<template>
    <v-snackbar
      v-model="showGameInfo" 
      id="snackbar"
      :timeout="6000"
      :top="'top'">
        <small>Join this game at <b>{{gameID}}</b></small>
    </v-snackbar>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component({
  props: {
    showGameInfo: Boolean,
  },
})
export default class GameInfo extends Vue {
  get gameID() {
    return this.$store.state.game.gameId;
  }
  get currentDie() {
    return this.$store.getters['game/getCurrentDie'];
  }
}
</script>
<style lang="css" scoped>
#snackbar {
  pointer-events: none;
  text-align: left;
}
</style>