<template>
  <v-container id="Chat">
    <v-layout column justify-end align-content-space-between>
        <v-list two-line class="message-list">
            <template v-for="(item, index) in messages">
                <v-list-item :key="index" avatar>
                    <v-list-item-avatar>
                        <img src="/img/icons/apple-touch-icon-180x180.png" alt="avatar">
                    </v-list-item-avatar>
                    <v-list-item-content>
                        <v-list-item-title v-html="item.user"></v-list-item-title>
                        <v-list-item-sub-title v-html="item.text"></v-list-item-sub-title>
                    </v-list-item-content>
                </v-list-item>
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
import { Component, Vue } from 'vue-property-decorator';

@Component<Chat>({
  components: {},
})
export default class Chat extends Vue {
  public message: string = '';
  private playerName: string;
  private gameId: string;

  constructor() {
    super();

    this.playerName = this.$store.state.game.playerName;
    this.gameId = this.$store.state.game.gameId;
    this.$store.dispatch('chat/bindToMessages');
  }

  get messages() {
    return this.$store.state.chat.messages;
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
#Chat {
  // padding: 0px;
}

.message-list {
  // overflow-y: auto;
}
</style>
