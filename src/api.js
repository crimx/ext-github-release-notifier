/**
 * api for repos
 * @module API
 */

import browser from 'webextension-polyfill'
import _ from 'lodash'

/**
 * Release data, for generating Map
 * @see {@link https://developer.github.com/v3/repos/releases/}
 * @typedef {object} ReleaseData
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
 * For popup page
 * @type {object}
 * @property {module:API~getRepoNames} getRepoNames
 * @property {module:API~getReleaseData} getReleaseData
 * @property {module:API~getAllReleaseData} getAllReleaseData
 * @property {module:API~getScheduleInfo} getScheduleInfo
 * @property {module:API~requestCheckRepos} requestCheckRepos
 * @property {module:API~addRepoNamesListener} addRepoNamesListener
 * @property {module:API~addReleaseDataListener} addReleaseDataListener
 * @property {module:API~addRepoUpdatedListener} addRepoUpdatedListener
 * @property {module:API~addScheduleInfoListener} addScheduleInfoListener
 */
export const client = {
  getRepoNames,
  getReleaseData,
  getAllReleaseData,
  getScheduleInfo,
  requestCheckRepos,
  addRepoNamesListener,
  addReleaseDataListener,
  addRepoUpdatedListener,
  addScheduleInfoListener,
}

/**
 * For background page
 * @type {object}
 * @property {module:API~getRepoNames} getRepoNames
 * @property {module:API~getReleaseData} getReleaseData
 * @property {module:API~getScheduleInfo} getScheduleInfo
 * @property {module:API~saveRepoNames} saveRepoNames
 * @property {module:API~saveScheduleInfo} saveScheduleInfo
 * @property {module:API~checkRepos} checkRepos
 * @property {module:API~addCheckReposRequestListener} addCheckReposRequestListener
 */
export const server = {
  getRepoNames,
  getReleaseData,
  getScheduleInfo,
  saveRepoNames,
  saveScheduleInfo,
  checkRepos,
  addCheckReposRequestListener,
}

/**
 * @callback RepoNamesChangedCallback
 * @param {string[]} names
 */

/**
 * Listens sync storage change
 * @param {module:API~RepoNamesChangedCallback} callback
 * @listens browser.storage.onChanged
 */
