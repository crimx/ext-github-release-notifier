/**
 * Fake extension environment
 */

// import chrome from 'sinon-chrome'
import fetchMock from 'fetch-mock'
import faker from 'faker'
import moment from 'moment'
import _ from 'lodash'
import { extData, getFileIcon } from '@/popup/file-type-icons'

const exts = Array.from(extData.keys())

function randInt (a, b) {
  a = _.isNumber(a) ? a : 0
  b = _.isNumber(b) ? b : 0
  if (a > b) {
    let t = a
    a = b
    b = t
  }
  return Math.floor(Math.random() * (b - a) + a)
}

window.chrome = {
  alarms: {
    onAlarm: {
      addListener () {}
    },
    create () {},
    clearAll () {}
  },
  browserAction: {
    setTitle () {},
    setBadgeText () {},
    setBadgeBackgroundColor () {},
  },
  notifications: {
    create: _.partial(console.log, 'create notifications:'),
    onClicked: {
      addListener () {},
    },
  },
  runtime: {
    onMessage: {},
    getURL (name) { return '/' + name },
  },
  storage: {
    local: {},
    sync: {},
    onChanged: {},
  },
}

/**
 * fake alarms
 */

let alarmTimeouts = []
let alarmListeners = []

chrome.alarms.create = ({delayInMinutes}) => {
  if (delayInMinutes) {
    alarmTimeouts.push(setTimeout(() => {
      alarmListeners.forEach(callback => callback())
    }, delayInMinutes * 60 * 1000))
  }
}

chrome.alarms.onAlarm.addListener = (callback) => {
  console.assert(_.isFunction(callback))
  alarmListeners.push(callback)
}

chrome.alarms.clearAll = (callback) => {
  alarmTimeouts.forEach(clearTimeout)
  alarmTimeouts = []
  callback()
}

/**
 * fake storage
 */

const initRepos = Array.from(Array(randInt(20))).map(() => `${faker.name.firstName()}/${faker.random.word()}`)

const storage = {
  local: _.zipObject(initRepos, _.map(initRepos, name => {
    const version = `v${randInt(10)}.${randInt(30)}.${randInt(30)}`
    const date = moment.utc()
      .subtract(randInt(100), 'days')
      .subtract(randInt(11), 'months')
      .subtract(randInt(5), 'years')
    return {
      'name': name,
      'etag': `W/"${faker.random.alphaNumeric(32)}"`,
      'last_modified': date.format('ddd, DD MMM Y HH:mm:ss ') + 'GMT',
      'html_url': `https://github.com/${name}/releases/${version}`,
      'avatar_url': `https://avatars2.githubusercontent.com/u/${randInt(100000)}?v=4`,
      'author_url': `https://github.com/${name.split('/')[0]}`,
      'published_at': date.valueOf(),
      'tag_name': version,
      'zipball_url': `https://api.github.com/repos/${name}/zipball/${version}`,
      'tarball_url': `https://api.github.com/repos/${name}/tarball/${version}`,
      'assets': Array.from(Array(randInt(6))).map(() => {
        const filename = `${faker.system.commonFileName().replace(/\..*$/, '')}.${exts[randInt(exts.length)]}`
        return {
          'browser_download_url': `https://github.com/${name}/releases/download/${version}/${filename}`,
          'name': filename,
          'icon_name': getFileIcon(filename),
        }
      })
    }
  })),
  sync: {
    repos: initRepos
  },
  listeners: []
}

chrome.storage.local.get = (keys, callback) => {
  keys = _.isString(keys) ? [keys] : _.map(keys)
  callback(_.zipObject(keys, _.map(keys, _.partial(_.get, storage.local, _, undefined))))
}

chrome.storage.sync.get = (keys, callback) => {
  keys = _.isString(keys) ? [keys] : _.map(keys)
  callback(_.zipObject(keys, _.map(keys, _.partial(_.get, storage.sync, _, undefined))))
}

chrome.storage.local.remove = (keys, callback) => {
  keys = _.isString(keys) ? [keys] : _.map(keys)
  keys.forEach(key => delete storage.local[key])
  callback()
}

chrome.storage.sync.remove = (keys, callback) => {
  keys = _.isString(keys) ? [keys] : _.map(keys)
  keys.forEach(key => delete storage.sync[key])
  callback()
}

