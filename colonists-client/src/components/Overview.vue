<template>
  <v-container
    id="Overview"
    fluid
  >
    <v-tabs
      dark
      fluid
      center-active
      show-arrows
      fixed-tabs
      class="fill-height"
    >
      <v-tabs-slider />

      <v-tab
        dark
        href="#tab-1"
      >
        Players
      </v-tab>

      <v-tab
        dark
        href="#tab-2"
      >
        Chat
      </v-tab>

      <v-tab
        dark
        href="#tab-3"
      >
        Logs
      </v-tab>

      <v-tab-item
        :key="1"
        :value="'tab-1'"
      >
        <Players />
      </v-tab-item>

      <v-tab-item
        :key="2"
        :value="'tab-2'"
      >
        <Chat />
      </v-tab-item>

      <v-tab-item
        :key="3"
        :value="'tab-3'"
      >
        <Log />
      </v-tab-item>
    </v-tabs>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Chat from './Chat.vue'
import Log from './Log.vue'
import Players from './Players.vue'

@Component({
  components: {
    Players,
    Chat,
    Log,
  },
})
export default class Overview extends Vue {
  get currentDie (): number | undefined {
    const roll = this.$store.getters['game/getCurrentDie']
    return roll === 'None' ? undefined : roll
  }
}
</script>

<style scoped lang="scss">
#Overview {
  padding: 0px;
  overflow: scroll;
}
</style>
