/**
 * A smaller set of file type info taken from vscode-icons, for identifying icon files.
 * Added .crx and .xpi support.
 * @module FileTypeIcons
 * @see {@link https://github.com/vscode-icons/vscode-icons}
 */

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
  // { icon: 'ai2', extensions: ['ai'] },
  { icon: 'file-binary', extensions: ['aac', 'act', 'aiff', 'amr', 'ape', 'au', 'dct', 'dss', 'dvf', 'flac', 'gsm', 'iklax', 'ivs', 'm4a', 'm4b', 'm4p', 'mmf', 'mogg', 'mp3', 'mpc', 'msv', 'oga', 'ogg', 'opus', 'ra', 'raw', 'tta', 'vox', 'wav', 'wma'] },
  // { icon: 'bat', extensions: ['bat'] },
  { icon: 'file-binary', extensions: ['a', 'bin', 'cmo', 'cmx', 'cma', 'cmxa', 'cmi', 'dll', 'hl', 'ilk', 'lib', 'n', 'ndll', 'o', 'obj', 'pyc', 'pyd', 'pyo', 'pdb', 'scpt', 'scptd', 'so'] },
  { icon: 'file-code', extensions: ['c', 'cc', 'class', 'clj', 'cpp', 'cs', 'css', 'cxx', 'el', 'go', 'h', 'html', 'java', 'js', 'json', 'jsx', 'lua', 'm', 'm4', 'pl', 'po', 'py', 'rb', 'sass', 'scss', 'sh', 'swift', 'ts', 'vb', 'vcxproj', 'vue', 'xcodeproj', 'xml'] },
  // { icon: 'css', extensions: ['css'] },
  // { icon: 'db', extensions: ['db'] },
  // { icon: 'eps', extensions: ['eps'] },
  // { icon: 'excel', extensions: ['xls', 'xlsx', 'xlsm', 'ods'] },
  // { icon: 'git', extensions: ['gitattributes', 'gitconfig', 'gitignore', 'gitmodules', 'gitkeep'] },
  // { icon: 'html', extensions: ['html'] },
  { icon: 'file-media', extensions: ['jpeg', 'jpg', 'gif', 'png', 'bmp', 'tiff', 'ico'] },
  // { icon: 'jar', extensions: ['jar'] },
  // { icon: 'java', extensions: ['java'] },
  // { icon: 'js', extensions: ['js'] },
  // { icon: 'json', extensions: ['json'] },
  // { icon: 'log', extensions: ['log'] },
  // { icon: 'markdown', extensions: ['md', 'mdown', 'markdown'] },
  { icon: 'package', extensions: ['app', 'apk', 'crx', 'exe', 'xpi'] },
  { icon: 'file-pdf', extensions: ['pdf'] },
  // { icon: 'photoshop2', extensions: ['psd'] },
  // { icon: 'powerpoint', extensions: ['pot', 'potx', 'potm', 'pps', 'ppsx', 'ppsm', 'ppt', 'pptx', 'pptm', 'pa', 'ppa', 'ppam', 'sldm', 'sldx'] },
  // { icon: 'powershell', extensions: ['ps1'] },
  // { icon: 'sql', extensions: ['sql'] },
  // { icon: 'sqlite', extensions: ['sqlite', 'sqlite3', 'db3'] },
  // { icon: 'svg', extensions: ['svg'] },
  // { icon: 'text', extensions: ['txt', 'csv'] },
  { icon: 'file-binary', extensions: ['3g2', '3gp', 'asf', 'amv', 'avi', 'divx', 'qt', 'f4a', 'f4b', 'f4p', 'f4v', 'flv', 'm2v', 'm4v', 'mkv', 'mk3d', 'mov', 'mp2', 'mp4', 'mpe', 'mpeg', 'mpeg2', 'mpg', 'mpv', 'nsv', 'ogv', 'rm', 'rmvb', 'svi', 'vob', 'webm', 'wmv'] },
  // { icon: 'vim', extensions: ['vimrc', 'gvimrc'] },
  // { icon: 'word', extensions: ['doc', 'docx', 'docm', 'dot', 'dotx', 'dotm', 'wll'] },
  // { icon: 'xml', extensions: ['xml', 'pex', 'tmlanguage'] },
  // { icon: 'yaml', extensions: ['yml'] },
  { icon: 'file-zip', extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bzip2', 'xz', 'bz2'] },
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
  ['aac', 'file-binary'],
  ['act', 'file-binary'],
  ['aiff', 'file-binary'],
  ['amr', 'file-binary'],
  ['ape', 'file-binary'],
  ['au', 'file-binary'],
  ['dct', 'file-binary'],
  ['dss', 'file-binary'],
  ['dvf', 'file-binary'],
  ['flac', 'file-binary'],
  ['gsm', 'file-binary'],
  ['iklax', 'file-binary'],
  ['ivs', 'file-binary'],
  ['m4a', 'file-binary'],
  ['m4b', 'file-binary'],
  ['m4p', 'file-binary'],
  ['mmf', 'file-binary'],
  ['mogg', 'file-binary'],
  ['mp3', 'file-binary'],
  ['mpc', 'file-binary'],
  ['msv', 'file-binary'],
  ['oga', 'file-binary'],
  ['ogg', 'file-binary'],
  ['opus', 'file-binary'],
  ['ra', 'file-binary'],
  ['raw', 'file-binary'],
  ['tta', 'file-binary'],
  ['vox', 'file-binary'],
  ['wav', 'file-binary'],
  ['wma', 'file-binary'],
  ['a', 'file-binary'],
  ['bin', 'file-binary'],
  ['cmo', 'file-binary'],
  ['cmx', 'file-binary'],
  ['cma', 'file-binary'],
  ['cmxa', 'file-binary'],
  ['cmi', 'file-binary'],
  ['dll', 'file-binary'],
  ['hl', 'file-binary'],
  ['ilk', 'file-binary'],
  ['lib', 'file-binary'],
  ['n', 'file-binary'],
  ['ndll', 'file-binary'],
  ['o', 'file-binary'],
  ['obj', 'file-binary'],
  ['pyc', 'file-binary'],
  ['pyd', 'file-binary'],
  ['pyo', 'file-binary'],
  ['pdb', 'file-binary'],
  ['scpt', 'file-binary'],
  ['scptd', 'file-binary'],
  ['so', 'file-binary'],
  ['c', 'file-code'],
  ['cc', 'file-code'],
  ['class', 'file-code'],
  ['clj', 'file-code'],
  ['cpp', 'file-code'],
  ['cs', 'file-code'],
  ['css', 'file-code'],
  ['cxx', 'file-code'],
  ['el', 'file-code'],
  ['go', 'file-code'],
  ['h', 'file-code'],
  ['html', 'file-code'],
  ['java', 'file-code'],
  ['js', 'file-code'],
  ['json', 'file-code'],
  ['jsx', 'file-code'],
  ['lua', 'file-code'],
  ['m', 'file-code'],
  ['m4', 'file-code'],
  ['pl', 'file-code'],
  ['po', 'file-code'],
  ['py', 'file-code'],
  ['rb', 'file-code'],
  ['sass', 'file-code'],
  ['scss', 'file-code'],
  ['sh', 'file-code'],
  ['swift', 'file-code'],
  ['ts', 'file-code'],
  ['vb', 'file-code'],
  ['vcxproj', 'file-code'],
  ['vue', 'file-code'],
  ['xcodeproj', 'file-code'],
  ['xml', 'file-code'],
  ['jpeg', 'file-media'],
  ['jpg', 'file-media'],
  ['gif', 'file-media'],
  ['png', 'file-media'],
  ['bmp', 'file-media'],
  ['tiff', 'file-media'],
  ['ico', 'file-media'],
  ['app', 'package'],
  ['apk', 'package'],
  ['crx', 'package'],
  ['exe', 'package'],
  ['xpi', 'package'],
  ['pdf', 'file-pdf'],
  ['3g2', 'file-binary'],
  ['3gp', 'file-binary'],
  ['asf', 'file-binary'],
  ['amv', 'file-binary'],
  ['avi', 'file-binary'],
  ['divx', 'file-binary'],
  ['qt', 'file-binary'],
  ['f4a', 'file-binary'],
  ['f4b', 'file-binary'],
  ['f4p', 'file-binary'],
  ['f4v', 'file-binary'],
  ['flv', 'file-binary'],
  ['m2v', 'file-binary'],
  ['m4v', 'file-binary'],
  ['mkv', 'file-binary'],
  ['mk3d', 'file-binary'],
  ['mov', 'file-binary'],
  ['mp2', 'file-binary'],
  ['mp4', 'file-binary'],
  ['mpe', 'file-binary'],
  ['mpeg', 'file-binary'],
  ['mpeg2', 'file-binary'],
  ['mpg', 'file-binary'],
  ['mpv', 'file-binary'],
  ['nsv', 'file-binary'],
  ['ogv', 'file-binary'],
  ['rm', 'file-binary'],
  ['rmvb', 'file-binary'],
  ['svi', 'file-binary'],
  ['vob', 'file-binary'],
  ['webm', 'file-binary'],
  ['wmv', 'file-binary'],
  ['zip', 'file-zip'],
  ['rar', 'file-zip'],
  ['7z', 'file-zip'],
  ['tar', 'file-zip'],
  ['gz', 'file-zip'],
  ['bzip2', 'file-zip'],
  ['xz', 'file-zip'],
  ['bz2', 'file-zip']
])

/**
 * @param {string} filepath - file url
 * @returns {string} icon url
 */
export function getFileIcon (filepath) {
  const ext = (/\.([^.]+)$/.exec(filepath) || ['', filepath])[1]
  return extData.get(ext) || 'file'
}
