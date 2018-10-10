<template>
    <v-container fill-height id="Overview">
      <v-layout col justify-start align-space-between>
        <v-tabs color="cyan" dark icons-and-text>
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab href="#tab-1">
            Players
            <v-icon>phone</v-icon>
          </v-tab>
          <v-tab href="#tab-2">
            Chat
            <v-icon>favorite</v-icon>
          </v-tab>
          <v-tab href="#tab-3">
            Log
            <v-icon>account_box</v-icon>
          </v-tab>
          <v-tab-item v-for="i in 3" :id="'tab-' + i" :key="i">
            <v-card flat >
              <v-card-text class="dark-card">{{ text }}</v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Overview extends Vue {
  @Prop()
  private text: string = 'make a component here';
}
</script>

<style scoped lang="scss">
#Overview {
  background-color: #25262a;
  padding: 0px;
}
.dark-card {
  background-color: rgba(0, 0, 0, 0.87);
  color: whitesmoke;
}
</style>
