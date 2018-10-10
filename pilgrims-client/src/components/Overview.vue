<template>
    <v-container fluid fill-height id="Overview">
      <v-layout col justify-start>
         <v-tabs centered color="cyan" dark icons-and-text class="fill-width">
          <v-tabs-slider color="yellow"></v-tabs-slider>

          <v-tab href="#tab-1">
            Players
            <v-icon>phone</v-icon>
          </v-tab>

          <v-tab href="#tab-2">
            Chat
            <v-icon>favorite</v-icon>
          </v-tab>

          <v-tab href="#tab-3">
            Logs
            <v-icon>account_box</v-icon>
          </v-tab>

          <v-tab-item
            v-for="i in 3"
            :id="'tab-' + i"
            :key="i">
            <v-card flat white>
              <v-card-text>{{ text }}</v-card-text>
            </v-card>
          </v-tab-item>
        </v-tabs>
      </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Overview extends Vue {
  @Prop()
  private text: string = 'make a component here';
}
</script>

<style scoped lang="scss">
#Overview {
  padding: 0px;
}
.fill-width {
  width: 100%;
}
</style>
