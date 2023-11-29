<template>
  <v-app id="inspire">
    <v-app-bar flat>
      <v-container class="mx-auto d-flex align-center justify-center">
        Filament Inventar
      </v-container>
    </v-app-bar>

    <v-main class="bg-grey-lighten-3">
      <v-container>
        <v-row>
          <v-col cols="2">
            <v-sheet rounded="lg">
              <v-list rounded="lg">
                <v-list-item
                  color="grey-lighten-4"
                  title="Filter"
                ></v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item
                  color="grey-lighten-4"
                  @click="store.setFilter(null)"
                  title="Alle"
                ></v-list-item>

                <v-list-item
                  v-for="(type) in autocomplete('type')"
                  :key="type"
                  @click="store.setFilter(type)"
                  :title="type"
                ></v-list-item>
              </v-list>
            </v-sheet>
          </v-col>

          <v-col>
            <v-sheet
              min-height="70vh"
              rounded="lg"
            >
              <default-view />
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
  import DefaultView from './DefaultView.vue';
  import { storeToRefs } from 'pinia';
  import { useAppStore } from '@/store/app';

  const store = useAppStore();

  const { autocomplete } = storeToRefs(store);
</script>
