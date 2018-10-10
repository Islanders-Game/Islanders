<template>
    <v-container fluid fill-height id="Overview">
      <v-layout justify-start>
         <v-tabs centered color="cyan" dark icons-and-text class="fill-width">
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
            Logs
            <v-icon>account_box</v-icon>
          </v-tab>
          <v-tab-item :id="'tab-1'" :key="1">
            <v-card flat white>
              <v-card-text>Make a component here</v-card-text>
            </v-card>
          </v-tab-item>
          <v-tab-item :id="'tab-2'" :key="2">
            <Chat></Chat>
          </v-tab-item>
          <v-tab-item :id="'tab-3'" :key="3">
            <v-card flat white>
              <v-card-text>Make a component here</v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Chat from './Chat.vue';

@Component({
  components: {
    Chat,
  },
})
export default class Overview extends Vue {}
</script>

<style scoped lang="scss">
#Overview {
  padding: 0px;
}
.fill-width {
  width: 100%;
}
</style>
