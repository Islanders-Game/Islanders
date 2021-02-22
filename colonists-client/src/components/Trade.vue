<template>
  <div id="Trade">
    <v-btn
      :disabled="disabled"
      block
      dark
      @click="dialog = true"
    >
      Trade
    </v-btn>

    <v-dialog
      v-model="dialog"
      max-width="750px"
    >
      <v-card>
        <v-card-title>
          Trade
        </v-card-title>

        <v-container>
          <v-row>
            <template v-for="(resource, index) in resources">
              <v-col :key="index" sm="3">
                <v-card>
                  <v-card-title class="subtitle-2">
                    {{ resource[0] }}
                    <v-spacer />
                    <v-chip dark color="grey darken-3" label small>
                      <v-icon small left :color="colorForResourceType(resource[0])">
                        {{ iconForResourceType(resource[0]) }}
                      </v-icon>
                      {{ resource[1] }}x
                    </v-chip>
                  </v-card-title>
                  <v-text-field
                    v-model="chosen[resource[0]]"
                    small-chips
                    dense
                    label="Choose Wood amount"
                    outlined
                    multiple
                    type="number"
                    :max="resource[1]"
                  />
                </v-card>
              </v-col>
            </template>
          </v-row>
        </v-container>

        <v-card-actions>
          <v-btn
            @click="trade"
          >
            Select
          </v-btn>

          <v-btn
            color="red"
            @click="dialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { TileType, Player, Resources } from '../../../colonists-shared/dist/Shared';
import { ProposeTradeAction } from '../../../colonists-shared/dist/Action';

@Component({
  props: {
    disabled: { type: Boolean, required: false, default: false },
  },
})
export default class Trade extends Vue {
  public dialog = false;
  public chosen = { Wood: 0, Wool: 0, Stone: 0, Grain: 0, Clay: 0 }

  public trade(): void {
    // TODO: Implement emit to other players
    this.dialog = false
    const player = (this.$store.getters['game/getCurrentPlayer']) as Player;
    const chosen: Resources = {
      wood: +this.chosen.Wood,
      wool: +this.chosen.Wool,
      stone: +this.chosen.Stone,
      grain: +this.chosen.Grain,
      clay: +this.chosen.Clay,
    };
    this.$store.dispatch('game/proposeTrade', new ProposeTradeAction(player.name, chosen));
  }

  get resources(): [string, number][] {
    const player = (this.$store.getters['game/getCurrentPlayer']) as Player;
    if (!player) return [];
    return [
      ['Wood', player.resources.wood],
      ['Clay', player.resources.clay],
      ['Grain', player.resources.grain],
      ['Wool', player.resources.wool],
      ['Stone', player.resources.stone],
    ].filter((r) => r[1] !== 0) as [string, number][];
  }

  public iconForResourceType(type: TileType): string {
    switch (type) {
      case 'Wood': return 'mdi-pine-tree'
      case 'Grain': return 'mdi-grain'
      case 'Clay': return 'mdi-toy-brick'
      case 'Wool': return 'mdi-sheep'
      case 'Stone': return 'mdi-checkbox-blank-circle'
      default: return ''
    }
  }

  public colorForResourceType(type: TileType): string {
    switch (type) {
      case 'Wood': return 'green'
      case 'Grain': return 'yellow'
      case 'Clay': return 'red'
      case 'Wool': return 'grey lighten-3'
      case 'Stone': return 'blue-grey darken-1'
      default: return ''
    }
  }
}
</script>

<style lang="scss" scoped>
#Trade {
  padding: 0px;
  margin: 0px;
}
</style>
