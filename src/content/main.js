import {
  requestReplaceRepo,
} from '@/api/message'

import {
  getRepo,
  addRepoNamesListener,
} from '@/api/storage'

// delay anyway
setTimeout(main, 500)

window.addEventListener('click', main, true)

addRepoNamesListener(() => {
  const notifier = document.querySelector('#release-notifier')
  if (notifier) {
    notifier.remove()
    document.querySelector('#release-notifier-list').remove()
  }
  main()
})

function main () {
  if (document.querySelector('#release-notifier')) { return }

  const menuModal = document.querySelector('.pagehead-actions .select-menu-modal')
  if (!menuModal) {
    if (process.env.DEBUG_MODE) {
      console.warn('Notifier: watch dropdown undetected')
    }
    return
  }

  // Check injection
  if (
    Array.from(menuModal.querySelectorAll('.select-menu-title'))
      .some(el => el.textContent.toLowerCase().indexOf('release') !== -1)
  ) {
    if (process.env.DEBUG_MODE) {
      console.warn('Release title already exist')
    }
    return
  }

  // Get reponame
  const repoNameTester = /^[^/\s]+\/[^/\s]+$/
  let meta = document.querySelector('meta[name=octolytics-dimension-repository_nwo]')
  if (!meta || !repoNameTester.test(meta.getAttribute('content'))) {
    meta = document.querySelector('meta[name=octolytics-dimension-repository_network_root_nwo]')
    if (!meta || !repoNameTester.test(meta.getAttribute('content'))) {
      if (process.env.DEBUG_MODE) {
        console.warn(`Notifier: repo name cannot be found`)
      }
      return
    }
  }

  getRepo(meta.getAttribute('content'))
    .then(repoData => inject(menuModal, repoData || {name: meta.getAttribute('content')}))
}

function inject (menuModal, repoData) {
  const menuHeader = document.createElement('div')
  menuHeader.className = 'select-menu-header'
  menuHeader.id = 'release-notifier'
  menuHeader.tabIndex = -1
  menuHeader.innerHTML = '<a class="select-menu-title" href="https://github.com/crimx/ext-github-release-notifier">Release Notifier</a>'

  const menuList = document.createElement('div')
  menuList.className = 'select-menu-list'
  menuList.id = 'release-notifier-list'
  menuList.setAttribute('role', 'menu')
  menuList.innerHTML = `
  <button value="major" aria-checked="${repoData.watching === 'major' ? 'true' : 'false'}" class="select-menu-item width-full release-notifier-btn" type="button" role="menuitemradio">
    <svg aria-hidden="${repoData.watching === 'major' ? 'false' : 'true'}" class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
    <div class="select-menu-item-text">
      <span class="select-menu-item-heading">Watching major</span>
      <span class="description">Be notified of new major release.</span>
    </div>
  </button>

  <button value="minor" aria-checked="${repoData.watching === 'minor' ? 'true' : 'false'}" class="select-menu-item width-full release-notifier-btn" type="button" role="menuitemradio">
    <svg aria-hidden="${repoData.watching === 'minor' ? 'false' : 'true'}" class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
    <div class="select-menu-item-text">
      <span class="select-menu-item-heading">Watching minor</span>
      <span class="description">Be notified of new minor release.</span>
    </div>
  </button>

  <button value="all" aria-checked="${repoData.watching === 'all' ? 'true' : 'false'}" class="select-menu-item width-full release-notifier-btn" type="button" role="menuitemradio">
    <svg aria-hidden="${repoData.watching === 'all' ? 'false' : 'true'}" class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
    <div class="select-menu-item-text">
      <span class="select-menu-item-heading">Watching all</span>
      <span class="description">Be notified of new all release.</span>
    </div>
  </button>

  <button value="ignore" aria-checked="${!repoData.watching ? 'true' : 'false'}" class="select-menu-item width-full release-notifier-btn" type="button" role="menuitemradio">
    <svg aria-hidden="${!repoData.watching ? 'false' : 'true'}" class="octicon octicon-check select-menu-item-icon" viewBox="0 0 12 16" version="1.1" width="12" height="16"><path fill-rule="evenodd" d="M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5L12 5z"></path></svg>
    <div class="select-menu-item-text">
      <span class="select-menu-item-heading">Ignoring</span>
      <span class="description">Not be notified.</span>
    </div>
  </button>
  `

  menuModal.appendChild(menuHeader)
  menuModal.appendChild(menuList)

  const btns = menuModal.querySelectorAll('.release-notifier-btn')
  const icons = menuModal.querySelectorAll('.release-notifier-btn svg')

  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('aria-checked') === 'true') { return }

      btns.forEach(btn => btn.setAttribute('aria-checked', 'false'))
      icons.forEach(icon => icon.setAttribute('aria-checked', 'false'))

      btn.setAttribute('aria-checked', 'true')
      icons[i].setAttribute('aria-checked', 'true')

      document.body.click() // close menu

      requestReplaceRepo({
        name: repoData.name,
        watching: btn.value === 'ignore' ? '' : btn.value
      })
    }, false)
  })
}
