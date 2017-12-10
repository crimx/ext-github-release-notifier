/**
 * @file api for repos
 */

import browser from 'webextension-polyfill'
import _ from 'lodash'

/**
 * Release data, for generating Map
 * @see {@link https://developer.github.com/v3/repos/releases/}
 * @typedef ReleaseData
 * @property {string} name - repo name [owner]/[repo]
 * @property {string} etag
 * @property {string} last_modified, RFC 2822 string
 * @property {string} avatar_url - author avatar
 * @property {string} html_url - release page
 * @property {string} published_at - publish date, ISO 8601 string
 * @property {string} tag_name - release tag
 * @property {string} zipball_url
 * @property {string} tarball_url
 * @property {object[]} assets
 * @property {string} assets[].browser_download_url - file url
 * @property {string} assets[].name - file name
 */

/**
 * This is synced by browser.
 * @returns {Promise<string[]>} A Promise fulfilled with array of repo names ([owner]/[repo]) if succeeded.
 */
export function getRepoNames () {
  return browser.storage.sync.get('repos')
    .then(({repos}) => repos || [])
}

/**
 * This is synced by browser.
 * @fires browser.storage#onChanged
 * @param {string[]} names - array of repo names. [owner]/[repo]
 * @returns {Promise} A Promise fulfilled with no argument if succeeded.
 */
export function saveRepoNames (names) {
  if (process.env.DEBUG_MODE) {
    console.assert(_.every(names, _.isString))
  }
  return browser.storage.sync.set({repos: names})
}

/**
* @callback RepoNamesChangedCallback
* @param {string[]} names
*/

/**
 * Listen sync storage change
 * @param {RepoNamesChangedCallback} callback
 * @listens browser.storage#onChanged
 */
export function listenRepoNames (callback) {
  if (!_.isFunction(callback)) {
    throw new TypeError('arg 1 should be a function.')
  }
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync' && changes.repos) {
      callback(changes.repos.newValue)
    }
  })
}

/**
 * Get release info of a repo
 * @param {string} name - repo name
 * @returns {Promise<ReleaseData>} A Promise fulfilled with ReleaseData object if succeeded.
 */
export function getReleaseData (name) {
  return browser.storage.local.get(name)
    .then(response => {
      if (response[name]) {
        return response[name]
      }
      return fetchReleaseData({name})
        .then(_.partial(_.tap, _, saveReleaseData))
    })
}

/**
 * Save release data to local storage
 * @fires browser.storage#onChanged
 * @param {ReleaseData} releaseData
 * @returns {Promise} A Promise fulfilled with no argument if succeeded.
 */
export function saveReleaseData (releaseData) {
  return browser.storage.local.set({[releaseData.name]: releaseData})
}

/**
 * @callback ReleaseDataChangedCallback
 * @param {ReleaseData} releaseData
 */

/**
 * Listen local storage change
 * @param {ReleaseDataChangedCallback} callback
 */
export function listenReleaseData (callback) {
  if (!_.isFunction(callback)) {
    throw new TypeError('arg 1 should be a function.')
  }
  getRepoNames().then(names => {
    names = new Set(names)
    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        const name = Object.keys(changes).find(k => names.has(k))
        if (name) {
          callback(changes[name].newValue)
        }
      }
    })
  })
}

/**
 * Get release info of all repos
 * @returns {Promise<ReleaseData[]>} A Promise fulfilled with array of ReleaseData objects if succeeded.
 */
export function getAllReleaseData () {
  return getRepoNames()
    .then(names => Promise.all(names.map(getReleaseData)))
}

/**
 * Fetch release info from github
 * @todo oauth token
 * @param {ReleaseData} releaseData - only name is mandatory
 * @returns {Promise<ReleaseData>} A Promise fulfilled with ReleaseData object if succeeded.
 */
export function fetchReleaseData (releaseData) {
  const headers = new Headers({
    'Accept': 'application/vnd.github.v3+json'
  })
  if (releaseData.etag) {
    headers.append('If-None-Match', releaseData.etag)
  }
  if (releaseData.last_modified) {
    headers.append('If-Modified-Since', releaseData.last_modified)
  }

  return fetch(`https://api.github.com/repos/${releaseData.name}/releases/latest`, {headers})
    .then(response => {
      if (response.status === 304) {
        // 304 Not Modified
        return releaseData
      }
      if (!response.ok) {
        return Promise.reject(new Error(`404 with ${releaseData.name}`))
      }
      return response.json()
        .then(json => ({
          name: releaseData.name,
          etag: response.headers.get('etag') || '',
          last_modified: response.headers.get('last-modified') || '',
          avatar_url: json.author.avatar_url,
          ..._.pick(json, [
            'html_url',
            'published_at',
            'tag_name',
            'zipball_url',
            'tarball_url',
          ]),
          assets: _.map(json.assets || [], _.partial(_.pick, _, ['browser_download_url', 'name']))
        }))
    })
}

/**
 * @typedef msgRepoUpdate
 * @property {string} type - 'REPO_UPDATED'
 * @property {number} total - total repo count
 * @property {number} success - success count
 * @property {number} failed - failed count
 */

/**
 * @event browser.runtime#REPO_UPDATED
 * @type {msgRepoUpdate}
 */

/**
 * Check for repo update
 * @fires browser.storage#onChanged
 * @returns {Promise<ReleaseData>} A Promise fulfilled with no argument if succeeded.
 */
export function checkRepos () {
  return getAllReleaseData()
    .then(releases => {
      const total = releases.length
      let success = 0
      let failed = 0
      return Promise.all(
        releases.map(data => {
          return fetchReleaseData(data)
            .then(newData => {
              success += 1
              saveReleaseData(newData)
              browser.runtime.sendMessage({
                type: 'REPO_UPDATED',
                total,
                success,
                failed,
              })
            })
            .catch(() => {
              failed += 1
              browser.runtime.sendMessage({
                type: 'REPO_UPDATED',
                total,
                success,
                failed,
              })
            })
        })
      )
    })
}

/**
 * @callback RepoUpdatedCallback
 * @param {msgRepoUpdate} message
 */

/**
 * @param {RepoUpdatedCallback} callback
 * @listens browser.runtime#REPO_UPDATED
 */
export function listenRepoUpdate (callback) {
  if (!_.isFunction(callback)) {
    throw new TypeError('arg 1 should be a function.')
  }
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'REPO_UPDATED') {
      callback(message)
      sendResponse()
    }
  })
}
