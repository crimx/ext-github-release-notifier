import Vue from 'vue'
import App from './App'

import { client as api } from '@/api'

if (process.env.DEBUG_MODE) {
  console.log('DEBUG_MODE enabled')
}

Vue.config.productionTip = false

Promise.all([api.getAllReleaseData(), api.getScheduleInfo()])
  .then(([allReleaseData, scheduleInfo]) => {
    const vm = new Vue({
      el: '#app',
      data () {
        return {
          repos: allReleaseData.sort((a, b) => b.published_at - a.published_at),
          scheduleInfo,
          repoCheckProgress: {
            total: 0,
            success: 0,
            failed: 0
          }
        }
      },
      render (createElement) {
        return createElement(App, {
          props: {
            repos: this.repos,
            scheduleInfo: this.scheduleInfo,
            repoCheckProgress: this.repoCheckProgress
          }
        })
      },
    })

    api.addRepoNamesListener(() => {
      api.getAllReleaseData()
        .then(allReleaseData => {
          vm.repos = allReleaseData.sort((a, b) => b.published_at - a.published_at)
        })
    })

    api.addRepoCheckListener(message => {
      vm.repoCheckProgress = message
    })

    api.addScheduleInfoListener(message => {
      vm.scheduleInfo = message
    })
  })
