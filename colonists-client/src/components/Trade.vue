<template>
  <div id="Trade">
    <v-btn block dark @click="dialog = true">Trade</v-btn>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="headline">Would you like to propose a Trade with another Player</v-card-title>

        <v-card-text>Pick which player or bank you want to trade with.</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" @click="dialog = false">Decline</v-btn>

          <v-btn color="green darken-1" @click="dialog = false">Trade</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Trade extends Vue {
  public dialog: boolean = false;
}
</script>

<style lang="scss" scoped>
#Trade {
  padding: 0px;
  margin: 0px;
}
</style>
