import browser from 'webextension-polyfill'

import {
  isPopupPageOpen,
  addReplaceRepoRequestListener,
  addCheckReposRequestListener,
  addRepoUpdatedMsgtListener,
} from '@/api/message'

import {
  replaceRepo,
  checkRepos,
  getScheduleInfo,
} from '@/api/storage'

if (process.env.DEBUG_MODE) {
  console.log(`Debug mode enabled`)
  window.browser = browser
}

addReplaceRepoRequestListener(message => {
  replaceRepo(message)
    .then(releaseData => {
      if (!releaseData) { return }
      browser.notifications.create(
        releaseData.name, // id
        {
          type: 'basic', // Firefox currently only support basic
          title: 'Github Release Notifier',
          message: `Start watching ${releaseData.name} for releases`,
          iconUrl: browser.runtime.getURL('icon-128.png'),
        }
      )
    })
})

addCheckReposRequestListener(() => {
  checkRepos().then(setCheckReposAlarm)
})

addRepoUpdatedMsgtListener(repoData => {
  isPopupPageOpen()
    .then(result => {
      // ignore if popup page is open
      if (result) { return }
      browser.notifications.create(
        repoData.name, // id
        {
          type: 'basic', // Firefox currently only support basic
          title: 'Github Release Notifier',
          message: `${repoData.name} has just updated to ${repoData.tag_name}.`,
          iconUrl: browser.runtime.getURL('icon-128.png'),
        }
      )
    })
})

browser.alarms.onAlarm.addListener(() => {
  if (process.env.DEBUG_MODE) {
    console.log('Alarm triggered')
  }
  checkRepos().then(setCheckReposAlarm)
})

setCheckReposAlarm()

function setCheckReposAlarm () {
  return browser.alarms.clearAll()
    .then(getScheduleInfo)
    .then(({lastCheck, period}) => {
      if (lastCheck + period * 60 <= Date.now()) {
        // check now
        return checkRepos().then(setCheckReposAlarm)
      }
      if (process.env.DEBUG_MODE) {
        console.log(`set alarm: in ${period} miniutes`)
      }
      return browser.alarms.create({delayInMinutes: period})
    })
}
