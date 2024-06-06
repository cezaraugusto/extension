import fs from 'fs'
import path from 'path'
import {exec} from 'child_process'
import messages from '../../helpers/messages'

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})

export default function convertExtensionToSafari(extensionPath: string) {
  const xcrunCommand: string = 'xcrun safari-web-extension-converter'
  const safariExtensionPath = path.join(extensionPath, 'Safari')

  // Convert the extension to a Safari Web Extension
  const manifest = JSON.parse(
    fs.readFileSync(path.join(extensionPath, 'manifest.json'), 'utf8')
  )
  const productName = manifest.name
  const organizationIdentifier = 'org.extension.js'
  const language = 'swift'
  const type = 'safari-web-extension'

  const conversionCommand =
    `${xcrunCommand} "${extensionPath}"` +
    ` --project-location "${safariExtensionPath}"` +
    ` --app-name "${productName}"` +
    ` --organization-identifier "${organizationIdentifier}"` +
    ` --language "${language}"` +
    ` --type "${type}"` +
    ` --no-open`

  exec(
    conversionCommand,
    (conversionError, conversionStdout, conversionStderr) => {
      if (conversionError) {
        console.error('conversion failed')
        process.exit(1)
      }

      console.log(`Extension converted successfully.`)
    }
  )
}
