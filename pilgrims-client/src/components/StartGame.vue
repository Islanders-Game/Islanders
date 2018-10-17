<template>
<v-content id="StartGame">
    <v-container fluid fill-height>
        <v-layout align-center justify-center>
            <v-flex xs12 sm8 md4>
            <v-card class="elevation-12" style="height:30vh">
                <v-toolbar dark color="primary">
                  <v-toolbar-title>Pilgrims</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn-toggle class="transparent" v-model="toggle_exclusive">
                      <v-btn :value="2" flat @click="isCreatingGame = true">Create</v-btn>
                      <v-btn flat @click="isCreatingGame = false">Join</v-btn>
                    </v-btn-toggle>
                </v-toolbar>
                <v-card-text>
                    <v-text-field autofocus
                      ref="playerName"
                      prepend-icon="person" 
                      name="playerName" 
                      label="Enter a playername" 
                      type="text" 
                      v-model="playerName" 
                      :rules="rules"
                      counter="25">
                      </v-text-field>
                      <div>
                    <transition name="fade">
                      <div v-if="!isCreatingGame" class="fade-element">
                        <v-text-field prepend-icon="star" name="gameid" label="To join a game, enter a game Id" type="text" v-model="gameId"></v-text-field>
                        <v-btn color="primary" disabled v-if="!validatePlayerName || !validateGameId">Join Game</v-btn>
                        <v-btn color="primary" v-else @click="joinGame">Join Game</v-btn>
                      </div>
                    </transition>
                    <transition name="fade">
                      <div v-if="isCreatingGame" class="fade-element">
                        <v-btn color="primary" disabled v-if="!validatePlayerName">Create Game</v-btn>
                        <v-btn color="primary" v-else @click="createGame">Create Game</v-btn>
                      </div>
                    </transition>
                    </div>
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
            <v-alert :value="error" type="error" transition="scale-transition">
                {{errorMessage}}
            </v-alert>
            </v-flex>
        </v-layout>
    </v-container>
</v-content>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import io from 'socket.io-client';

@Component({
  components: {},
})
export default class StartGame extends Vue {
  public error: boolean = false;
  public errorMessage: string = 'Could not create game';
  public rules = [(v) => v.length <= 25 || 'Max 25 characters'];
  public isCreatingGame = true;
  public playerName: string = '';
  public gameId: string = '';
  public toggle_exclusive = 2;

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
    if (this.$store.getters['game/getGameId']) {
      this.$parent.$parent.$emit('gameChoosen');
    } else {
      this.error = true;
      this.errorMessage = 'An error occured while connecting to the server';
    }
  }

  public async joinGame() {
    if (!this.validateGameId) {
      this.error = true;
      this.errorMessage = 'You need to enter a gameId';
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
      return;
    }

    if (this.$store.getters['game/getGameId']) {
      this.$parent.$parent.$emit('gameChoosen');
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
#StartGame {
  padding: 0px;
}

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
