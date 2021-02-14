<template>
  <v-container id="Chat">
    <v-list-item
      v-for="(message, index) in messages.slice().reverse()"
      :key="index"
      dense
      two-line
      avatar
    >
      <v-list-item-avatar
        rounded
        :color="playerColor(message.user)"
      />
      <v-list-item-content>
        <v-list-item-title>{{ message.user }}</v-list-item-title>
        <v-list-item-subtitle>{{ message.text }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-container>
      <v-text-field
        id="chatbox"
        v-model="message"
        clearable
        solo
        dense
        hint="Press Enter to send the message"
        height="40px"
        outlined
        label="Write a message "
        @keyup.enter="addMessage"
      />
    </v-container>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component<Chat>({
  components: {},
})
export default class Chat extends Vue {
  public message = '';
  private playerName: string;

  constructor() {
    super();

    this.playerName = this.$store.state.game.playerName;
    this.$store.dispatch('chat/bindToMessages');
  }

  get messages(): string[] {
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
