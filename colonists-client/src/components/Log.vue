<template>
  <v-container id="Log">
      <v-list-item two-line v-for="(message, index) in messages" :key="index">
        <v-list-item-content>
            <v-list-item-title>{{message.header}}</v-list-item-title>
            <v-list-item-subtitle>{{message.message}}</v-list-item-subtitle>
        </v-list-item-content>     
      </v-list-item>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
type LogMessage = {
  header: string,
  message: string
}

@Component<Log>({
  components: {},
})

export default class Log extends Vue {
  get messages(): LogMessage[] {
    return [{header: 'Test heading', message: "Test message"}, 
            {header: 'Test heading', message: "Test message"}];;
  }
}
</script>

<style lang="scss" scoped>
</style>
