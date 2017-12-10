/**
 * @file A smaller set of file type info taken from vscode-icons, for identifying icon files.
 * Added .crx and .xpi support.
 * @see {@link https://github.com/vscode-icons/vscode-icons}
 */

import browser from 'webextension-polyfill'

/**
 * File type icon name
 * @typedef {string} FileTypeIconName
 */

/**
 * File type icon extension
 * @typedef {string} FileTypeIconExt
 */

/**
 * @typedef {Object} FileTypeMeta
 * @property {FileTypeIconName} icon
 * @property {FileTypeIconExt[]} extensions
 */

/**
 * @type {FileTypeMeta[]}
 */
export const metaData = [
  { icon: 'ai2', extensions: ['ai'] },
  { icon: 'audio', extensions: ['aac', 'act', 'aiff', 'amr', 'ape', 'au', 'dct', 'dss', 'dvf', 'flac', 'gsm', 'iklax', 'ivs', 'm4a', 'm4b', 'm4p', 'mmf', 'mogg', 'mp3', 'mpc', 'msv', 'oga', 'ogg', 'opus', 'ra', 'raw', 'tta', 'vox', 'wav', 'wma'] },
  { icon: 'bat', extensions: ['bat'] },
  { icon: 'binary', extensions: ['a', 'app', 'bin', 'cmo', 'cmx', 'cma', 'cmxa', 'cmi', 'dll', 'exe', 'hl', 'ilk', 'lib', 'n', 'ndll', 'o', 'obj', 'pyc', 'pyd', 'pyo', 'pdb', 'scpt', 'scptd', 'so'] },
  { icon: 'css', extensions: ['css'] },
  { icon: 'db', extensions: ['db'] },
  { icon: 'eps', extensions: ['eps'] },
  { icon: 'excel', extensions: ['xls', 'xlsx', 'xlsm', 'ods'] },
  { icon: 'git', extensions: ['gitattributes', 'gitconfig', 'gitignore', 'gitmodules', 'gitkeep'] },
  { icon: 'html', extensions: ['html'] },
  { icon: 'image', extensions: ['jpeg', 'jpg', 'gif', 'png', 'bmp', 'tiff', 'ico'] },
  { icon: 'jar', extensions: ['jar'] },
  { icon: 'java', extensions: ['java'] },
  { icon: 'js', extensions: ['js'] },
  { icon: 'json', extensions: ['json'] },
  { icon: 'log', extensions: ['log'] },
  { icon: 'markdown', extensions: ['md', 'mdown', 'markdown'] },
  { icon: 'package', extensions: ['crx', 'xpi'] },
  { icon: 'pdf2', extensions: ['pdf'] },
  { icon: 'photoshop2', extensions: ['psd'] },
  { icon: 'powerpoint', extensions: ['pot', 'potx', 'potm', 'pps', 'ppsx', 'ppsm', 'ppt', 'pptx', 'pptm', 'pa', 'ppa', 'ppam', 'sldm', 'sldx'] },
  { icon: 'powershell', extensions: ['ps1'] },
  { icon: 'sql', extensions: ['sql'] },
  { icon: 'sqlite', extensions: ['sqlite', 'sqlite3', 'db3'] },
  { icon: 'svg', extensions: ['svg'] },
  { icon: 'text', extensions: ['txt', 'csv'] },
  { icon: 'video', extensions: ['3g2', '3gp', 'asf', 'amv', 'avi', 'divx', 'qt', 'f4a', 'f4b', 'f4p', 'f4v', 'flv', 'm2v', 'm4v', 'mkv', 'mk3d', 'mov', 'mp2', 'mp4', 'mpe', 'mpeg', 'mpeg2', 'mpg', 'mpv', 'nsv', 'ogv', 'rm', 'rmvb', 'svi', 'vob', 'webm', 'wmv'] },
  { icon: 'vim', extensions: ['vimrc', 'gvimrc'] },
  { icon: 'word', extensions: ['doc', 'docx', 'docm', 'dot', 'dotx', 'dotm', 'wll'] },
  { icon: 'xml', extensions: ['xml', 'pex', 'tmlanguage'] },
  { icon: 'yaml', extensions: ['yml'] },
  { icon: 'zip', extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bzip2', 'xz', 'bz2'] },
]

/**
 * Generated with:
 *
 * const extData = metaData.reduce(
 *   (map, {icon, extensions}) => {
 *     extensions.forEach(ext => map.set(ext, icon))
 *     return map
 *   },
 *   new Map()
 * )
 *
 * @type {Map<FileTypeIconName, FileTypeIconExt>}
 */
export const extData = new Map([
  [ 'ai', 'ai2' ],
  [ 'aac', 'audio' ],
  [ 'act', 'audio' ],
  [ 'aiff', 'audio' ],
  [ 'amr', 'audio' ],
  [ 'ape', 'audio' ],
  [ 'au', 'audio' ],
  [ 'dct', 'audio' ],
  [ 'dss', 'audio' ],
  [ 'dvf', 'audio' ],
  [ 'flac', 'audio' ],
  [ 'gsm', 'audio' ],
  [ 'iklax', 'audio' ],
  [ 'ivs', 'audio' ],
  [ 'm4a', 'audio' ],
  [ 'm4b', 'audio' ],
  [ 'm4p', 'audio' ],
  [ 'mmf', 'audio' ],
  [ 'mogg', 'audio' ],
  [ 'mp3', 'audio' ],
  [ 'mpc', 'audio' ],
  [ 'msv', 'audio' ],
  [ 'oga', 'audio' ],
  [ 'ogg', 'audio' ],
  [ 'opus', 'audio' ],
  [ 'ra', 'audio' ],
  [ 'raw', 'audio' ],
  [ 'tta', 'audio' ],
  [ 'vox', 'audio' ],
  [ 'wav', 'audio' ],
  [ 'wma', 'audio' ],
  [ 'bat', 'bat' ],
  [ 'a', 'binary' ],
  [ 'app', 'binary' ],
  [ 'bin', 'binary' ],
  [ 'cmo', 'binary' ],
  [ 'cmx', 'binary' ],
  [ 'cma', 'binary' ],
  [ 'cmxa', 'binary' ],
  [ 'cmi', 'binary' ],
  [ 'dll', 'binary' ],
  [ 'exe', 'binary' ],
  [ 'hl', 'binary' ],
  [ 'ilk', 'binary' ],
  [ 'lib', 'binary' ],
  [ 'n', 'binary' ],
  [ 'ndll', 'binary' ],
  [ 'o', 'binary' ],
  [ 'obj', 'binary' ],
  [ 'pyc', 'binary' ],
  [ 'pyd', 'binary' ],
  [ 'pyo', 'binary' ],
  [ 'pdb', 'binary' ],
  [ 'scpt', 'binary' ],
  [ 'scptd', 'binary' ],
  [ 'so', 'binary' ],
  [ 'css', 'css' ],
  [ 'db', 'db' ],
  [ 'eps', 'eps' ],
  [ 'xls', 'excel' ],
  [ 'xlsx', 'excel' ],
  [ 'xlsm', 'excel' ],
  [ 'ods', 'excel' ],
  [ 'gitattributes', 'git' ],
  [ 'gitconfig', 'git' ],
  [ 'gitignore', 'git' ],
  [ 'gitmodules', 'git' ],
  [ 'gitkeep', 'git' ],
  [ 'html', 'html' ],
  [ 'jpeg', 'image' ],
  [ 'jpg', 'image' ],
  [ 'gif', 'image' ],
  [ 'png', 'image' ],
  [ 'bmp', 'image' ],
  [ 'tiff', 'image' ],
  [ 'ico', 'image' ],
  [ 'jar', 'jar' ],
  [ 'java', 'java' ],
  [ 'js', 'js' ],
  [ 'json', 'json' ],
  [ 'log', 'log' ],
  [ 'md', 'markdown' ],
  [ 'mdown', 'markdown' ],
  [ 'markdown', 'markdown' ],
  [ 'crx', 'package' ],
  [ 'xpi', 'package' ],
  [ 'pdf', 'pdf2' ],
  [ 'psd', 'photoshop2' ],
  [ 'pot', 'powerpoint' ],
  [ 'potx', 'powerpoint' ],
  [ 'potm', 'powerpoint' ],
  [ 'pps', 'powerpoint' ],
  [ 'ppsx', 'powerpoint' ],
  [ 'ppsm', 'powerpoint' ],
  [ 'ppt', 'powerpoint' ],
  [ 'pptx', 'powerpoint' ],
  [ 'pptm', 'powerpoint' ],
  [ 'pa', 'powerpoint' ],
  [ 'ppa', 'powerpoint' ],
  [ 'ppam', 'powerpoint' ],
  [ 'sldm', 'powerpoint' ],
  [ 'sldx', 'powerpoint' ],
  [ 'ps1', 'powershell' ],
  [ 'sql', 'sql' ],
  [ 'sqlite', 'sqlite' ],
  [ 'sqlite3', 'sqlite' ],
  [ 'db3', 'sqlite' ],
  [ 'svg', 'svg' ],
  [ 'txt', 'text' ],
  [ 'csv', 'text' ],
  [ '3g2', 'video' ],
  [ '3gp', 'video' ],
  [ 'asf', 'video' ],
  [ 'amv', 'video' ],
  [ 'avi', 'video' ],
  [ 'divx', 'video' ],
  [ 'qt', 'video' ],
  [ 'f4a', 'video' ],
  [ 'f4b', 'video' ],
  [ 'f4p', 'video' ],
  [ 'f4v', 'video' ],
  [ 'flv', 'video' ],
  [ 'm2v', 'video' ],
  [ 'm4v', 'video' ],
  [ 'mkv', 'video' ],
  [ 'mk3d', 'video' ],
  [ 'mov', 'video' ],
  [ 'mp2', 'video' ],
  [ 'mp4', 'video' ],
  [ 'mpe', 'video' ],
  [ 'mpeg', 'video' ],
  [ 'mpeg2', 'video' ],
  [ 'mpg', 'video' ],
  [ 'mpv', 'video' ],
  [ 'nsv', 'video' ],
  [ 'ogv', 'video' ],
  [ 'rm', 'video' ],
  [ 'rmvb', 'video' ],
  [ 'svi', 'video' ],
  [ 'vob', 'video' ],
  [ 'webm', 'video' ],
  [ 'wmv', 'video' ],
  [ 'vimrc', 'vim' ],
  [ 'gvimrc', 'vim' ],
  [ 'doc', 'word' ],
  [ 'docx', 'word' ],
  [ 'docm', 'word' ],
  [ 'dot', 'word' ],
  [ 'dotx', 'word' ],
  [ 'dotm', 'word' ],
  [ 'wll', 'word' ],
  [ 'xml', 'xml' ],
  [ 'pex', 'xml' ],
  [ 'tmlanguage', 'xml' ],
  [ 'yml', 'yaml' ],
  [ 'zip', 'zip' ],
  [ 'rar', 'zip' ],
  [ '7z', 'zip' ],
  [ 'tar', 'zip' ],
  [ 'gz', 'zip' ],
  [ 'bzip2', 'zip' ],
  [ 'xz', 'zip' ],
  [ 'bz2', 'zip' ],
])

/**
 * @param {string} filepath - file url
 * @returns {string} icon url
 */
export function getFileIcon (filepath) {
  const ext = (/\.([^.]+)$/.exec(filepath) || ['', filepath])[1]
  let icon = extData.get(ext)
  if (!icon) { icon = 'default' }
  return browser.runtime.getURL(`file-type-icons/${icon}.svg`)
}
