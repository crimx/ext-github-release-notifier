import browser from 'webextension-polyfill'

/**
 * create new tab
 * @param {string} url
 * @return a Promise
 */
export default function openURL (url) {
  return browser.tabs.create({url})
}
