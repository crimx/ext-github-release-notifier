/**
 * api for repos
 * @module API
 */

import browser from 'webextension-polyfill'
import _ from 'lodash'
import { getFileIcon } from '@/popup/file-type-icons'

/**
 * Release data, for generating Map
 * @see {@link https://developer.github.com/v3/repos/releases/}
 * @typedef {object} ReleaseData
 * @property {string} name - repo name [owner]/[repo]
 * @property {string} etag
 * @property {string} last_modified, RFC 2822 string
 * @property {string} avatar_url - author avatar
 * @property {string} author_url
 * @property {string} html_url - release page
 * @property {number} published_at - publish date, Unix Timestamp in milliseconds
 * @property {string} tag_name - release tag
 * @property {string} zipball_url
 * @property {string} tarball_url
 * @property {object[]} assets
 * @property {string} assets[].browser_download_url - file url
 * @property {string} assets[].name - file name
 * @property {string} assets[].icon_name
 */

/**
 * @callback RepoNamesChangedCallback
 * @param {string[]} names
 */

/**
 * Listens sync storage change
 * @param {module:API~RepoNamesChangedCallback} callback
 * @listens browser.storage.onChanged
 */
export function addRepoNamesListener (callback) {
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
export function saveRepoNames (names) {
  if (process.env.DEBUG_MODE) {
    console.assert(_.every(names, _.isString))
  }
  return browser.storage.sync.set({repos: names})
}

/**
 * This is synced by browser.
 * @returns {Promise<string[]>} A Promise fulfilled with array of repo names ([owner]/[repo]) if succeeded.
 */
export function getRepoNames () {
  return browser.storage.sync.get('repos')
    .then(({repos}) => repos || [])
}

/**
 * Save release data to local storage
 * @fires browser.storage.onChanged
 * @param {module:API~ReleaseData} releaseData
 * @returns {Promise} A Promise fulfilled with no argument if succeeded.
 */
export function saveReleaseData (releaseData) {
  return browser.storage.local.set({[releaseData.name]: releaseData})
}

/**
 * Get release info of a repo
 * @param {string} name - repo name
 * @returns {Promise<module:API~ReleaseData>} A Promise fulfilled with ReleaseData object if succeeded.
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
 * Get release info of all repos
 * @returns {Promise<module:API~ReleaseData[]>} A Promise fulfilled with array of ReleaseData objects if succeeded.
 */
export function getAllReleaseData () {
  return getRepoNames()
    .then(names => Promise.all(names.map(getReleaseData)))
}

/**
 * Fetch release info from github
 * @todo oauth token
 * @param {module:API~ReleaseData} releaseData - only name is mandatory
 * @returns {Promise<module:API~ReleaseData>} A Promise fulfilled with ReleaseData object if succeeded.
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
      if (response.status === 404) {
        // Maybe the author didn't publish a release yet
        // Or releases has been emptied
        // Or repo has been deleted
        return {
          name: releaseData.name,
          etag: '',
          last_modified: '',
          avatar_url: releaseData.avatar_url || 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==', // gray
          author_url: releaseData.author_url || 'https://github.com/' + releaseData.name.split('/')[0],
          html_url: releaseData.html_url || 'https://github.com/' + releaseData.name,
          published_at: 0, // for sorting
          tag_name: '',
          zipball_url: '',
          tarball_url: '',
          assets: [],
        }
      }
      if (!response.ok) {
        return Promise.reject(new Error())
      }
      return response.json()
        .then(json => ({
          name: releaseData.name,
          etag: response.headers.get('etag') || '',
          last_modified: response.headers.get('last-modified') || '',
          avatar_url: json.author.avatar_url,
          author_url: json.author.html_url,
          published_at: new Date(json.published_at).valueOf(),
          ..._.pick(json, [
            'html_url',
            'tag_name',
            'zipball_url',
            'tarball_url',
          ]),
          assets: _.map(json.assets || [], asset => ({
            ..._.pick(asset, ['browser_download_url', 'name']),
            icon_name: getFileIcon(asset.name),
          }))
        }))
    })
    .catch(() => Promise.reject(new Error(`Failed to check repo: ${releaseData.name}`)))
}

/**
 * @typedef {object} MsgCHECK_REPOS_COMPLETE
 * @property {string} type - 'CHECK_REPOS_COMPLETE'
 */

/**
 * @event CHECK_REPOS_COMPLETE
 * @type {MsgCHECK_REPOS_COMPLETE}
 */

/**
 * Listens repo check complete
 * @listens CHECK_REPOS_COMPLETE
 */
export function addCheckReposCompleteListener (callback) {
  if (!_.isFunction(callback)) {
    throw new TypeError('arg 1 should be a function.')
  }
  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'CHECK_REPOS_COMPLETE') {
      callback(message)
    }
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
 * Listens request from other pages and perform check repos
 * @listens REQ_CHECK_REPOS
 */
export function listenCheckReposRequest () {
  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'REQ_CHECK_REPOS') {
      return checkRepos()
    }
  })
}

