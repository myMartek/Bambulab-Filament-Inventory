<template>
  <v-dialog width="1200" v-model="show">
    <v-card :title="t('$vuetify.filamentDetails.title')">
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">
                {{ t('$vuetify.filamentDetails.number') }}
              </th>
              <th class="text-left">
                {{ t('$vuetify.filamentDetails.name') }}
              </th>
              <th class="text-left">
                {{ t('$vuetify.filamentDetails.size') }}
              </th>
              <th class="text-left">
                {{ t('$vuetify.filamentDetails.remain') }}
              </th>
              <th class="text-left">
                {{ t('$vuetify.filamentDetails.aktions') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, i) in filamentList"
              :key="item.tag_uid"
            >
              <td width="10">#{{ i + 1 }}</td>
              <td>
                <v-text-field
                  v-model="item.name"
                  :label="t('$vuetify.filamentDetails.name')"
                  hide-details
                  required
                  @update:modelValue="debouncedUpdate(item)"
                ></v-text-field>
              </td>
              <td width="150">
                <v-combobox
                  v-model="item.size"
                  :items="[1000, 500, 250]"
                  :label="t('$vuetify.filamentDetails.size')"
                  hide-details
                  required
                  @update:modelValue="update(item)"
                ></v-combobox>
              </td>
              <td width="350">
                <v-slider
                  v-model="item.remain"
                  type="number"
                  :min="0"
                  :max="100"
                  :disabled="item.tracking"
                  :step="1"
                  :label="t('$vuetify.filamentDetails.remaining')"
                  required
                  thumb-label="always"
                  @update:modelValue="debouncedUpdate(item)"
                >
                  <template v-slot:thumb-label>
                    <span style="white-space: nowrap;">{{ item.remain }} %</span>
                  </template>
                </v-slider>
              </td>
              <td width="150">
                <v-btn size="x-small" flat icon @click="remove(item)">
                  <v-icon color="red">mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          :text="t('$vuetify.close')"
          @click="show = false"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import _ from 'lodash';
import { useAppStore } from '@/store/app';
import { toast } from 'vue3-toastify';
import { useLocale } from 'vuetify';

const { t } = useLocale();
const store = useAppStore();

const filamentList = ref([]);
const show = ref(false);
const open = (list) => {
  filamentList.value = _.cloneDeep(list);
  show.value = true;
};

const remove = (item) => {
  const result = store.deleteFilament(item.tag_uid);

  if (result) {
    const index = filamentList.value.indexOf(item);
    if (index > -1) {
      filamentList.value.splice(index, 1);
    }

    if (filamentList.value.length === 0) {
      show.value = false;
    }

    toast.success(t('$vuetify.filamentDetails.successDelete'));
  } else {
    toast.error(t('$vuetify.filamentDetails.errorDelete'));
  }
};

const update = async (filament) => {
  const result = await store.updateFilament(filament);

  if (result) {
    toast.success(t('$vuetify.filamentDetails.success'));
  } else {
    toast.error(t('$vuetify.filamentDetails.error'));
  }
};

var debouncedUpdate = _.debounce(update, 1000);

defineExpose({ open });
</script>
