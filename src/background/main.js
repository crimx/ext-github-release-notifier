import browser from 'webextension-polyfill'

import { clearBadge } from '@/api/badge'

import {
  isPopupPageOpen,
  addAuthorizeRequestListener,
  addReplaceRepoRequestListener,
  addCheckReposRequestListener,
  addRepoUpdatedMsgtListener,
} from '@/api/message'

import {
  replaceRepo,
  checkRepos,
  getScheduleInfo,
  addRateLimitRemainingListener,
} from '@/api/storage'

import { authorize } from '@/api/oauth'

if (process.env.DEBUG_MODE) {
  console.log(`Debug mode enabled`)
  window.browser = browser
}

/* ------------------------------------ *\
  #notifications
\* ------------------------------------ */
browser.notifications.onClicked.addListener(name => {
  if (/^[^/\s]+\/[^/\s]+$/.test(name)) {
    // is a repo
    browser.tabs.create({ url: 'https://github.com/' + name + '/releases' })
    browser.notifications.clear(name)
    clearBadge()
  }
})

/* ------------------------------------ *\
  #runtime messages
\* ------------------------------------ */
addReplaceRepoRequestListener(message => {
  replaceRepo(message)
    .then(releaseData => {
      if (!releaseData) { return }
      browser.notifications.create(
        releaseData.name, // id
        {
          type: 'basic', // Firefox currently only support basic
          title: 'Github Release Notifier',
          message: `Start watching ${releaseData.name} for ${releaseData.watching} releases`,
          iconUrl: browser.runtime.getURL('icon-128.png'),
          eventTime: Date.now() + 5000,
        }
      )
    })
})

addCheckReposRequestListener(() => {
  checkRepos().then(setAlarm)
})

addRepoUpdatedMsgtListener(repoData => {
  isPopupPageOpen()
    .catch(() => false)
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
          eventTime: Date.now() + 5000,
        }
      )
    })
})

/* ------------------------------------ *\
  #rate limit remaining
\* ------------------------------------ */
addRateLimitRemainingListener(remaining => {
  if (remaining <= 10) {
    browser.notifications.create(
      'ratelimit' + remaining, // id
      {
        type: 'basic', // Firefox currently only support basic
        title: 'Github Release Notifier',
        message: `You are about to exceed rate limit (${remaining} remains). Please sign in.`,
        iconUrl: browser.runtime.getURL('icon-128.png'),
        eventTime: Date.now() + 5000,
        requireInteraction: true,
      }
    )
  }
})

/* ------------------------------------ *\
  #perform oauth authorization
\* ------------------------------------ */
addAuthorizeRequestListener(() => {
  return authorize()
    .catch(err => {
      if (process.env.DEBUG_MODE) {
        console.warn(err)
      }
      browser.notifications.create(
        'authorize', // id
        {
          type: 'basic', // Firefox currently only support basic
          title: 'Github Release Notifier',
          message: `Unable to sign in.`,
          iconUrl: browser.runtime.getURL('icon-128.png'),
          eventTime: Date.now() + 5000,
        }
      )
    })
})

/* ------------------------------------ *\
  #alarms
\* ------------------------------------ */
browser.alarms.onAlarm.addListener(() => {
  if (process.env.DEBUG_MODE) {
    console.log('Alarm triggered')
  }
  checkRepos().then(setAlarm).catch(setAlarm)
})

chrome.runtime.onInstalled.addListener(setAlarm)
browser.runtime.onStartup.addListener(setAlarm)

function setAlarm () {
  return browser.alarms.clearAll()
    .then(getScheduleInfo)
    .then(({lastCheck, period}) => {
      if (lastCheck + period * 60 <= Date.now()) {
        // check now
        return checkRepos().then(setAlarm).catch(setAlarm)
      }
      if (process.env.DEBUG_MODE) {
        console.log(`set alarm: in ${period} miniutes`)
      }
      return browser.alarms.create({delayInMinutes: period})
    })
}
