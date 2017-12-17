/**
 * Set browser action badge and title
 * @module api/badge
 */

import browser from 'webextension-polyfill'

/**
 * @param {string|number} text
 */
export function setBadgeUnread (num) {
  num = Number(num)
  if (!(num > 0)) {
    return clearBadge()
  }
  const text = String(num)
  browser.browserAction.setTitle({title: `${text} new release${num > 1 ? 's' : ''}`})
  browser.browserAction.setBadgeText({text})
  browser.browserAction.setBadgeBackgroundColor({color: '#26a65b'})
}

/**
 * @returns {Promise} A Promise that will be fulfilled with no argument.
 */
export function addOneBadgeUnread () {
  return browser.browserAction.getBadgeText({})
    .then(text => {
      let num = Number(text)
      if (!(num > 0)) { num = 0 }
      setBadgeUnread(num + 1)
    })
}

export function setBadgeOffline () {
  browser.browserAction.setTitle({title: 'You are offline.'})
  browser.browserAction.setBadgeText({text: 'off'})
  browser.browserAction.setBadgeBackgroundColor({color: '#013243'})
}

export function clearBadge () {
  browser.browserAction.setTitle({title: 'Everything is up to date.'})
  browser.browserAction.setBadgeText({text: ''})
}
