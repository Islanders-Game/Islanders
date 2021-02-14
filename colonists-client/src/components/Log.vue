<template>
  <v-container id="Log">
    <v-list-item v-for="(message, index) in messages" :key="index" two-line>
      <v-list-item-content>
        <v-list-item-title>{{ message.header }}</v-list-item-title>
        <v-list-item-subtitle>{{ message.message }}</v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Log extends Vue {
  private messagesField: { header: string; message: string }[];

  constructor() {
    super();
    this.messagesField = [
      { header: 'Test heading', message: 'Test message' },
      { header: 'Test heading', message: 'Test message' },
    ];
  }

  get messages(): { header: string; message: string }[] {
    return this.messagesField;
  }
}
</script>

<style lang="scss" scoped>
</style>
