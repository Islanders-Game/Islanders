<template>
  <v-container id="Chat">
    <v-list-item dense two-line v-for="(message, index) in messages.slice().reverse()" :key="index" avatar>
      <v-list-item-avatar rounded :color="playerColor(message.user)"></v-list-item-avatar>
      <v-list-item-content>
          <v-list-item-title v-html="message.user"></v-list-item-title>
          <v-list-item-subtitle v-html="message.text"></v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-container>
          <v-text-field clearable solo dense hint="Press Enter to send the message" height="40px" id="chatbox" outlined label="Write a message " v-model="message" v-on:keyup.enter="addMessage">
          </v-text-field>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component<Chat>({
  components: {},
})
export default class Chat extends Vue {
  public message: string = '';
  private playerName: string;

  constructor() {
    super();

    this.playerName = this.$store.state.game.playerName;
    this.$store.dispatch('chat/bindToMessages');
  }

  get messages() {
    return this.$store.state.chat.messages;
  }

  public playerColor(playerName: string): string {
    return this.$store.getters['game/getPlayerColorAsHex'](playerName);
  }

  public addMessage(): void {
    this.$store.dispatch('chat/addMessage', {
      text: this.message,
      user: this.playerName,
    });
    this.message = '';
  }
}
</script>

<style lang="scss" scoped>

</style>
