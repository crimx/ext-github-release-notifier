<template>
  <div>
    <transition name="slide">
      <nav class="drawer" v-if="show" v-once>
        <a class="drawer-head">
          <span class="drawer-logo" role="img" aria-label="Github Release Nofitifer LOGO"></span>
        </a>
        <ul class="filter-list">
          <li>
            <a class="filter-item drawer-item" href="#" @click.prevent="clearAll">
              <span class="drawer-item-icon"><octicon name="x"></octicon></span>
              <span class="drawer-item-title">Clear all</span>
            </a>
          </li>
          <li>
            <a class="filter-item drawer-item" :href="storeURL" target="_blank" rel="noopener">
              <span class="drawer-item-icon"><octicon name="thumbsup"></octicon></span>
              <span class="drawer-item-title">Rate this extension</span>
            </a>
          </li>
          <li>
            <a class="filter-item drawer-item" href="https://github.com/crimx/ext-github-release-notifier/issues" target="_blank" rel="noopener">
              <span class="drawer-item-icon"><octicon name="issue-opened"></octicon></span>
              <span class="drawer-item-title">Fire an issue</span>
            </a>
          </li>
          <li>
            <a class="filter-item drawer-item" href="https://github.com/crimx/ext-github-release-notifier" target="_blank" rel="noopener">
              <span class="drawer-item-icon"><octicon name="mark-github"></octicon></span>
              <span class="drawer-item-title">Source code</span>
            </a>
          </li>
          <li>
            <a class="filter-item drawer-item" href="https://www.paypal.me/crimx" target="_blank" rel="noopener">
              <span class="drawer-item-icon"><svg class="octicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480"><path d="M400 208.008h-48v-16c0-8.832-7.168-16-16-16H16c-8.832 0-16 7.168-16 16v128c0 79.392 64.608 144 144 144h64c62.496 0 115.264-40.256 135.168-96H400c21.6 0 41.696-8.416 56.288-23.392C471.584 329.704 480 309.608 480 288.008c0-44.096-35.872-80-80-80zm-80 112c0 61.76-50.24 112-112 112h-64c-61.76 0-112-50.24-112-112v-112h288v112zm113.664 1.952c-8.832 9.056-20.8 14.048-33.664 14.048h-49.632c.608-5.312 1.632-10.528 1.632-16v-80h48c26.464 0 48 21.536 48 48 0 12.896-4.992 24.832-14.336 33.952zM285.952 72.168c-10.624-18.912-3.968-27.392-2.912-28.576 6.208-5.92 6.688-15.744.928-22.208-5.888-6.624-16.032-7.232-22.592-1.344-1.12 1.024-27.36 25.056-3.328 67.808 10.848 19.264 3.712 27.712 3.328 28.192-6.592 5.856-7.232 16-1.344 22.592A15.994 15.994 0 0 0 272 144.008a16.03 16.03 0 0 0 10.624-4.032c1.12-.992 27.36-25.056 3.328-67.808zm-112 0c-10.624-18.912-3.968-27.392-2.912-28.576 6.208-5.92 6.688-15.744.928-22.208-5.888-6.624-16.064-7.232-22.592-1.344-1.12 1.024-27.36 25.056-3.328 67.808 10.848 19.264 3.712 27.712 3.328 28.192-6.592 5.856-7.232 16-1.344 22.592A15.994 15.994 0 0 0 160 144.008a16.03 16.03 0 0 0 10.624-4.032c1.12-.992 27.36-25.056 3.328-67.808zm-112 0c-10.624-18.912-3.968-27.392-2.912-28.576 6.208-5.92 6.688-15.744.928-22.208-5.92-6.624-16.064-7.232-22.592-1.344-1.12 1.024-27.36 25.056-3.328 67.808 10.848 19.264 3.712 27.712 3.328 28.192-6.592 5.888-7.232 16-1.344 22.592A15.994 15.994 0 0 0 48 144.008a16.03 16.03 0 0 0 10.624-4.032c1.12-.992 27.36-25.056 3.328-67.808z"/></svg></span>
              <span class="drawer-item-title">Buy me a coffee</span>
            </a>
          </li>
        </ul>
        <footer class="drawer-footer">
          <octicon name="pencil"></octicon>
          width
          <octicon name="heart"></octicon>
          by CRIMX
        </footer>
      </nav>
    </transition>
    <transition name="fade">
      <div class="drawer-mask" v-if="show" v-once @click="$emit('hideme')"></div>
    </transition>
  </div>
</template>

<script>
import { removeAllRepos } from '@/api/storage'
export default {
  props: {
    show: Boolean
  },
  data () {
    return {
      name: 'drawer',
      storeURL: navigator.userAgent.indexOf('Chrome') !== -1
        ? 'https://chrome.google.com/webstore/detail/' + chrome.runtime.id
        : '' /** @todo Firefox store url */
    }
  },
  methods: {
    clearAll () {
      if (confirm('Stop watching all repos?')) {
        this.$emit('hideme')
        removeAllRepos()
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.drawer {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 100001;
  top: 0;
  bottom: 0;
  left: 0;
  width: 50%;
  max-width: 300px;
  background: #fff;
  box-shadow: -5px 0 25px 5px rgba(0 ,0, 0, .9);
  will-change: transform;
}

.drawer-mask {
  position: fixed;
  z-index: 100000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.drawer-head {
  display: block;
  background: #34495e;
  overflow: hidden;
}

.drawer-logo {
  display: block;
  width: 50%;
  height: 0;
  padding-top: 50%;
  margin: 15% auto;
  background: url('./icon.svg') no-repeat;
  background-size: 100%;
}

.drawer-item {
  font-size: 16px;
}

.drawer-item-icon {
  display: inline-block;
  width: 16px;
  text-align: center;
  vertical-align: text-bottom;
  margin-right: 5px;
}

.drawer-footer {
  margin-top: auto;
  margin-bottom: 8px;
  text-align: center;
  color: #aaa;
}

/*------------------------------------*\
  #states
\*------------------------------------*/
.slide-enter-active, .slide-leave-active {
  transition: transform 500ms;
}
.slide-enter, .slide-leave-active {
  transform: translateX(-100%);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 500ms;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
}
</style>
