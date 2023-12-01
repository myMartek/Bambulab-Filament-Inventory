import { defineStore } from 'pinia'
import axios from 'axios';

const host = import.meta.env.DEV ? 'http://localhost:3000' : '';

export const useAppStore = defineStore('app', {
  state: () => ({
    login: sessionStorage.getItem('token') || null,
    filaments: [],
    filter: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.login,
    autocomplete: (state) => {
      return (key) => state.filaments.map((filament) => filament[key]).filter((value, index, self) => self.indexOf(value) === index);
    },
    filamentList: (state) => {
      let filaments = state.filaments.filter(e => {
        if (!state.filter) {
          return true;
        }

        return e.type === state.filter;
      }).reduce((acc, filament) => {
        let key = filament.color + filament.type + filament.name + filament.manufacturer;

        if (!acc[key]) {
          acc[key] = {
            type: filament.type,
            manufacturer: filament.manufacturer,
            remain: filament.size / 100 * filament.remain,
            filaments: [filament],
            color: filament.color,
            name: filament.name
          }
        } else {
          acc[key].remain += filament.size / 100 * filament.remain;
          acc[key].filaments.push(filament);
        }

        return acc;
      }, {});

      return Object.keys(filaments).map(key => filaments[key]);
    }
  },
  actions: {
    setFilter(filter) {
      this.filter = filter;
    },
    async deleteFilament(tag_uid) {
      try {
        if (!this.isLoggedIn) {
          return false;
        }

        const { data } = await axios.post(host + '/delete', { tag_uid }, {
          headers: {
            Authorization: `Bearer ${this.login}`,
          },
        });

        this.filaments = data;

        return true;
      } catch (error) {
        console.log(error);
      }

      return false;
    },
    async updateFilament(filament) {
      try {
        if (!this.isLoggedIn) {
          return false;
        }

        const { data } = await axios.post(host + '/update', filament, {
          headers: {
            Authorization: `Bearer ${this.login}`,
          },
        });

        this.filaments = data;

        return true;
      } catch (error) {
        console.log(error);
      }

      return false;
    },

    async getFilaments() {
      try {
        if (!this.isLoggedIn) {
          return;
        }

        const { data } = await axios.get(host + '/filaments', {
          headers: {
            Authorization: `Bearer ${this.login}`,
          },
        });

        this.filaments = data;
      } catch (error) {
        if (error.response?.status === 401) {
          this.login = null;
          sessionStorage.removeItem('token');
        }
      }
    },
    async addFilament(filament) {
      try {
        if (!this.isLoggedIn) {
          return false;
        }

        const { data } = await axios.post(host + '/update', filament, {
          headers: {
            Authorization: `Bearer ${this.login}`,
          },
        });

        this.filaments = data;

        return true;
      } catch (error) {
        console.log(error);
      }

      return false;
    },
    async checkLogin(username, password) {
      try {
        const { data } = await axios.post(host + '/oauth/token', {
          grant_type: 'password',
          username,
          password
        });

        this.login = data.access_token;

        sessionStorage.setItem('token', data.access_token);

        this.getFilaments();

        return true;
      } catch (error) {
        console.log(error);
      }

      return false;
    },
    logout() {
      this.login = null;
      sessionStorage.removeItem('token');
    }
  }
});

setInterval(() => {
  const appStore = useAppStore();

  appStore.getFilaments();
}, 10000);
