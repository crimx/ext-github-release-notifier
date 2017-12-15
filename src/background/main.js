import browser from 'webextension-polyfill'
import semver from 'semver'

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

browser.notifications.onClicked.addListener(name => {
  if (/^[^/\s]+\/[^/\s]+$/.test(name)) {
    // is a repo
    browser.tabs.create({ url: 'https://github.com/' + name })
    browser.notifications.clear(name)
  }
})

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
          eventTime: Date.now() + 5000,
        }
      )
    })
})

addCheckReposRequestListener(() => {
  checkRepos().then(setCheckReposAlarm)
})

addRepoUpdatedMsgtListener(({newData, oldData}) => {
  if (!newData.watching || !newData.tag_name) { return }
  if (oldData.tag_name) {
    if (newData.watching === 'major') {
      if (semver.major(newData.tag_name) === semver.major(oldData.tag_name)) { return }
    } else if (newData.watching === 'minor') {
      if (semver.major(newData.tag_name) === semver.major(oldData.tag_name) &&
          semver.minor(newData.tag_name) === semver.minor(oldData.tag_name)
      ) { return }
    } else if (newData.watching === 'all') {
      if (semver.clean(newData.tag_name) === semver.clean(oldData.tag_name)) { return }
    }
  }
  isPopupPageOpen()
    .catch(() => false)
    .then(result => {
      // ignore if popup page is open
      if (result) { return }
      browser.notifications.create(
        newData.name, // id
        {
          type: 'basic', // Firefox currently only support basic
          title: 'Github Release Notifier',
          message: `${newData.name} has just updated to ${newData.tag_name}.`,
          iconUrl: browser.runtime.getURL('icon-128.png'),
          eventTime: Date.now() + 5000,
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
