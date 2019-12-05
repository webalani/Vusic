import helpers from '@/store/helpers';

const { getSafe, debounce } = helpers;
// eslint-disable-next-line operator-linebreak
const fakeArtwork =
  'https://is1-ssl.mzstatic.com/image/thumb/Features127/v4/75/f9/6f/75f96fa5-99ca-0854-3aae-8f76f5cb7fb5/source/100x100bb.jpeg';

const playerState = {
  // @TODO Volume is 1 max?
  volume: 1,
  // shuffle
  shuffle: 0,
  // Repeat mode , 0 = no repeat, 1 = one, 2 = all
  repeat: 0,
  // Currently playing MediaItem (Object with type MediaItem)
  playbackTimeInfo: {
    currentPlaybackTime: null,
    currentPlaybackDuration: null,
    currentPlaybackTimeRemaining: null,
  },
  // @TODO: WTF is this?
  playbackState: 0,
  // Arrays of MediaItem Objects
  currentlyPlaying: null,
  queue: [],
  // current position in queue (Array Index of queue)
  queuePosition: 0, // done commit and action
  history: [],
  drmSupport: true,
};

const getters = {
  getNowPlayingStatus(state) {
    const currentPlaying = state.currentlyPlaying;
    if (!currentPlaying) return { title: 'Not Playing', artwork: fakeArtwork };
    return {
      id: getSafe(() => currentPlaying.id),
      title: getSafe(() => currentPlaying.title),
      trackNumber: getSafe(() => currentPlaying.trackNumber),
      albumName: getSafe(() => currentPlaying.albumName),
      albumInfo: getSafe(() => currentPlaying.albumInfo),
      artistName: getSafe(() => currentPlaying.artistName),
      isLoading: getSafe(() => currentPlaying.isLoading),
      artwork: getSafe(() => MusicKit.formatArtworkURL(currentPlaying.artwork, 140, 140)),
      isPlaying: getSafe(() => currentPlaying.isPlaying),
    };
  },
};

const mutations = {
  setVolume(state, { volume }) {
    state.volume = volume;
  },
  setShuffle(state, { shuffle }) {
    state.shuffle = shuffle;
  },
  setRepeat(state, { repeat }) {
    state.repeat = repeat;
  },
  setCurrentlyPlaying(state, { currentlyPlaying }) {
    state.currentlyPlaying = currentlyPlaying;
  },
  setQueue(state, { items }) {
    state.queue = items;
  },
  setQueuePosition(state, { position }) {
    // const oldPosition = position.oldPosition;
    state.queuePosition = position.position;
  },
  setDrmStatus(state, { drmSupport }) {
    state.drmSupport = drmSupport;
  },
  setPlaybackState(state, { playbackState }) {
    state.playbackState = playbackState;
  },
  setPlaybackTime(state, { playtimeInfo }) {
    state.playbackTimeInfo = playtimeInfo;
  },
};

const actions = {
  initializeState({ commit, dispatch }) {
    const local = {
      volume: 1,
      shuffle: false,
    };
    if (localStorage) {
      local.volume = getSafe(() => JSON.parse(localStorage.getItem('volume') || '1'), 1);
      local.shuffle = getSafe(() => JSON.parse(localStorage.getItem('shuffle') || 'false'), false);
      local.repeat = getSafe(() => JSON.parse(localStorage.getItem('repeat') || '0'), 0);
    }
    dispatch('setVolume', { volume: local.volume });
    dispatch('setShuffle', local.shuffle);
    dispatch('setRepeatStatus', local.repeat);

    MusicKit.getInstance().bitrate = 256;
    commit('setDrmStatus', { state: MusicKit.getInstance().player.canSupportDRM });
    commit(
      'music/setStoreFront',
      { storefront: MusicKit.getInstance().storefrontId },
      { root: true },
    );
    commit('music/setAuth', { auth: MusicKit.getInstance().isAuthorized }, { root: true });
  },

  changePlaybackTime(_, { time }) {
    // @TODO: Debouncer , 100ms
    return MusicKit.getInstance().player.seekToTime(time);
  },

  setRepeatStatus({ commit }, repeat = 'toggle') {
    if (repeat === 'toggle') {
      // eslint-disable-next-line operator-linebreak
      MusicKit.getInstance().player.repeatMode =
        MusicKit.getInstance().player.repeatMode === 0
          ? 2
          : MusicKit.getInstance().player.repeatMode - 1;
    } else {
      MusicKit.getInstance().player.repeatMode = repeat;
    }
    commit('setRepeat', { repeat: MusicKit.getInstance().player.repeat });
    if (window.localStorage) {
      window.localStorage.setItem(
        'repeat',
        JSON.stringify(MusicKit.getInstance().player.repeatMode),
      );
    }
  },
  setVolume({ commit }, { volume }) {
    const volumeValue = parseFloat(volume);
    MusicKit.getInstance().player.volume = volumeValue;
    commit('setVolume', { volume: volumeValue });
    if (window.localStorage) {
      window.localStorage.setItem('volume', JSON.stringify(volumeValue));
    }
  },

  setShuffle({ state, commit }, shuffle = 'toggle') {
    let shuffleBool;
    if (shuffle === 'toggle') {
      MusicKit.getInstance().player.shuffle = state.shuffle === 0 ? 1 : 0;
      commit('setShuffle', { shuffle: MusicKit.getInstance().player.shuffleMode });
      shuffleBool = state.shuffle === 1;
    } else {
      MusicKit.getInstance().player.shuffle = shuffle;
      commit('setShuffle', { shuffle: MusicKit.getInstance().player.shuffleMode });
      shuffleBool = state.shuffle === 1;
    }
    if (window.localStorage) {
      window.localStorage.setItem('shuffle', JSON.stringify(shuffleBool));
    }
  },
  play() {
    return MusicKit.getInstance().player.play();
  },
};

export default {
  namespaced: true,
  state: playerState,
  mutations,
  getters,
  actions,
};