import keys from '../../apiKeys';
// import helpers from './helpers';

// eslint-disable-next-line no-undef
MusicKit.configure({
  developerToken: keys.appleMusic.developerToken,
  app: {
    name: 'My Cool Web App',
    build: '1978.4.1',
  },
});

const musicState = {
  storeFront: '',
  auth: {
    isAuthorized: false,
  },
  appleMusic: {
    forYou: [],
    browse: [],
  },
};

const getters = {};

const mutations = {
  setAuth(state, { auth }) {
    state.auth.isAuthorized = auth;
  },
  setStoreFront(state, { storefront }) {
    state.storeFront = storefront;
  },
};

const actions = {
  initializeState() {
    console.log('music state init');
  },
  showLoginPage() {
    return MusicKit.getInstance().authorize();
  },
};

export default {
  namespaced: true,
  state: musicState,
  getters,
  mutations,
  actions,
};