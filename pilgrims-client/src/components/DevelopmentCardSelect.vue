<template>
    <v-dialog
      v-model="dialog"
      width="800"
    >
      <v-card>
        <v-card-title
          class="headline"
          primary-title
        >
        Development Card
        </v-card-title>

        <v-card-text>
          This is a development card. 
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            flat
            @click="dialog = false"
          >
            Select card
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>