/**
 * Request background page to check repos
 * @fires REQ_CHECK_REPOS
 * @returns {Promise<boolean>} A Promise fulfilled with no argument.
 */
export function requestCheckRepos () {
  return browser.runtime.sendMessage({type: 'REQ_CHECK_REPOS'})
}

/**
 * @typedef {object} MsgRepoUpdate
 * @property {string} type - 'REPO_CHECK_UPDATED'
 * @property {number} total - total repo count
 * @property {number} success - success count
 * @property {number} failed - failed count
 */

/**
 * @event REPO_CHECK_UPDATED
 * @type {module:API~MsgRepoUpdate}
 */

/**
 * @callback RepoCheckCallback
 * @param {module:API~MsgRepoUpdate} message
 */

/**
 * @param {module:API~RepoCheckCallback} callback
 * @listens REPO_CHECK_UPDATED
 */
export function addCheckReposProgressListener (callback) {
  if (!_.isFunction(callback)) {
    throw new TypeError('arg 1 should be a function.')
  }
  browser.runtime.onMessage.addListener(message => {
    if (message.type === 'REPO_CHECK_UPDATED') {
      callback(message)
    }
  })
}

/**
 * Check for repo update and save data
 * @fires browser.storage.onChanged
 * @fires REPO_CHECK_UPDATED
 * @fires CHECK_REPOS_COMPLETE
 * @returns {Promise<module:API~ReleaseData>} A Promise fulfilled with no argument if succeeded.
 */
export function checkRepos () {
  return getScheduleInfo()
  .then(info => {
    browser.runtime.sendMessage({
      type: 'REPO_CHECK_UPDATED',
      success: 0,
      failed: 0,
    })
    info.isChecking = true
    return saveScheduleInfo(info)
  })
  .then(_fetchReleaseDataInChunks)
  .then(getScheduleInfo)
  .then(info => {
    info.isChecking = false
    info.lastCheck = Date.now()
    return saveScheduleInfo(info)
  })
  .then(() => browser.runtime.sendMessage({type: 'CHECK_REPOS_COMPLETE'}))
}

/**
 * Check for repo update and save data
 * @fires browser.storage.onChanged
 * @fires REPO_CHECK_UPDATED
 * @returns {Promise<module:API~ReleaseData>} A Promise fulfilled with no argument if succeeded.
 */
function _fetchReleaseDataInChunks () {
  return getAllReleaseData()
    .then(repos => {
      let success = 0
      let failed = 0
      const executors = _.map(_.chunk(repos, 10), chunkRepos => {
        // 10 requests at a time
        return () => Promise.all(
          _.map(chunkRepos, repoData => {
            return fetchReleaseData(repoData)
              .then(newData => {
                success += 1
                saveReleaseData(newData)
                browser.runtime.sendMessage({
                  type: 'REPO_CHECK_UPDATED',
                  success,
                  failed,
                })
              })
              .catch(err => {
                console.warn(err.message || err.toString())
                failed += 1
                browser.runtime.sendMessage({
                  type: 'REPO_CHECK_UPDATED',
                  success,
                  failed,
                })
              })
          })
        )
      })

      return _.reduce(executors, (p, exe) => p.then(exe), Promise.resolve())
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
export function addScheduleInfoListener (callback) {
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
export function saveScheduleInfo (scheduleInfo) {
  if (process.env.DEBUG_MODE) {
    console.assert(
      _.isBoolean(scheduleInfo.isChecking) &&
      _.isNumber(scheduleInfo.lastCheck) &&
      _.isNumber(scheduleInfo.period),
      `saveScheduleInfo: last check ${scheduleInfo.lastCheck}, period ${scheduleInfo.period}`
    )
  }
  return browser.storage.local.set({scheduleInfo})
    .then(_.noop)
}

/**
 * @returns {Promise<module:API~ScheduleInfo>}
 */
export function getScheduleInfo () {
  return browser.storage.local.get('scheduleInfo')
    .then(({scheduleInfo}) => {
      if (scheduleInfo) {
        return scheduleInfo
      }
      scheduleInfo = {
        isChecking: false,
        lastCheck: NaN,
        period: 15
      }
      return browser.storage.local.set({scheduleInfo})
        .then(_.constant(scheduleInfo))
    })
}
