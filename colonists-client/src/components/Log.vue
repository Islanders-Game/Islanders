<template>
  <v-container id="Log">
    <v-list three-line>
        <v-list-item>
            <v-list-item-content>
                <v-list-item-title></v-list-item-title>
                <v-list-item-sub-title></v-list-item-sub-title>
            </v-list-item-content>
             <v-list-item-action>
                  <v-list-item-action-text></v-list-item-action-text>
             </v-list-item-action>
        </v-list-item>
        <v-list-item>
            <v-list-item-content>
                <v-list-item-title></v-list-item-title>
                <v-list-item-sub-title></v-list-item-sub-title>
            </v-list-item-content>
             <v-list-item-action>
                  <v-list-item-action-text></v-list-item-action-text>
             </v-list-item-action>
        </v-list-item>
    </v-list>
  </v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})
export default class Log extends Vue {
  @Prop()
  private msg!: string;
}
</script>

<style lang="scss" scoped>
#Log {
  // padding: 0px;
}
</style>
