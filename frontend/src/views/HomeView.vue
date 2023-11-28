<template>
  <div>
    <v-text-field
      v-model="search"
      label="Suchen"
      prepend-inner-icon="mdi-magnify"
      single-line
      variant="outlined"
      hide-details
    ></v-text-field>

    <v-data-table
      :headers="headers"
      :items="store.filamentList"
      :search="search"
    >
      <template v-slot:item.color="{ item }">
        <v-avatar variant="elevated" :color="item.color"></v-avatar>
      </template>

      <template v-slot:item.filaments="{ item }">
        {{ item.filaments.length }} g
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { useAppStore } from '@/store/app';

  const store = useAppStore();

  const search = ref('');

  const headers = [
    { title: 'Hersteller', key: 'manufacturer' },
    { title: 'Typ', key: 'type' },
    { title: 'Name', key: 'name' },
    { title: 'Farbe', key: 'color' },
    { title: 'Rollen', key: 'filaments' },
    { title: 'Rest', key: 'remain' }
  ];

  onMounted(() => {
     if (store.isLoggedIn) {
      store.getFilaments();
    }
  });
</script>
