<template>
    <v-container fluid id="Overview">
      <v-tabs dark fluid center-active show-arrows fixed-tabs class="fill-height">
        <v-tabs-slider></v-tabs-slider>

        <v-tab dark href="#tab-1">
          Players
        </v-tab>

        <v-tab dark href="#tab-2">
          Chat
        </v-tab>

        <v-tab dark href="#tab-3">
          Logs
        </v-tab>

        <v-tab-item :value="'tab-1'" :key="1">
          <Players></Players>
        </v-tab-item>

        <v-tab-item :value="'tab-2'" :key="2">
          <Chat></Chat>
        </v-tab-item>

        <v-tab-item :value="'tab-3'" :key="3">
          <Log></Log>
        </v-tab-item>
      </v-tabs>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
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
  overflow: scroll;
}
</style>
