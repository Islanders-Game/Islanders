<template>
  <v-container fluid id="Chat">
    <v-layout column fill-height justify-end align-content-space-between>
        <v-list two-line style="overflow-y: scroll">
            <template v-for="(item, index) in messages">
                <v-list-tile :key="index" avatar>
                    <v-list-tile-avatar>
                        <img src="/img/icons/apple-touch-icon-180x180.png" alt="avatar">
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title v-html="item.user"></v-list-tile-title>
                        <v-list-tile-sub-title v-html="item.text"></v-list-tile-sub-title>
                    </v-list-tile-content>
                </v-list-tile>
            </template>
        </v-list>
        <v-layout row style="padding:5px">
            <v-text-field label="Write a message" v-model="message" v-on:keyup.enter="addMessage">
            </v-text-field>
            <v-btn @click="addMessage">
                Send
            </v-btn>
        </v-layout>
    </v-layout>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapActions, mapGetters } from 'vuex';
import { ChatMessage } from '../../../pilgrims-shared/dist/Shared';
import io from 'socket.io-client';

@Component<Chat>({
  components: {},
})
export default class Chat extends Vue {
  public message: string = '';
  private socket: SocketIOClient.Socket;

  constructor() {
    super();
    this.$store.dispatch('chat/getMessages');

    const gameId = this.$store.getters['game/getGameId'];
    this.socket = io.connect(`localhost:3000/${gameId}`);
    this.socket.on('chat', (newMessage: ChatMessage) => {
      this.$store.dispatch('chat/addMessage', newMessage);
    });
  }

  get messages() {
    return this.$store.getters['chat/getMessages'];
  }

  public addMessage(): void {
    console.log(this.socket.connected);
    this.socket.emit('chat', { text: this.message, user: 'Player1' });
    this.message = '';
  }
}
</script>

<style lang="scss" scoped>
#Chat {
  padding: 0px;
}
</style>
