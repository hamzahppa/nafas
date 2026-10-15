import { checkpointFromLive } from './utils/store'

App({
  globalData: {},
  onCreate() {},
  onDestroy() {
    checkpointFromLive()
  },
})
