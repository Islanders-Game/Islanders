<template>
  <div class="text-xs-center">
    <v-dialog v-model="isPlayingDevelopmentCard" width="500">
      <v-layout>
        <v-flex xs12>
          <v-card>
            <v-container fluid grid-list-md>
              <v-layout row wrap>
                <v-flex v-if="cards.length === 0">You have no development cards!</v-flex>
                <v-flex xs6 v-for="(card, key) in cards" :key="key">
                  <v-card>
                    <v-container fill-height fluid pa-2>
                      <v-layout fill-height>
                        <v-flex xs12 align-end flexbox>
                          <span class="headline">{{card.type}}</span>
                        </v-flex>
                      </v-layout>
                    </v-container>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="primary" flat @click="dialog = false">Select</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-dialog>

    <v-dialog v-model="chosingResources">
      <v-layout>
        <v-flex xs12>
          <v-card>
            <v-container fluid grid-list-md>
              <v-layout row wrap>
                <v-flex xs6 v-for="(resource, key) in availableResources" :key="key">
                  <v-card @click="chooseResource(resource)">
                    <v-container fill-height fluid pa-2>
                      <v-layout fill-height>
                        <v-flex xs12 align-end flexbox>
                          <span class="headline">{{resource}}</span>
                        </v-flex>
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-flex>

                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  flat
                  v-bind:class="{ active: chosenResources.length === chosingResources }"
                  @click="confirmResourceChoice"
                >Select</v-btn>
              </v-layout>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { DevelopmentCard } from "../../../pilgrims-shared/dist/Entities/DevelopmentCard";
import {
  Player,
  Resources,
  TileType
} from "../../../pilgrims-shared/dist/Shared";
import {
  PlayCardAction,
  MoveThiefDevCardAction
} from "../../../pilgrims-shared/dist/Action";

type AvailableResource = "Wood" | "Stone" | "Clay" | "Grain" | "Wool";
@Component
export default class DevelopmentCardSelect extends Vue {
  private playerName: string;
  public chosingResources: 1 | 2 | 0 = 0;
  public availableResources: AvailableResource[] = [
    "Wood",
    "Stone",
    "Clay",
    "Grain",
    "Wool"
  ];
  public chosenResources: AvailableResource[] = [];

  constructor() {
    super();
    this.playerName = this.$store.state.game.playerName;
  }

  get isPlayingDevelopmentCard() {
    return this.$store.getters["game/getIsPlayingDevelopmentCard"];
  }

  set isPlayingDevelopmentCard(value: boolean) {
    this.$store.commit("game/setIsPlayingDevelopmentCard", value);
  }

  get player(): Player {
    return this.$store.getters["game/getPlayer"](this.playerName);
  }

  get cards() {
    return this.player.devCards;
  }

  public selectCard(card: DevelopmentCard) {
    switch (card.type) {
      case "Victory Point":
        const victory = new PlayCardAction(this.playerName, card, undefined);
        this.$store.dispatch("game/sendAction", victory);
      case "Road Building":
        const road = new PlayCardAction(this.playerName, card, undefined);
        this.$store.dispatch("game/sendAction", victory);
      case "Monopoly":
        this.chosingResources = 1;
      case "Year of Plenty":
        this.chosingResources = 2;
        this.availableResources = [
          "Wood",
          "Stone",
          "Clay",
          "Grain",
          "Wool",
          "Wood",
          "Stone",
          "Clay",
          "Grain",
          "Wool"
        ];
      case "Knight": //TODO: Implement.
        this.$store.commit("game/isPlayingKnightCard", true);
    }
  }

  public chooseResource(resource: AvailableResource) {
    if (this.chosingResources === 1 && this.chosenResources.length <= 1) {
      this.chosenResources.pop();
      this.chosenResources.push(resource);
    }
    if (this.chosingResources === 2 && this.chosenResources.length <= 2) {
      this.chosenResources.pop();
      this.chosenResources.push(resource);
    }
  }

  public confirmResourceChoice() {
    const card = this.player.devCards.find(
      c => !c.played && c.type === "Monopoly"
    )!;

    if (this.chosingResources === 1) {
      const action = new PlayCardAction(
        this.playerName,
        card,
        this.chosenResources[0].type
      );
      this.$store.dispatch("game/sendAction", action);
    } else if (this.chosingResources === 2) {
      const mapped: [TileType, TileType] = [
        this.chosenResources[0].type,
        this.chosenResources[1].type
      ];
      const action = new PlayCardAction(this.playerName, card, mapped);
      this.$store.dispatch("game/sendAction", action);
    }
  }
}
</script>