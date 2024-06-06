import path from 'path'
import fs from 'fs'

export default function rewriteFirstRunVariable() {
  const filePath = path.resolve(
    __dirname,
    './extensions/manager-extension/initialTab.js'
  )

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err.message}`)
      return
    }
  })
}
