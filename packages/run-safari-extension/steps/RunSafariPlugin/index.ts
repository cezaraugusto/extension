import fs from 'fs'
import path from 'path'
import {exec} from 'child_process'
import {type Compiler} from 'webpack'
import {type RunSafariExtensionInterface} from '../../types'

import messages from '../../helpers/messages'
import convertExtensionToSafari from './convertExtensionToSafari'
import runSafari from './runSafari'

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})

export default class SafariExtensionLauncherPlugin {
  private readonly options: RunSafariExtensionInterface

  constructor(options: RunSafariExtensionInterface) {
    this.options = options
  }

  private launchSafari() {
    const xcrunCommand: string = 'xcrun safari-web-extension-converter'
    const isMacOS: boolean = process.platform === 'darwin'

    // Return early if system is not macOS.
    if (!isMacOS) {
      console.error(messages.macOsOnly())
      process.exit()
    }

    // Check if xcrun safari-web-extension-converter is available.
    exec(xcrunCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(messages.converterNotFound())
        process.exit(1)
      }

      const extensionPath =
        this.options.extensionPath ||
        path.dirname(this.options.manifestPath || '')
      const safariExtensionFolder = path.join(extensionPath, 'Safari')
      const isConvertedSafariExtension = fs.existsSync(safariExtensionFolder)

      if (isConvertedSafariExtension) {
        // If available, run xcodebuild to build and run the extension in Safari.
        runSafari(safariExtensionFolder, [])
      } else {
        // Convert the extension to a Safari Web Extension.
        convertExtensionToSafari(extensionPath)

        // Run the converted extension in Safari.
        runSafari(safariExtensionFolder, [])
      }
    })
  }

  apply(compiler: Compiler) {
    let safariDidLaunch = false
    compiler.hooks.afterEmit.tapAsync(
      'RunSafariExtensionPlugin (SafariExtensionLauncher)',
      (compilation, done) => {
        if (compilation.errors.length > 0) {
          done()
          return
        }

        if (safariDidLaunch) {
          done()
          return
        }

        this.launchSafari()

        safariDidLaunch = true
        done()
      }
    )
  }
}
