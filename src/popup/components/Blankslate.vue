<template>
  <div v-once class="blankslate mt-3">
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
</template>
