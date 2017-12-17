<template>
  <div>
    <header class="header-wrap">
      <div class="header">
        <button class="btn btn-menu" type="button" @click="isShowDrawer = true">
          <octicon name="three-bars"></octicon>
        </button>
        <div>
          <h1 class="header-title">Github Release Notifier</h1>
          <small class="header-description">Unofficial "polyfill" for watching Github releases.</small>
        </div>
        <div class="header-aside">
          <button class="btn btn-sm" type="button" :disabled="!isOnline || scheduleInfo.isChecking" @click="requestCheckRepos">
            <octicon :name="scheduleInfo.isChecking ? 'sync' : 'zap'" :spin="scheduleInfo.isChecking"></octicon>
            Check Now
          </button>
          <input class="btn-filter form-control input-sm" type="text" placeholder="Filter">
          <span class="tooltipped tooltipped-sw tooltipped-no-delay" aria-label="Sign in to increase request rate limit">
            <a href="#" class="text-white text-bold no-underline">Sign in</a>
          </span>
        </div>
      </div>
    </header>
    <div class="pagehead-wrap">
      <transition name="fade">
        <div class="check-progress-bar"
          v-if="scheduleInfo.isChecking"
          :style="{transform: `translateX(${(repoCheckProgress.success + repoCheckProgress.failed) / repos.length * 100}%)`}"
        ></div>
      </transition>
      <div class="pagehead">
        <transition name="out-in-fade" mode="out-in">
          <!-- checking status -->
          <span v-if="scheduleInfo.isChecking">
            Checking...
            {{ repoCheckProgress.success + repoCheckProgress.failed }}/{{ repos.length }}
          </span>
          <!-- check schedule info -->
          <div v-else>
            <span class="mr-3"><octicon name="history"></octicon> Last check: {{ lastCheck }}</span>
            <span><octicon name="clock"></octicon> Next check: {{ nextCheck }}</span>
          </div>
        </transition>
      </div>
    </div>
    <div class="main-container" v-if="!isOnline">
      <div class="flash flash-warn text-center mt-3">
        <octicon name="alert"></octicon>
        You are currently offline.
      </div>
    </div>
    <transition name="out-in-fade" mode="out-in">
      <main class="main-container" v-if="repos.length > 0">
        <div class="repo-item" v-for="repo in repos" key="repo.name">
          <!-- author avatar -->
          <a class=" mt-2 mr-2" :href="repo.author_url" target="_blank" rel="noopener">
            <img class="avatar" :src="repo.avatar_url" width="48" height="48" :alt="`Avatar of ${repo.name}`">
          </a>
          <!-- repo info -->
          <div>
            <!-- repo name -->
            <h3>
              <a :href="`https://github.com/${repo.name}`" target="_blank" rel="noopener">
                <span class="text-normal">{{ repo.name.split('/')[0] }} / </span>{{ repo.name.split('/')[1] }}
              </a>
            </h3>
            <!-- version tag name & publish date -->
            <a
              :href="repo.html_url" target="_blank" rel="noopener"
              :class="moment().subtract(6, 'hours').isBefore(repo.published_at) ? 'text-orange' : 'text-gray'"
            >
              <octicon name="tag" flip="horizontal"></octicon>
              {{ repo.tag_name || 'no release' }}
              {{ repo.published_at ? `~ ${moment(repo.published_at).from(currentTime)}` : '' }}
            </a>
          </div> <!-- repo info -->
          <!-- assets -->
          <div class="assets">
            <!-- uploaded assets -->
            <span v-for="asset in repo.assets.slice(0, 8)" class="tooltipped tooltipped-nw tooltipped-no-delay ml-3" :aria-label="asset.name">
              <a class="asset text-gray" :href="asset.browser_download_url">
                <octicon :name="asset.icon_name" scale="2"></octicon>
              </a>
            </span> <!-- uploaded assets -->
            <!-- zipball & rarball -->
            <template v-if="repo.assets.length <= 6">
              <span v-if="repo.zipball_url" class="tooltipped tooltipped-nw tooltipped-no-delay ml-3" aria-label="Source code (zip)">
                <a class="asset text-gray-lighter" :href="repo.zipball_url">
                  <octicon name="file-zip" scale="2"></octicon>
                </a>
              </span>
              <span v-if="repo.tarball_url" class="tooltipped tooltipped-nw tooltipped-no-delay ml-3" aria-label="Source code (tar.gz)">
                <a class="asset text-gray-lighter" :href="repo.tarball_url">
                  <octicon name="file-zip" scale="2"></octicon>
                </a>
              </span>
            </template> <!-- zipball & rarball -->
          </div> <!-- assets -->
        </div> <!-- .repo-item -->
      </main>
      <!-- blankslate for empty repo list -->
      <main class="main-container mt-3" v-else>
        <div class="blankslate">
          <octicon name="git-commit" scale="2" class="blankslate-icon"></octicon>
          <octicon name="tag" scale="2" class="blankslate-icon"></octicon>
          <octicon name="git-branch" scale="2" class="blankslate-icon"></octicon>
          <h3>Empty</h3>
          <p>Click the
            <span class="clear-fix d-inline-block">
              <button class="btn btn-sm btn-with-count" type="button" tabindex="-1">
                <octicon name="eye"></octicon>
                Watch
              </button>
              <span class="social-count">8</span>
            </span>
            button on a repo page to start watching release.</p>
        </div>
      </main> <!-- blankslate for empty repo list -->
    </transition>
    <drawer :show="isShowDrawer" @hideme="isShowDrawer = false"></drawer>
  </div>
