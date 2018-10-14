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
                    <v-btn color="primary" @click="createGame">Create Game</v-btn>
                    <v-btn color="primary" disabled v-if="gameIdEmpty">Join Game</v-btn>
                    <v-btn color="primary" v-else @click="joinGame">Join Game</v-btn>
                    <v-form>
                        <v-text-field prepend-icon="star" name="gameid" label="To join a game, enter a game Id" type="text" v-model="gameId"></v-text-field>
                    </v-form>
                    <v-alert :value="error" type="error" transition="scale-transition">
                        {{errorMessage}}
                    </v-alert>
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

@Component({
  components: {},
})
export default class StartGame extends Vue {
  public error: boolean = false;
  public errorMessage: string = 'Could not create game';

  public gameId: string = '';
  get gameIdEmpty(): boolean {
    return !this.gameId;
  }

  public createGame() {
    this.error = true;
    this.$parent.$parent.$emit('gameChoosen', this.gameId);
  }
  public joinGame() {
    this.error = false;
    this.$parent.$parent.$emit('gameChoosen', this.gameId);
  }
}
</script>

<style lang="scss" scoped>
#StartGame {
  padding: 0px;
}
</style>
