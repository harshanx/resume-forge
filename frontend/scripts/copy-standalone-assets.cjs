const fs = require('node:fs')
const path = require('node:path')

const root = process.cwd()
const standaloneDir = path.join(root, '.next', 'standalone')
const assets = [
  [path.join(root, '.next', 'static'), path.join(standaloneDir, '.next', 'static')],
  [path.join(root, 'public'), path.join(standaloneDir, 'public')],
]

for (const [source, destination] of assets) {
  if (fs.existsSync(source)) {
    fs.cpSync(source, destination, { recursive: true, force: true })
  }
}

console.log('Copied static and public assets into the standalone app.')