</template>

<script>
import Drawer from './components/Drawer'
import moment from 'moment'
import { requestCheckRepos } from '@/api/message'

export default {
  name: 'app',
  props: ['repos', 'scheduleInfo', 'repoCheckProgress', 'isOnline'],
  data () {
    return {
      currentTime: Date.now(),
      isShowDrawer: false,
    }
  },
  components: {
    Drawer,
  },
  computed: {
    lastCheck () {
      if (!this.scheduleInfo.lastCheck) {
        return 'never'
      }
      return moment(this.scheduleInfo.lastCheck).from(this.currentTime)
    },
    nextCheck () {
      if (!this.scheduleInfo.lastCheck) {
        return 'never'
      }
      return moment(this.scheduleInfo.lastCheck)
        .add(this.scheduleInfo.period, 'minutes')
        .from(this.currentTime)
    },
  },
  methods: {
    moment,
    requestCheckRepos () {
      if (this.isOnline && !this.scheduleInfo.isChecking) {
        requestCheckRepos()
      }
    }
  },
  created () {
    setInterval(() => {
      this.currentTime = Date.now()
    }, 1000)
  },
}
</script>

<style lang="scss">
/*------------------------------------*\
  #primer
\*------------------------------------*/
// Primer master file

// Global requirements
@import "primer-support/index.scss";
// @import "primer-marketing-support/index.scss";

// Core modules
@import "primer-base/index.scss";
// @import "primer-box/index.scss";
// @import "primer-breadcrumb/index.scss";
@import "primer-buttons/index.scss";
// @import "primer-table-object/index.scss";
@import "primer-forms/index.scss";
@import "primer-layout/index.scss";
@import "primer-navigation/index.scss";
@import "primer-tooltips/index.scss";
// @import "primer-truncate/index.scss";

// Product specific css modules
@import "primer-alerts/index.scss";
@import "primer-avatars/index.scss";
@import "primer-blankslate/index.scss";
// @import "primer-branch-name/index.scss";
// @import "primer-labels/index.scss";
// @import "primer-markdown/index.scss";
// @import "primer-popover/index.scss";
// @import "primer-subhead/index.scss";

// marketing specific css modules
// @import "primer-marketing-type/index.scss";
// @import "primer-marketing-buttons/index.scss";
// @import "primer-page-headers/index.scss";
// @import "primer-page-sections/index.scss";
// @import "primer-tables/index.scss";
// @import "primer-marketing-utilities/index.scss";

// Utilities always go last so that they can override components
@import "primer-utilities/index.scss";
</style>

<style>
/*------------------------------------*\
  #base
\*------------------------------------*/
body {
  min-height: 600px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  color: #24292e;
  background-color: #fff;
}
</style>


<style lang="scss" scoped>
/*------------------------------------*\
  #components
\*------------------------------------*/
%container {
  width: 700px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

.header-wrap {
  font-size: 16px;
  color: rgba(255,255,255,0.75);
  background-color: #34495E;
}

.header {
  @extend %container;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-menu {
  display: flex;
  align-items: center;
  width: 38px;
  height: 34px;
  margin-right: 16px;
  color: rgba(255, 255, 255, 0.525);
  border: 1px solid rgba(255, 255, 255, 0.525);
  border-radius: 5px;
  background: transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.625);
  }
}

.header-title {
  margin-bottom: 4px;
  font-size: 21px;
  line-height: 1;
}

.header-description {
  display: block;
  font-size: 12px;
  line-height: 1;
}

.header-aside {
  margin-left: auto;
  padding-top: 12px;
  padding-bottom: 12px;

  & > * {
    margin-left: 14px;
  }
}

.btn-filter {
  background: rgba(255,255,255,0.125);
  border: none;
  outline: none;
  box-shadow: none;
  color: #fff;

  &::-webkit-input-placeholder {
    color: #fff;
  }

  &::-moz-placeholder {
    color: #fff;
  }

  &:focus {
    background: rgba(255,255,255,0.175);
    outline: none;
    border: none;
    box-shadow: none;
  }
}

.pagehead-wrap {
  position: relative;
  padding: 10px 0;
  color: #586069;
  background: #fafbfc;
  border-bottom: 1px solid #e1e4e8;

  .octicon {
    vertical-align: text-bottom;
  }
}

.check-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.03);
  transition: transform 0.4s;
}

.pagehead {
  @extend %container;
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
}

.main-container {
  @extend %container;
}

.repo-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px #e1e4e8 solid;

  .avatar {
    align-self: flex-start;
  }
}

.assets {
  display: flex;
  margin-left: auto;
}

@media (min-width: 992px) {
  .header,
  .pagehead {
    width: 750px
  }
}
</style>

<style>
/*------------------------------------*\
  #states
\*------------------------------------*/
.text-gray-lighter {
  color: #b5b5b5 !important;
}

.out-in-fade-enter-active, .out-in-fade-leave-active {
  transition: opacity .3s ease;
}
.out-in-fade-enter, .out-in-fade-leave-to {
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 500ms;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
}
</style>

