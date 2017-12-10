/**
 * @file mock api for repos, for dev mode
 */

import _ from 'lodash'
import moment from 'moment'
import casual from 'casual'
import { extData } from '@/popup/file-type-icons'

const exts = Array.from(extData.keys()).map(x => x[0])

let repoNames = ['octocat/Hello-World', 'crimx/crx-saladict', 'lodash/lodash']

let repoData = {
  'octocat/Hello-World': {
    'name': 'octocat/Hello-World',
    'etag': 'W/"901a664d40f5ad96d703d1ec946bb7da"',
    'last_modified': 'Fri, 08 Dec 2017 07:50:52 GMT',
    'avatar_url': 'https://github.com/images/error/octocat_happy.gif',
    'html_url': 'https://github.com/octocat/Hello-World/releases/v1.0.0',
    'published_at': '2013-02-27T19:35:32Z',
    'tag_name': 'v1.0.0',
    'zipball_url': 'https://api.github.com/repos/octocat/Hello-World/zipball/v1.0.0',
    'tarball_url': 'https://api.github.com/repos/octocat/Hello-World/tarball/v1.0.0',
    'assets': [
      {
        'browser_download_url': 'https://github.com/octocat/Hello-World/releases/download/v1.0.0/example.zip',
        'name': 'example.zip',
      }
    ]
  },
  'crimx/crx-saladict': {
    'name': 'crimx/crx-saladict',
    'etag': 'W/"901a664d40f5ad96d703d1ec946bb7da"',
    'last_modified': 'Fri, 08 Dec 2017 07:50:52 GMT',
    'html_url': 'https://github.com/crimx/crx-saladict/releases/tag/v5.30.0',
    'avatar_url': 'https://avatars3.githubusercontent.com/u/6882794?v=4',
    'published_at': '2017-12-08T07:50:52Z',
    'tag_name': 'v5.30.0',
    'zipball_url': 'https://api.github.com/repos/crimx/crx-saladict/zipball/v5.30.0',
    'tarball_url': 'https://api.github.com/repos/crimx/crx-saladict/tarball/v5.30.0',
    'assets': [
      {
        'browser_download_url': 'https://github.com/crimx/crx-saladict/releases/download/v5.30.0/Saladict.v5.30.0.crx',
        'name': 'Saladict.v5.30.0.crx'
      }
    ]
  },
  'lodash/lodash': {
    'name': 'lodash/lodash',
    'etag': 'W/"afa33a2664f2550b75b1482eb0aeaadb"',
    'last_modified': 'Sun, 20 Mar 2016 18:55:04 GMT',
    'html_url': 'https://github.com/lodash/lodash/releases/tag/4.0.0',
    'avatar_url': 'https://avatars2.githubusercontent.com/u/4303?v=4',
    'published_at': '2016-01-12T22:35:11Z',
    'tag_name': '4.0.0',
    'zipball_url': 'https://api.github.com/repos/lodash/lodash/zipball/4.0.0',
    'tarball_url': 'https://api.github.com/repos/lodash/lodash/tarball/4.0.0',
    'assets': []
  },
}

const repoNameListeners = []
const releaseDataListeners = []
const runtimeMsgListeners = []

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
  return Promise.resolve(repoNames)
}

/**
 * This is synced by browser.
 * @param {string[]} names - array of repo names. [owner]/[repo]
 * @returns {Promise} A Promise fulfilled with no arguments if succeeded.
 */
export function saveRepoNames (names) {
  console.assert(_.every(names, _.isString))
  repoNames = names
  setTimeout(() => {
    repoNameListeners.forEach(callback => callback())
  }, 0)
  return Promise.resolve()
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
  repoNameListeners.push(callback)
}

/**
 * Get release info of a repo
 * @param {string} name - repo name
 * @returns {Promise<ReleaseData>} A Promise fulfilled with ReleaseData object if succeeded.
 */
export function getReleaseData (name) {
  if (repoData[name]) {
    return Promise.resolve(repoData[name])
  }

  return fetchReleaseData({name})
  .then(_.partial(_.tap, _, saveReleaseData))
}

/**
 * Save release data to local storage
 * @fires browser.storage#onChanged
 * @param {ReleaseData} releaseData
 * @returns {Promise} A Promise fulfilled with no argument if succeeded.
 */
export function saveReleaseData (releaseData) {
  repoData[name] = releaseData
  setTimeout(() => {
    releaseDataListeners.forEach(callback => callback())
  }, 0)
  return Promise.resolve()
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
  releaseDataListeners.push(callback)
}

/**
 * Get release info of all repos
 * @returns {Promise<ReleaseData[]>} A Promise fulfilled with array of ReleaseData objects if succeeded.
 */
export function getAllReleaseData () {
  return Promise.all(repoNames.map(getReleaseData))
}

/**
 * Fetch release info from github
 * @param {ReleaseData} releaseData - only name is mandatory
 * @returns {Promise<ReleaseData>} A Promise fulfilled with ReleaseData object if succeeded.
 */
export function fetchReleaseData (releaseData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (releaseData.published_at && Math.random() > 0.3) {
        return resolve(releaseData)
      }

      if (Math.random() > 0.85) {
        return reject(new Error(`404 with ${releaseData.name}`))
      }

      const version = `v${casual.integer(0, 10)}.${casual.integer(0, 30)}.${casual.integer(0, 30)}`
      const date = moment.utc()
        .subtract(casual.integer(0, 100), 'days')
        .subtract(casual.integer(0, 11), 'months')
        .subtract(casual.integer(0, 5), 'years')

      return resolve({
        'name': releaseData.name,
        'etag': `W/"${casual.uuid}"`,
        'last_modified': date.format('ddd, DD MMM Y HH:mm:ss ') + 'GMT',
        'html_url': `https://github.com/${releaseData.name}/releases/${version}`,
        'avatar_url': `https://avatars2.githubusercontent.com/u/${casual.integer(0, 100000)}?v=4`,
        'published_at': date.toISOString(),
        'tag_name': version,
        'zipball_url': `https://api.github.com/repos/${releaseData.name}/zipball/${version}`,
        'tarball_url': `https://api.github.com/repos/${releaseData.name}/tarball/${version}`,
        'assets': Array.from(Array(casual.integer(0, 6))).map(() => {
          const filename = `${casual.words(casual.integer(1, 7))}.${exts[casual.integer(0, exts.length - 1)]}`
          return {
            'browser_download_url': `https://github.com/${releaseData.name}/releases/download/${version}/${filename}`,
            'name': filename,
          }
        })
      })
    }, casual.double(0, 5000))
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
              const msg = {
                type: 'REPO_UPDATED',
                total,
                success,
                failed,
              }
              runtimeMsgListeners.forEach(callback => callback(msg))
            })
            .catch(() => {
              failed += 1
              const msg = {
                type: 'REPO_UPDATED',
                total,
                success,
                failed,
              }
              runtimeMsgListeners.forEach(callback => callback(msg))
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
  runtimeMsgListeners.push(message => {
    if (message.type === 'REPO_UPDATED') {
      callback(message)
    }
  })
}
