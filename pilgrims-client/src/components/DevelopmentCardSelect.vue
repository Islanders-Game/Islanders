<template>
    <div class="text-xs-center">
      <v-dialog
        v-model="dialog"
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
                              <span class="headline" v-text="card.type"></span>
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