chrome.storage.local.set = (items, callback = _.noop) => {
  console.assert(_.isObject(items))
  const oldLocal = _.cloneDeep(storage.local)
  storage.local = _.assign({}, storage.local, _.cloneDeep(items))
  const changed = _.flow([
    _.cloneDeep,
    _.toPairs,
    _.partial(_.map, _, ([k, v]) => [k, {newValue: v, oldValue: oldLocal[k]}]),
    _.fromPairs,
  ])(items)
  _.each(storage.listeners, listener => listener(changed, 'local'))
  callback()
}

chrome.storage.sync.set = (items, callback = _.noop) => {
  console.assert(_.isObject(items))
  const oldSync = _.cloneDeep(storage.sync)
  storage.sync = _.assign({}, storage.sync, _.cloneDeep(items))
  const changed = _.flow([
    _.cloneDeep,
    _.toPairs,
    _.partial(_.map, _, ([k, v]) => [k, {newValue: v, oldValue: oldSync[k]}]),
    _.fromPairs,
  ])(items)
  _.each(storage.listeners, listener => listener(changed, 'sync'))
  callback()
}

chrome.storage.onChanged.addListener = callback => {
  console.assert(_.isFunction(callback))
  storage.listeners.push(callback)
}

/**
 * Fake runtime messaging
 */

const msgListeners = []

chrome.runtime.sendMessage = (message, responseCallback = _.noop) => {
  console.assert(_.isObject(message))
  let isResponsed = false
  let isClosed = false
  let isAsync = false
  const cbWrap = (...args) => {
    if (isResponsed || isClosed) {
      return console.error('use deprecated channel')
    }
    responseCallback(...args)
    isResponsed = true
  }

  _.each(msgListeners, listener => {
    if (listener(message, {}, cbWrap)) {
      isAsync = true
    }
  })

  setTimeout(() => {
    if (!isAsync) {
      isClosed = true
    }
  }, 0)
}

chrome.runtime.onMessage.addListener = callback => {
  console.assert(_.isFunction(callback))
  msgListeners.push(callback)
}

/**
 * Mock Fetch
 */

fetchMock.mock({
  name: 'fetch release',
  matcher: /github\.com\/repos\//,
  response (url, {headers}) {
    return new Promise((resolve, reject) => {
      if (headers.etag && Math.random() > 0.3) {
        return resolve({body: '', status: 304})
      }
      if (Math.random() > 0.8) {
        return resolve({
          body: {
            'message': 'Not Found',
            'documentation_url': 'https://developer.github.com/v3/repos/releases/#get-the-latest-release'
          },
          status: 404,
        })
      }
      if (Math.random() > 0.9) {
        return reject(new Error('net work error'))
      }
      setTimeout(() => {
        const name = url.match(/github\.com\/repos\/([^/]+\/[^/]+)/)[1]
        const version = `v${randInt(10)}.${randInt(30)}.${randInt(30)}`
        const date = moment.utc()
          .subtract(randInt(100), 'days')
          .subtract(randInt(11), 'months')
          .subtract(randInt(5), 'years')

        return resolve({
          headers: {
            'etag': `W/"${faker.random.alphaNumeric(32)}"`,
            'last_modified': date.format('ddd, DD MMM Y HH:mm:ss ') + 'GMT',
          },
          body: {
            'html_url': `https://github.com/${name}/releases/${version}`,
            'author': {
              'avatar_url': `https://avatars2.githubusercontent.com/u/${randInt(100000)}?v=4`,
              'html_url': `https://github.com/${name.split('/')[0]}`,
            },
            'published_at': date.toISOString(),
            'tag_name': version,
            'zipball_url': `https://api.github.com/repos/${name}/zipball/${version}`,
            'tarball_url': `https://api.github.com/repos/${name}/tarball/${version}`,
            'assets': Array.from(Array(randInt(6))).map(() => {
              const filename = `${faker.system.commonFileName().replace(/\..*$/, '')}.${exts[randInt(exts.length)]}`
              return {
                'browser_download_url': `https://github.com/${name}/releases/download/${version}/${filename}`,
                'name': filename,
                'icon_name': getFileIcon(filename),
              }
            })
          }
        })
      }, randInt(5000))
    })
  }
})
