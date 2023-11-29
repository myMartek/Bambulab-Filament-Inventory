<template>
  <v-container>
    <v-row>
      <v-col cols="8">
        <v-text-field
          v-model="search"
          label="Suchen"
          prepend-inner-icon="mdi-magnify"
          single-line
          variant="outlined"
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="4" class="d-flex text-right align-center justify-end">
        <v-dialog width="500" v-model="openAddDialog">
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              v-bind="props"
            >
              <v-icon left>mdi-plus</v-icon>
              Hinzufügen
            </v-btn>
          </template>

          <template v-slot:default>
            <v-card title="Filament hinzufügen">
              <v-form v-model="valid" @submit.prevent ref="addForm">
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col
                        cols="12"
                      >
                        <v-combobox
                          v-model="addModel.manufacturer"
                          :rules="requiredRules"
                          :items="autocomplete('manufacturer')"
                          label="Hersteller"
                          required
                        ></v-combobox>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col
                        cols="12"
                      >
                        <v-combobox
                          v-model="addModel.type"
                          :rules="requiredRules"
                          :items="autocomplete('type')"
                          label="Typ"
                          required
                        ></v-combobox>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col
                        cols="12"
                      >
                        <v-text-field
                          v-model="addModel.name"
                          :rules="requiredRules"
                          label="Name"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col
                        cols="12"
                      >
                        <v-combobox
                          v-model="addModel.size"
                          :items="[1000, 500, 250]"
                          :rules="requiredRules"
                          label="Größe"
                          required
                        ></v-combobox>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col
                        cols="12"
                      >
                        <v-text-field
                          v-model="addModel.remain"
                          :rules="requiredRules"
                          type="number"
                          :min="0"
                          :max="100"
                          label="Restmenge"
                          required
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col
                        cols="12"
                      >
                        <v-color-picker
                          v-model="addModel.color"
                          label="Farbe"
                          required
                          show-swatches
                          hide-details
                          mode="hexa"
                          :modes="['hexa']"
                        ></v-color-picker>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>

                  <v-btn
                    text="Abbrechen"
                    color="red darken-2"
                    @click="openAddDialog = false"
                  ></v-btn>

                  <v-btn
                    text="Speichern"
                    color="green darken-2"
                    type="submit"
                    :disabled="!valid"
                    @click="addFilament"
                  ></v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </template>
        </v-dialog>
      </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="store.filamentList"
      :search="search"
      :items-per-page="-1"
    >
      <template v-slot:item.color="{ item }">
        <v-avatar variant="elevated" :color="item.color"></v-avatar>
      </template>

      <template v-slot:item.filaments="{ item }">
        {{ item.filaments.length }}
      </template>

      <template v-slot:item.remain="{ item }">
        {{ item.remain }} g
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn
          size="x-small"
          @click="editFilament(item)"
          icon
          flat
        >
          <v-icon color="orange darken-2" size="small">mdi-pencil</v-icon>
        </v-btn>

        <v-btn
          size="x-small"
          @click="additionalFilament(item)"
          icon
          flat
        >
          <v-icon color="primary" size="small">mdi-plus</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { useAppStore } from '@/store/app';
  import { storeToRefs } from 'pinia';
  import { toast } from 'vue3-toastify';
  import 'vue3-toastify/dist/index.css';

  const requiredRules = [
    v => !!v || 'Eingabe erforderlich'
  ];

  const store = useAppStore();

  const { autocomplete } = storeToRefs(store);

  const search = ref('');
  const valid = ref(false);
  const openAddDialog = ref(false);
  const addForm = ref(null)
  const addModel = ref({
    manufacturer: '',
    type: '',
    name: '',
    color: '#ffffffff',
    size: 1000,
    remain: 100,
    empty: false
  });

  const headers = [
    { title: 'Hersteller', key: 'manufacturer' },
    { title: 'Typ', key: 'type' },
    { title: 'Name', key: 'name' },
    { title: 'Farbe', key: 'color' },
    { title: 'Rollen', key: 'filaments' },
    { title: 'Rest', key: 'remain' },
    { title: 'Aktionen', key: 'actions', sortable: false }
  ];

  onMounted(() => {
     if (store.isLoggedIn) {
      store.getFilaments();
    }
  });

  const addFilament = async () => {
    let success = store.addFilament(addModel.value);

    if (success) {
      addForm.value.reset();
      openAddDialog.value = false;
      toast.success('Filament erfolgreich hinzugefügt');
    } else {
      toast.error('Fehler beim Hinzufügen des Filaments');
    }
  };

  const additionalFilament = async (item) => {
    let success = store.addFilament({
      manufacturer: item.manufacturer,
      type: item.type,
      name: item.name,
      color: item.color,
      size: 1000,
      remain: 100,
      empty: false
    });

    if (success) {
      toast.success('Filament erfolgreich hinzugefügt');
    } else {
      toast.error('Fehler beim Hinzufügen des Filaments');
    }
  };
</script>
