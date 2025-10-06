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
      max-width="850px"
    >
      <v-card>
        <v-card-title>
          Trade with
          <v-spacer />

          <v-radio-group v-model="willTradeWith" dense row>
            <v-radio
              v-for="(item, index) in canTradeWith"
              :key="index"
              :label="item"
              :value="item"
            />
          </v-radio-group>
        </v-card-title>

        <v-card-subtitle v-if="willTradeWith === 'A Harbor'">
          Harbor Type
          <v-radio-group v-model="willTradeUsingHarbor" dense row>
            <v-radio
              v-for="(item, index) in prettyHarborTypes"
              :key="index"
              :label="item"
              :value="index"
            />
          </v-radio-group>
        </v-card-subtitle>

        <v-container fluid>
          <v-card-subtitle>
            Offer
          </v-card-subtitle>

          <v-row dense>
            <template v-for="resource in ownResources">
              <v-col :key="resource[0]" sm="2" dense>
                <v-card>
                  <v-card-title class="subtitle-2">
                    {{ resource[0] }}
                    <v-spacer />
                    <v-chip dark label small>
                      <v-icon x-small left :color="colorForResourceType(resource[0])">
                        {{ iconForResourceType(resource[0]) }}
                      </v-icon>
                      {{ resource[1] }}x
                    </v-chip>
                  </v-card-title>
                  <v-container>
                    <v-text-field
                      v-model="chosen[resource[0]]"
                      dense
                      outlined
                      type="number"
                      :max="resource[1]"
                      min="0"
                    />
                  </v-container>
                </v-card>
              </v-col>
            </template>
          </v-row>
        </v-container>

        <v-container fluid>
          <v-card-subtitle>
            Receive
          </v-card-subtitle>

          <v-row dense>
            <template v-for="resource in offerResources">
              <v-col :key="resource[0]" sm="2">
                <v-card>
                  <v-card-title class="subtitle-2">
                    {{ resource[0] }}
                    <v-spacer />
                    <v-chip dark label small>
                      <v-icon x-small :color="colorForResourceType(resource[0])">
                        {{ iconForResourceType(resource[0]) }}
                      </v-icon>
                    </v-chip>
                  </v-card-title>
                  <v-container>
                    <v-text-field
                      v-model="wants[resource[0]]"
                      dense
                      outlined
                      type="number"
                      min="0"
                    />
                  </v-container>
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
import { TileType, Player, Resources } from '../../../islanders-shared/dist/Shared';
import { BankTradeAction, ProposeTradeAction } from '../../../islanders-shared/dist/Action';
import { HarborTradeAction } from '../../../islanders-shared/lib/Action';
import { HarborType } from '../../../islanders-shared/dist/Tile';

type TradePartners = 'Other Players' | 'The Bank' | 'A Harbor';

@Component({
  props: {
    disabled: { type: Boolean, required: false, default: false },
  },
})
export default class Trade extends Vue {
  public dialog = false;
  public chosen = { Wood: 0, Wool: 0, Stone: 0, Grain: 0, Clay: 0 }
  public wants = { Wood: 0, Wool: 0, Stone: 0, Grain: 0, Clay: 0 }
  public canTradeWith = ['Other Players', 'The Bank', 'A Harbor']
  public willTradeWith: TradePartners = 'Other Players';
  public harborTypes: HarborType[] = ['WoodHarbor', 'WoolHarbor', 'GrainHarbor',
    'ClayHarbor', 'StoneHarbor', 'ThreeToOneHarbor'];
  public prettyHarborTypes: string[] = ['Wood', 'Wool', 'Grain',
    'Clay', 'Stone', 'Three-to-One'];
  public willTradeUsingHarbor = -1;

  public trade(): void {
    this.dialog = false
    const player = (this.$store.getters['game/getCurrentPlayer']) as Player;
    const chosen: Resources = {
      wood: +this.chosen.Wood,
      wool: +this.chosen.Wool,
      stone: +this.chosen.Stone,
      grain: +this.chosen.Grain,
      clay: +this.chosen.Clay,
    };
    const wants: Resources = {
      wood: +this.wants.Wood,
      wool: +this.wants.Wool,
      stone: +this.wants.Stone,
      grain: +this.wants.Grain,
      clay: +this.wants.Clay,
    };
    switch (this.willTradeWith) {
      case 'Other Players':
        this.$store.dispatch('game/proposeTrade', new ProposeTradeAction(player.name, chosen, wants));
        return;
      case 'The Bank':
        this.$store.dispatch('game/sendAction', new BankTradeAction(player.name, chosen, wants));
        return;
      case 'A Harbor':
        this.$store.dispatch('game/sendAction', new HarborTradeAction(player.name,
          this.harborTypes[this.willTradeUsingHarbor], chosen, wants));
        break;
      default:
    }
  }

  get ownResources(): [string, number][] {
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

  get offerResources(): [string, number][] {
    return [
      ['Wood', 0],
      ['Clay', 0],
      ['Grain', 0],
      ['Wool', 0],
      ['Stone', 0],
    ];
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
