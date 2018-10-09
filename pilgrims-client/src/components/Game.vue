<template>
    <div id="Game" class="col">
      <div class="row">
        <Map/>
        <Overview/>
      </div>
      <Player/>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Overview from './Overview.vue';
import Map from './Map.vue';
import Player from './Player.vue';

@Component({
  components: {
    Overview,
    Map,
    Player,
  },
})
export default class Game extends Vue {
  @Prop()
  private msg!: string;
}
</script>

<style lang="scss" scoped>
#Game {
  min-height: 100vh;
}
.row {
  flex: 6;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-content: stretch;
  align-items: stretch;
}
.col {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-content: stretch;
  align-items: stretch;
}
</style>
