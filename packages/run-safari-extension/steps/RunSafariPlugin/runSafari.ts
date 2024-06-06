import path from 'path'
import fs from 'fs'
import {exec} from 'child_process'
import {bold, cyan, blue} from '@colors/colors/safe'

process.on('SIGINT', () => {
  process.exit()
})

process.on('SIGTERM', () => {
  process.exit()
})

function enableSafariDeveloperMode() {
  exec(
    `defaults write com.apple.Safari IncludeDevelopMenu -bool true`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Failed to enable Safari Developer Mode: ${stderr}`)
        process.exit(1)
      }
      console.log(
        `${bold(cyan(' safari-browser '))} ${blue('✔︎✔︎✔︎')} Safari Developer Mode enabled.`
      )
    }
  )
}

function allowUnsignedExtensions() {
  exec(
    `defaults write com.apple.Safari ExtensionsEnabled -bool true && \
         defaults write com.apple.Safari ExtensionUpdatesAutomatically -bool false && \
         defaults write com.apple.Safari com.apple.Safari.ContentPageGroupIdentifier.WebKit2AllowsLocalStorage -bool true && \
         defaults write com.apple.Safari AllowUnsignedExtensions -bool true`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Failed to allow unsigned extensions: ${stderr}`)
        process.exit(1)
      }
      console.log(
        `${bold(cyan(' safari-browser '))} ${blue('✔︎✔︎✔︎')} Unsigned extensions allowed.`
      )
    }
  )
}

export default function runXcodeSchemesInBackground(
  projectPath: string,
  preBuiltExtensions: string[]
) {
  enableSafariDeveloperMode()
  allowUnsignedExtensions()

  const xcodebuildCommand = `xcodebuild -project "${projectPath}/Safari.xcodeproj" -scheme "Safari" -destination 'platform=macOS'`

  exec(xcodebuildCommand, (xcodeError, xcodeStdout, xcodeStderr) => {
    if (xcodeError) {
      console.error(
        `Failed to run Xcode build for scheme Safari: ${xcodeStderr}`
      )
      process.exit(1)
    }
    console.log(
      `${bold(cyan(' safari-browser '))} ${blue('✔︎✔︎✔︎')} Safari extension scheme run successfully.`
    )
    addPreBuiltExtensions(preBuiltExtensions)
  })

  exec('open -a Safari', (safariError, safariStdout, safariStderr) => {
    if (safariError) {
      console.error(`Failed to open Safari: ${safariStderr}`)
      process.exit(1)
    }
    console.log(
      `${bold(cyan(' safari-browser '))} ${blue('✔︎✔︎✔︎')} Safari opened successfully.`
    )
  })
}

function addPreBuiltExtensions(preBuiltExtensions: string[]) {
  preBuiltExtensions.forEach((extensionPath) => {
    const absolutePath = path.resolve(extensionPath)
    const script = `
      tell application "Safari"
        activate
        delay 1
        tell application "System Events"
          click menu item "Preferences…" of menu "Safari" of menu bar 1 of process "Safari"
          delay 1
          click button "Extensions" of toolbar 1 of window 1 of process "Safari"
          delay 1
          click button "More Extensions…" of group 1 of toolbar 1 of window 1 of process "Safari"
          delay 1
          tell application "Finder" to open POSIX file "${absolutePath}"
          delay 1
          click button "Trust" of window 1 of process "Safari"
        end tell
      end tell
    `

    const osaScriptCommand = `osascript -e '${script}'`

    exec(osaScriptCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(
          `Failed to add pre-built extension ${absolutePath}: ${stderr}`
        )
      } else {
        console.log(`Pre-built extension ${absolutePath} added successfully.`)
      }
    })
  })
}
