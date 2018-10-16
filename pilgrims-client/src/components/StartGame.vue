<template>
<v-content id="StartGame">
    <v-container fluid fill-height>
        <v-layout align-center justify-center>
            <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
                <v-toolbar dark color="primary">
                <v-toolbar-title>Pilgrims</v-toolbar-title>
                <v-spacer></v-spacer>
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
                    <transition name="fade">
                        <div v-if="playerName !== '' && playerName.length >= 3 && playerName.length <= 25">
                            <v-btn color="primary" @click="createGame">Create Game</v-btn>
                            <v-btn color="primary" disabled v-if="gameIdEmpty">Join Game</v-btn>
                            <v-btn color="primary" v-else @click="joinGame">Join Game</v-btn>
                            <v-text-field prepend-icon="star" name="gameid" label="To join a game, enter a game Id" type="text" v-model="gameId"></v-text-field>

                            <v-alert :value="error" type="error" transition="scale-transition">
                                {{errorMessage}}
                            </v-alert>
                        </div>
                    </transition>
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                </v-card-actions>
            </v-card>
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

  public playerName: string = '';
  public gameId: string = 'testtest';
  get gameIdEmpty(): boolean {
    return !this.gameId;
  }

  public createGame() {
    if (!this.validate()) {
      return;
    }

    this.$store.dispatch('createGame', { gameId: this.gameId, playerName: this.playerName });
    // todo check for createGame fail.
    if(this.$store.getters['game/getGameId']) {
      this.$parent.$parent.$emit('gameChoosen');
    } else {
      this.error = true;
      this.errorMessage = 'An error occured while connecting to the server';
    }
  }

  public joinGame() {
    if (!this.validate()) {
      return;
    }

    this.$store.dispatch('joinGame', { gameId: this.gameId, playerName: this.playerName });
    if(this.$store.getters['game/getGameId']) {
      this.$parent.$parent.$emit('gameChoosen');
    } else {
      this.error = true;
      this.errorMessage = 'An error occured while connecting to the server';
    }
  }

  private validate(): boolean {
    if (!this.gameId) {
      this.error = true;
      this.errorMessage = 'You need to enter a gameId';
      return false;
    }
    if (!this.playerName || this.playerName.length >= 25) {
      this.error = true;
      this.errorMessage = 'You need to enter a valid player name';
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
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
  transition: opacity 0.3s;
}
</style>
