/**
 * Higher level api for repos
 * @module api/storage
 */

import browser from 'webextension-polyfill'
import _ from 'lodash'
import semver from 'semver'
import { getFileIcon } from '@/popup/file-type-icons'
import { addOneBadgeUnread } from './badge'
import { getToken } from './oauth'
import {
  fireRepoUpdatedMsg,
  fireCheckReposProgress,
  fireCheckReposComplete,
} from './message'

/**
 * Release data, for generating Map
 * @see {@link https://developer.github.com/v3/repos/releases/}
 * @typedef {object} ReleaseData
 * @property {string} name - repo name [owner]/[repo]
 * @property {string} watching - 'major', 'minor', 'all' or ''
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
 * @param {module:api/storage~RepoNamesChangedCallback} callback
 * @listens browser.storage.onChanged
 */
export function addRepoNamesListener (callback) {
  if (process.env.DEBUG_MODE) {
    if (!_.isFunction(callback)) {
      throw new TypeError('arg 1 should be a function.')
    }
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
 * @param {string[]|string} names - string of one name or array of repo names. [owner]/[repo]
 * @returns {Promise} A Promise fulfilled with no argument if succeeded.
 */
function saveRepoNames (names) {
  if (process.env.DEBUG_MODE) {
    console.assert(_.isString(names) || _.every(names, _.isString))
  }
  if (_.isString(names)) {
    return getRepoNames()
      .then(repos => browser.storage.sync.set({repos: repos.concat([names])}))
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
 * Remove a repo from name list
 * @returns {Promise<string>} A Promise fulfilled with no argument if succeeded.
 */
function removeRepoNames (name) {
  return saveRepoNames([])
}

/**
 * Save release data to local storage
 * @fires browser.storage.onChanged
 * @param {module:api/storage~ReleaseData} releaseData
 * @returns {Promise} A Promise fulfilled with the same releaseData if succeeded.
 */
function saveRepo (releaseData) {
  return browser.storage.local.set({[releaseData.name]: releaseData})
    .then(_.constant(releaseData))
}

/**
 * Get release info of a repo
 * @param {string} name - repo name
 * @returns {Promise<module:api/storage~ReleaseData|null>} A Promise fulfilled with ReleaseData object or null.
 */
export function getRepo (name) {
  return browser.storage.local.get(name)
    .then(response => {
      if (response[name]) {
        return response[name]
      }
      return null
    })
}

/**
 * Delete a repo's data
 * @fires browser.storage.onChanged
 * @param {string} name - repo name
 * @returns {Promise} A Promise fulfilled with the no argument if succeeded.
 */
function removeRepo (name) {
  return browser.storage.local.remove(name)
}

/**
 * Get release info of all repos
 * @returns {Promise<module:api/storage~ReleaseData[]>} A Promise fulfilled with array of ReleaseData objects if succeeded.
 */
export function getAllRepos () {
  return getRepoNames()
    .then(names => Promise.all(
      names.map(
        name => getRepo(name)
          .then(data => data ||
            fetchReleaseData({name})
              .then(saveRepo)
          )
      )
    ))
}

/**
 * Clear all repos
 * @returns {Promise<module:api/storage~ReleaseData[]>} A Promise fulfilled with array of ReleaseData objects if succeeded.
 */
export function removeAllRepos () {
  return getRepoNames()
    .then(names => Promise.all(names.map(removeRepo)))
    .then(removeRepoNames)
}

/**
 * Fetch repo release data, sava it and update repo names
 * @param {string} name - [owner]/[repo]
 * @returns {Promise>} A Promise fulfilled with the repo's releaseData if succeeded.
 */
export function replaceRepo ({name, watching}) {
  if (!watching) {
    return Promise.all([removeRepo(name), removeRepoNames(name)])
      .then(_.noop)
  }

  return getRepoNames()
    .then(repos => {
      const existRepo = _.find(repos, repo => repo.name === name)
      if (existRepo) {
        existRepo.watching = watching
        return existRepo
      }
      return fetchReleaseData({name, watching})
    })
    .then(saveRepo)
    // Trigger popup page update
    .then(releaseData => {
      saveRepoNames(name)
      return releaseData
    })
}

/**
 * Check for repo update and save data
 * @fires browser.storage.onChanged
 * @fires REPO_CHECK_UPDATED
 * @fires CHECK_REPOS_COMPLETE
 * @returns {Promise<module:api/storage~ReleaseData>} A Promise fulfilled with no argument if succeeded.
 */
export function checkRepos () {
  if (!navigator.onLine) {
    if (process.env.DEBUG_MODE) {
      console.log('Check repo: offline')
    }
    return
  }
  return getScheduleInfo()
  .then(info => {
    fireCheckReposProgress({success: 0, failed: 0})
    info.isChecking = true
    return saveScheduleInfo(info)
  })
  .then(fetchAllReleaseData)
  .then(getScheduleInfo)
  .then(info => {
    info.isChecking = false
    info.lastCheck = Date.now()
    return saveScheduleInfo(info)
  })
  .then(fireCheckReposComplete)
}

/**
 * @typedef {object} ScheduleInfo
 * @property {boolean} isChecking
 * @property {number} lastCheck - last check time, Unix Timestamp in milliseconds
 * @property {number} period - check period in minutes, default to 15
 */

/**
 * @callback ScheduleInfoChangedCallback
 * @param {module:api/storage~ScheduleInfo} scheduleInfo
 */

 /**
  * @param {module:api/storage~ScheduleInfoChangedCallback} callback
  * @listens browser.storage.onChanged
  */
export function addScheduleInfoListener (callback) {
  if (process.env.DEBUG_MODE) {
    if (!_.isFunction(callback)) {
      throw new TypeError('arg 1 should be a function.')
    }
  }
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.scheduleInfo) {
      callback(changes.scheduleInfo.newValue)
    }
  })
}

/**
 * @fires browser.storage.onChanged
 * @param {module:api/storage~ScheduleInfo} scheduleInfo
 * @returns {Promise} A Promise fulfilled with no argument if succeeded.
 */
function saveScheduleInfo (scheduleInfo) {
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
 * @returns {Promise<module:api/storage~ScheduleInfo>}
 */
export function getScheduleInfo () {
  return browser.storage.local.get('scheduleInfo')
    .then(({scheduleInfo}) => {
      if (scheduleInfo) {
        return scheduleInfo
      }
      scheduleInfo = {
        isChecking: false,
        lastCheck: Date.now(),
        period: 15
      }
      return browser.storage.local.set({scheduleInfo})
        .then(_.constant(scheduleInfo))
    })
}

/**
 * Fetch release info of a repo from Github
 * @todo oauth token
 * @param {module:api/storage~ReleaseData} releaseData - only name is mandatory
 * @returns {Promise<module:api/storage~ReleaseData>} A Promise fulfilled with ReleaseData object if succeeded.
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

  return getToken()
    .then(token => {
      const params = token ? `?access_token=${token}` : ''
      return fetch(`https://api.github.com/repos/${releaseData.name}/releases/latest${params}`, {headers})
    })
    .then(response => {
      if (process.env.DEBUG_MODE) {
        console.log(`Server response ${response.status} for ${releaseData.name}`)
      }
      const rateLimitRemaining = Number(response.headers.get('X-RateLimit-Remaining'))
      if (rateLimitRemaining > 0) {
        saveRateLimitRemaining(rateLimitRemaining)
      }
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
          watching: releaseData.watching,
          etag: response.headers.get('etag') || '',
          last_modified: response.headers.get('last-modified') || '',
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
          watching: releaseData.watching,
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
 * Fetch all repos' release info from Github
 * @fires browser.storage.onChanged
 * @fires REPO_CHECK_UPDATED
 * @returns {Promise<module:api/storage~ReleaseData>} A Promise fulfilled with no argument if succeeded.
 */
function fetchAllReleaseData () {
  return getAllRepos()
    .then(repos => {
      let success = 0
      let failed = 0
      const executors = _.map(_.chunk(repos, 10), chunkRepos => {
        // 10 requests at a time
        return () => Promise.all(
          _.map(chunkRepos, repoData => {
            return fetchReleaseData(repoData)
              .then(newData => {
                if (newData.watching) {
                  saveRepo(newData)
                  success += 1
                  fireCheckReposProgress({success, failed})
                } else {
                  removeRepo(newData.name)
                  removeRepoNames(newData.name)
                  if (process.env.DEBUG_MODE) {
                    console.warn(`${newData.name} is ignoring but still in the list, removed.`)
                  }
                }
                if (shouldNotifyUser(newData, repoData)) {
                  // notify new release
                  fireRepoUpdatedMsg(newData)
                  addOneBadgeUnread()
                }
              })
              .catch(err => {
                console.warn(err.message || err.toString())
                failed += 1
                fireCheckReposProgress({success, failed})
              })
          })
        )
      })

      return _.reduce(executors, (p, exe) => p.then(exe), Promise.resolve())
    })
}

/**
 * Determine whether to notify user of the new release
 * @param {module:api/storage~ReleaseData} newData
 * @param {module:api/storage~ReleaseData} oldData
 * @returns {boolean}
 */
function shouldNotifyUser (newData, oldData) {
  const nTag = newData.tag_name
  const oTag = oldData.tag_name
  if (!semver.valid(nTag) || !semver.valid(oTag)) {
    return true
  }
  const diff = semver.diff(nTag, oTag)
  switch (newData.watching) {
    case 'major': return diff === 'major'
    case 'minor': return diff === 'major' || diff === 'minor'
    case 'all': return Boolean(diff)
    default: return false
  }
}

/**
 * @callback RateLimitRemainingCallback
 * @param {number} rateLimitRemaining - rate limit remaining
 */

/**
 * @param {module:api/storage~RateLimitRemainingCallback} callback
 * @listens browser.storage.onChanged
 */
export function addRateLimitRemainingListener (callback) {
  if (process.env.DEBUG_MODE) {
    if (!_.isFunction(callback)) {
      throw new TypeError('arg 1 should be a function.')
    }
  }
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.rateLimitRemaining) {
      callback(changes.rateLimitRemaining.newValue)
    }
  })
}

/**
 * @fires browser.storage.onChanged
 * @param {number} num - rate limit remaining
 * @returns {Promise} A promise with no argument
 */
export function saveRateLimitRemaining (num) {
  if (process.env.DEBUG_MODE) {
    console.assert(_.isNumber(num))
    console.log('rate limit remaining: ' + num)
  }
  return browser.storage.local.set({rateLimitRemaining: num})
}
