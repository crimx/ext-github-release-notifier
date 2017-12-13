import Vue from 'vue'
import App from './App'

import _ from 'lodash'
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
          allReleaseData,
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
            allReleaseData: this.allReleaseData,
            scheduleInfo: this.scheduleInfo,
            repoCheckProgress: this.repoCheckProgress
          }
        })
      },
    })

    api.addRepoNamesListener(() => {
      api.getAllReleaseData()
        .then(allReleaseData => {
          vm.allReleaseData = allReleaseData
        })
    })

    api.addReleaseDataListener(newData => {
      const index = _.findIndex(vm.allReleaseData, _.matchesProperty('name', newData.name))
      if (process.env.DEBUG_MODE) {
        console.assert(index !== -1, 'New release data not in the list!')
      }
      if (index !== -1) {
        Vue.set(vm.allReleaseData, index, newData)
      }
    })

    api.addRepoUpdatedListener(message => {
      vm.repoCheckProgress = message
    })

    api.addScheduleInfoListener(message => {
      vm.scheduleInfo = message
    })
  })
