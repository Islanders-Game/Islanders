<template>
  <v-main>
    <v-container
      id="Game"
      fluid
      class="fill-height"
    >
      <v-row
        no-gutters
        class="top-ui"
      >
        <v-col
          sm="9"
          class="fill-height"
        >
          <Error />

          <v-chip id="gameInfo" x-small dark absolute label outlined>
            <span id="idLabel">ID:</span>{{ gameID }}
          </v-chip>

          <v-dialog v-model="playerHasWon" width="40%">
            <v-card>
              <v-card-title>
                {{ winner }} has won the game!
              </v-card-title>
            </v-card>
          </v-dialog>

          <Map class="fill-height" />
        </v-col>
        <v-col
          sm="3"
          class="fill-height"
        >
          <Overview class="fill-height" />
        </v-col>
      </v-row>
      <v-row
        no-gutters
        class="bottom-ui"
      >
        <CustomizeGame v-if="!started" />
        <Player v-else />
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Overview from './Overview.vue'
import Map from './Map.vue'
import Player from './Player.vue'
import CustomizeGame from './CustomizeGame.vue'
import Error from './Error.vue'

@Component({
  components: {
    Overview,
    Map,
    Player,
    CustomizeGame,
    Error,
  },
})
export default class Game extends Vue {
  get started (): boolean {
    return this.$store.getters['game/getIsGameStarted']
  }

  get gameID(): string {
    return this.$store.state.game.gameId
  }

  get playerHasWon(): boolean {
    return this.$store.state.game.winner !== undefined;
  }

  get winner(): string {
    return this.$store.state.game?.winner;
  }
}
</script>

<style lang="scss" scoped>
.top-ui {
  height: 75%;
  padding: 0;
  margin: 0;
}

.bottom-ui {
  padding: 0;
  margin-top: 0px !important;
  height: 25%;
  background: #1e1e1e
}

#Game {
  height: 100%;
  padding: 0px;
}

#gameInfo {
  position: absolute;
  bottom: 25.5%;
  left: 6px;
  opacity: 0.35;

  &:hover {
    opacity: 1;
  }
}

#idLabel {
  padding-right: 5px;
  color: lightgray;
  pointer-events: none;
}
</style>