function addRepoNamesListener (callback) {
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
 * This is synced by browser.
 * @fires browser.storage.onChanged
 * @param {string[]} names - array of repo names. [owner]/[repo]
 * @returns {Promise} A Promise fulfilled with no argument if succeeded.
 */
function saveRepoNames (names) {
  if (process.env.DEBUG_MODE) {
    console.assert(_.every(names, _.isString))
  }
  return browser.storage.sync.set({repos: names})
}

/**
 * This is synced by browser.
 * @returns {Promise<string[]>} A Promise fulfilled with array of repo names ([owner]/[repo]) if succeeded.
 */
function getRepoNames () {
  return browser.storage.sync.get('repos')
    .then(({repos}) => repos || [])
}

/**
 * @callback ReleaseDataChangedCallback
 * @param {module:API~ReleaseData} releaseData
 */

/**
 * Listens local storage change
 * @param {module:API~ReleaseDataChangedCallback} callback
 */
function addReleaseDataListener (callback) {
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
 * Save release data to local storage
 * @fires browser.storage.onChanged
 * @param {module:API~ReleaseData} releaseData
 * @returns {Promise} A Promise fulfilled with no argument if succeeded.
 */
function saveReleaseData (releaseData) {
  return browser.storage.local.set({[releaseData.name]: releaseData})
}

/**
 * Get release info of a repo
 * @param {string} name - repo name
 * @returns {Promise<module:API~ReleaseData>} A Promise fulfilled with ReleaseData object if succeeded.
 */
function getReleaseData (name) {
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
 * Get release info of all repos
 * @returns {Promise<module:API~ReleaseData[]>} A Promise fulfilled with array of ReleaseData objects if succeeded.
 */
function getAllReleaseData () {
  return getRepoNames()
    .then(names => Promise.all(names.map(getReleaseData)))
}

/**
 * Fetch release info from github
 * @todo oauth token
 * @param {module:API~ReleaseData} releaseData - only name is mandatory
 * @returns {Promise<module:API~ReleaseData>} A Promise fulfilled with ReleaseData object if succeeded.
 */
function fetchReleaseData (releaseData) {
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
 * @typedef {object} MsgREQ_CHECK_REPOS
 * @property {string} type - 'REQ_CHECK_REPOS'
 */

/**
 * @event REQ_CHECK_REPOS
 * @type {MsgREQ_CHECK_REPOS}
 */

/**
 * Listen request from other pages and check repos
 * @listens REQ_CHECK_REPOS
 */
function addCheckReposRequestListener () {
  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'REQ_CHECK_REPOS') {
      return checkRepos()
        .then(() => true)
    }
  })
}

/**
 * Request background page to check repos
 * @fires REQ_CHECK_REPOS
 * @returns {Promise<boolean>} A Promise fulfilled with boolean true if repos check complete.
 */
function requestCheckRepos () {
  return browser.runtime.sendMessage({type: 'REQ_CHECK_REPOS'})
}

/**
 * @typedef {object} MsgRepoUpdate
 * @property {string} type - 'REPO_UPDATED'
 * @property {number} total - total repo count
 * @property {number} success - success count
 * @property {number} failed - failed count
 */

/**
 * @event REPO_UPDATED
 * @type {module:API~MsgRepoUpdate}
 */

/**
 * @callback RepoUpdatedCallback
 * @param {module:API~MsgRepoUpdate} message
 */

/**
 * @param {module:API~RepoUpdatedCallback} callback
 * @listens REPO_UPDATED
 */
function addRepoUpdatedListener (callback) {
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

/**
 * Check for repo update
 * @fires browser.storage.onChanged
 * @fires REPO_UPDATED
 * @returns {Promise<module:API~ReleaseData>} A Promise fulfilled with no argument if succeeded.
 */
function checkRepos () {
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
 * @typedef {object} ScheduleInfo
 * @property {number} lastCheck - last check time, Unix Timestamp in milliseconds
 * @property {number} period - check period in minutes, default to 15
 */

/**
 * @callback ScheduleInfoChangedCallback
 * @param {module:API~ScheduleInfo} scheduleInfo
 */

 /**
  * @param {module:API~ScheduleInfoChangedCallback} callback
  * @listens browser.storage.onChanged
  */
function addScheduleInfoListener (callback) {
  if (!_.isFunction(callback)) {
    throw new TypeError('arg 1 should be a function.')
  }
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.scheduleInfo) {
      callback(changes.scheduleInfo.newValue)
    }
  })
}

/**
 * @fires browser.storage.onChanged
 * @param {module:API~ScheduleInfo} scheduleInfo
 * @returns {Promise} A Promise fulfilled with no argument if succeeded.
 */
function saveScheduleInfo (scheduleInfo) {
  if (process.env.DEBUG_MODE) {
    console.assert(
      _.isNumber(scheduleInfo.lastCheck) && _.isNumber(scheduleInfo.period),
      `saveScheduleInfo: last check ${scheduleInfo.lastCheck}, period ${scheduleInfo.period}`
    )
  }
  return browser.storage.local.get('scheduleInfo')
    .then(({scheduleInfo}) => {
      if (scheduleInfo) {
        return scheduleInfo
      }
      scheduleInfo = {
        lastCheck: Date.now(),
        period: 15
      }
      return browser.storage.local.set({scheduleInfo})
        .then(_.constant(scheduleInfo))
    })
}

/**
 * @returns {Promise<module:API~ScheduleInfo>}
 */
function getScheduleInfo () {
  return browser.storage.local.get('scheduleInfo')
    .then(({scheduleInfo}) => {
      if (scheduleInfo) {
        return scheduleInfo
      }
      scheduleInfo = {
        lastCheck: Date.now(),
        period: 15
      }
      return browser.storage.local.set({scheduleInfo})
        .then(_.constant(scheduleInfo))
    })
}
