import Vue from 'vue'
import App from './App'
import Octicon from 'vue-octicon/components/Octicon.vue'
import 'vue-octicon/icons'

import { clearBadge } from '@/api/badge'

import {
  addCheckReposProgressListener,
  addCheckReposCompleteListener,
  listenPopUpPageOpenQuery,
} from '@/api/message'

import {
  getAllRepos,
  getScheduleInfo,
  addScheduleInfoListener,
  addRepoNamesListener,
} from '@/api/storage'

if (process.env.DEBUG_MODE) {
  console.log('DEBUG_MODE enabled')
}

Vue.config.productionTip = false
Vue.component('octicon', Octicon)

clearBadge()

Promise.all([getAllRepos(), getScheduleInfo()])
  .then(([allReleaseData, scheduleInfo]) => {
    const vm = new Vue({
      el: '#app',
      data () {
        return {
          rawRepos: allReleaseData,
          scheduleInfo,
          repoCheckProgress: {
            success: 0,
            failed: 0
          },
          isOnline: navigator.onLine
        }
      },
      render (createElement) {
        return createElement(App, {
          props: {
            rawRepos: this.rawRepos,
            scheduleInfo: this.scheduleInfo,
            repoCheckProgress: this.repoCheckProgress,
            isOnline: this.isOnline
          }
        })
      },
    })

    listenPopUpPageOpenQuery()

    addRepoNamesListener(() => {
      getAllRepos()
        .then(allReleaseData => {
          console.log(allReleaseData)
          vm.rawRepos = allReleaseData
        })
    })

    addCheckReposProgressListener(message => {
      vm.repoCheckProgress = message
    })

    addScheduleInfoListener(message => {
      vm.scheduleInfo = message
    })

    addCheckReposCompleteListener(() => {
      // return promise to close port
      return getAllRepos()
        .then(allReleaseData => {
          vm.rawRepos = allReleaseData
        })
    })

    window.addEventListener('online', () => { vm.isOnline = true }, false)
    window.addEventListener('offline', () => { vm.isOnline = false }, false)
  })
