import Vue from 'vue'
import App from './App'

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

Promise.all([getAllRepos(), getScheduleInfo()])
  .then(([allReleaseData, scheduleInfo]) => {
    const vm = new Vue({
      el: '#app',
      data () {
        return {
          repos: allReleaseData.sort((a, b) => b.published_at - a.published_at),
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
            repos: this.repos,
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
          vm.repos = allReleaseData.sort((a, b) => b.published_at - a.published_at)
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
          vm.repos = allReleaseData.sort((a, b) => b.published_at - a.published_at)
        })
    })

    window.addEventListener('online', () => { vm.isOnline = true }, false)
    window.addEventListener('offline', () => { vm.isOnline = false }, false)
  })
