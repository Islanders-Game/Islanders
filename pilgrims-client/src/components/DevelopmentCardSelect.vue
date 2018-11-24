<template>
    <div class="text-xs-center">
      <v-dialog
        v-model="isPlayingDevelopmentCard"
        width="500"
      >
        <v-layout>
          <v-flex xs12>
            <v-card>
              <v-container
                fluid
                grid-list-md
              >
                <v-layout row wrap>
                  <v-flex v-if="cards.length === 0">You have no development cards!</v-flex>
                  <v-flex xs6
                    v-for="card in cards"
                    :key="card.type"
                  >
                    <v-card>
                        <v-container
                          fill-height
                          fluid
                          pa-2
                        >
                          <v-layout fill-height>
                            <v-flex xs12 align-end flexbox>
                              <span class="headline">{{card}}</span>
                            </v-flex>
                          </v-layout>
                        </v-container>

                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="primary"
                          flat
                          @click="dialog = false"
                        >
                          Select
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card>
          </v-flex>
        </v-layout>
      </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { DevelopmentCard } from '../../../pilgrims-shared/dist/Entities/DevelopmentCard';
import { Player } from '../../../pilgrims-shared/dist/Shared';

@Component
export default class DevelopmentCardSelect extends Vue {
  private playerName: string;

  constructor() {
    super();
    this.playerName = this.$store.state.game.playerName;
  }

  get isPlayingDevelopmentCard() {
    return this.$store.getters['ui/getIsPlayingDevelopmentCard'];
  }

  set isPlayingDevelopmentCard(value: boolean) {
    this.$store.commit('ui/setIsPlayingDevelopmentCard', value);
  }

  get player(): Player {
    return this.$store.getters['game/getPlayer'](this.playerName);
  }

  get cards() {
    return this.player.devCards;
    // return [
    //   new DevelopmentCard(),
    //   new DevelopmentCard(),
    //   new DevelopmentCard(),
    // ].map((c) => (c.type = 'Monopoly'));
  }
}
</script>