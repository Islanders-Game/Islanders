<template>
    <v-container fluid id="Overview">
      <v-layout row justify-start>
         <v-tabs centered color="grey" dark class="fill-width">
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
          <v-tab-item :value="'tab-1'" :key="1">
            <div class="tab-item-fill-height">
              <Players></Players>
            </div>
          </v-tab-item>
          <v-tab-item :value="'tab-2'" :key="2">
            <div class="tab-item-fill-height">
              <Chat></Chat>
            </div>
          </v-tab-item>
          <v-tab-item :value="'tab-3'" :key="3">
            <div class="tab-item-fill-height">
              <Log></Log>
            </div>
          </v-tab-item>
        </v-tabs>
      </v-layout>
      <v-layout>
        <v-flex xs4 v-if="currentDie">
          <h1>Last roll:</h1>
        </v-flex>
        <v-flex xs8>
          <h1>{{currentDie}}</h1>
        </v-flex>
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
export default class Overview extends Vue {
  get currentDie() {
    const roll = this.$store.getters['game/getCurrentDie'];
    return roll === 'None' ? undefined : roll;
  }
}
</script>

<style scoped lang="scss">
#Overview {
  padding: 0px;
}
.fill-width {
  width: 100%;
}
// for some reason vuetify tabs must have their child element expanded
// TODO: Fix this.
.tab-item-fill-height {
  height: 74vh;
}
</style>
