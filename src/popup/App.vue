<template>
  <div>
    <header class="header-wrap">
      <div class="header">
        <div class="header-aside">
          <button class="btn btn-sm" type="button" :disabled="scheduleInfo.isChecking" @click="requestCheckRepos">
            <octicon :name="scheduleInfo.isChecking ? 'sync' : 'zap'" :spin="scheduleInfo.isChecking"></octicon>
            Check Now
          </button>
          <input class="btn-filter form-control input-sm" type="text" placeholder="Filter">
          <a href="#" class="text-white text-bold no-underline" title="sign in">Sign in</a>
        </div>
      </div>
    </header>
    <div class="pagehead-wrap">
      <div class="pagehead">
        <transition name="pagehead-fade" mode="out-in">
          <span v-if="scheduleInfo.isChecking">Checking...</span>
          <div v-else>
            <span class="mr-2"><octicon name="history"></octicon> Last check: {{ lastCheck }}</span>
            <span><octicon name="clock"></octicon> Next check: {{ nextCheck }}</span>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { requestCheckRepos } from '@/api'
import Octicon from 'vue-octicon/components/Octicon.vue'
import 'vue-octicon/icons/clock'
import 'vue-octicon/icons/history'
import 'vue-octicon/icons/sync'
import 'vue-octicon/icons/zap'

export default {
  name: 'app',
  props: ['allReleaseData', 'scheduleInfo', 'repoCheckProgress'],
  data () {
    return {
      currentTime: Date.now()
    }
  },
  components: {
    Octicon,
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
    }
  },
  methods: {
    requestCheckRepos
  },
  created () {
    setInterval(() => {
      this.currentTime = Date.now()
    }, 1000)
  }
}
</script>

<style lang="scss">
// Primer master file

// Global requirements
@import "primer-support/index.scss";
// @import "primer-marketing-support/index.scss";

// Core modules
@import "primer-base/index.scss";
// @import "primer-box/index.scss";
// @import "primer-breadcrumb/index.scss";
@import "primer-buttons/index.scss";
@import "primer-table-object/index.scss";
@import "primer-forms/index.scss";
@import "primer-layout/index.scss";
// @import "primer-navigation/index.scss";
// @import "primer-tooltips/index.scss";
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
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  color: #24292e;
  background-color: #fff;
}
</style>


<style lang="scss">
%container {
  width: 980px;
  margin: 0 auto;
}

.header-wrap {
  padding-top: 12px;
  padding-bottom: 12px;
  font-size: 16px;
  color: rgba(255,255,255,0.75);
  background-color: #24292e;
}

.header {
  @extend %container;
  display: flex;
  justify-content: space-between;
}

.header-aside {
  margin-left: auto;

  & > * {
    margin-left: 16px;
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
  padding: 10px 0;
  color: #586069;
  background: #fafbfc;
  border-bottom: 1px solid #e1e4e8;

  .octicon {
    vertical-align: text-bottom;
  }
}

.pagehead {
  @extend %container;
  display: flex;
  justify-content: center;
}
</style>

<style>
.pagehead-fade-enter-active, .pagehead-fade-leave-active {
  transition: opacity .3s ease;
}
.pagehead-fade-enter, .pagehead-fade-leave-to {
  opacity: 0;
}
</style>

