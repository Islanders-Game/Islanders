<template>
  <v-main id="StartGame">
    <v-container>
      <v-card fluid>
        <v-toolbar dark color="primary">
          <v-toolbar-title>Colonists</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn-toggle class="transparent" v-model="toggle">
            <v-btn :value="2" text @click="isCreatingGame = true">Create</v-btn>
            <v-btn text @click="isCreatingGame = false">Join</v-btn>
          </v-btn-toggle>
        </v-toolbar>

        <v-card-text>
          <v-text-field
            autofocus
            ref="playerName"
            outlined
            name="playerName"
            dense
            label="Enter your player name"
            type="text"
            v-model="playerName"
            :rules="rules"
            counter="14"
          ></v-text-field>
          <v-text-field v-show="!isCreatingGame"
              name="gameid"
              label="To join a game, enter a Game Code"
              type="text"
              outlined
              dense
              v-model="gameId"
              counter="24"
            ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn
              v-if="!isCreatingGame"
              color="primary"
              :disabled="!validatePlayerName"
              @click="joinGame"
              v-on:keyup.enter="joinGame"
          >Join Game</v-btn>
          <v-btn v-else color="primary" @click="createGame" :disabled="!validatePlayerName">Create Game</v-btn>
        </v-card-actions>
      </v-card>
    </v-container>
    <v-alert :value="error" type="error" transition="scale-transition">{{errorMessage}}</v-alert>
  </v-main>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class StartGame extends Vue {
  public error: boolean = false;
  public errorMessage: string = 'Could not create game';
  public rules = [(v: string) => v.length <= 25 || 'Max 25 characters'];
  public isCreatingGame = true;
  public playerName: string = '';
  public gameId: string = '';
  public toggle = 2;

  public async createGame() {
    if (!this.validatePlayerName) {
      this.error = true;
      this.errorMessage = 'You need to enter a valid player name';
      return;
    }

    try {
      await this.$store.dispatch('createGame', this.playerName);
    } catch (ex) {
      this.error = true;
      this.errorMessage = ex.message;
      return;
    }

    // todo check for createGame fail.
    if (this.$store.state.game.gameId) {
      this.$parent.$parent.$emit('gameChosen');
    } else {
      this.error = true;
      this.errorMessage = 'An error occured while connecting to the server';
    }
  }

  public async joinGame() {
    if (!this.validateGameId) {
      this.error = true;
      this.errorMessage = 'You need to enter a Game Code';
      return;
    } else if (!this.validatePlayerName) {
      this.error = true;
      this.errorMessage = 'You need to enter a valid player name';
      return;
    }

    try {
      await this.$store.dispatch('joinGame', {
        gameId: this.gameId,
        playerName: this.playerName,
      });
    } catch (ex) {
      this.error = true;
      this.errorMessage = ex.message;
      console.warn(ex);
      return;
    }

    if (this.$store.state.game.gameId) {
      this.$parent.$parent.$emit('gameChosen');
    } else {
      this.error = true;
      this.errorMessage = 'An error occured while connecting to the server';
    }
  }

  get validateGameId(): boolean {
    if (!this.gameId) {
      return false;
    }
    return true;
  }

  get validatePlayerName(): boolean {
    if (!this.playerName || this.playerName.length >= 25) {
      return false;
    }
    return true;
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0.1s;
}
.fade-element {
  position: absolute;
  width: 93%;
}
</style>
