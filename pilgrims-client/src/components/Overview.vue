<template>
    <v-container fluid id="Overview">
      <v-layout row justify-start>
         <v-tabs centered color="grey" dark fixed-tabs class="fill-width">
          <v-tabs-slider color="#d9d9d9" ></v-tabs-slider>

          <v-tab href="#tab-1">
            Players
          </v-tab>

          <v-tab href="#tab-2">
            Chat
          </v-tab>

          <v-tab href="#tab-3">
            Logs
          </v-tab>
          <v-tab-item :id="'tab-1'" :key="1">
            <div class="tab-item-fill-height">
              <Players></Players>
            </div>
          </v-tab-item>
          <v-tab-item :id="'tab-2'" :key="2">
            <div class="tab-item-fill-height">
              <Chat></Chat>
            </div>
          </v-tab-item>
          <v-tab-item :id="'tab-3'" :key="3">
            <div class="tab-item-fill-height">
              <Log></Log>
            </div>
          </v-tab-item>
        </v-tabs>
      </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Chat from './Chat.vue';
import Log from './Log.vue';
import Players from './Players.vue';

@Component({
  components: {
    Players,
    Chat,
    Log,
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
// for some reason vuetify tabs must have their child element expanded
.tab-item-fill-height {
  height: 79vh;
}
</style>
