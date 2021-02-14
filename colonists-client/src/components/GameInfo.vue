<template>
  <v-snackbar
    id="info"
    :top="true"
    height="24" 
    :value="showGameInfo"
  >
    <v-row>
      <v-col sm="4">
        <b>Game Code:</b>
      </v-col>
      <v-col sm="2">
        <code>{{ gameID }}</code>
      </v-col>
    </v-row>
  </v-snackbar>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  props: {
    showGameInfo: Boolean,
  },
})
export default class GameInfo extends Vue {
  get gameID(): string {
    return this.$store.state.game.gameId;
  }
  get currentDie(): number {
    return this.$store.getters['game/getCurrentDie'];
  }
}
</script>
<style lang="css" scoped>
#info {
  text-align: left;
}
</style>