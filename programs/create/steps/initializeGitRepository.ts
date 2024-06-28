//  ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗
// ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝
// ██║     ██████╔╝█████╗  ███████║   ██║   █████╗
// ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝
// ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗
//  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

import {spawn} from 'cross-spawn'
import {bold, yellow, red} from '@colors/colors/safe'

export default async function initializeGitRepository(
  projectPath: string,
  projectName: string
) {
  const gitCommand = 'git'
  const gitArgs = ['init']

  console.log(`🌲 - Initializing git repository for ${bold(projectName)}...`)

  try {
    const originalDirectory = process.cwd()

    // Change to the project directory
    process.chdir(projectPath)

    const stdio =
      process.env.EXTENSION_ENV === 'development' ? 'inherit' : 'ignore'
    const child = spawn(gitCommand, gitArgs, {stdio})

    await new Promise<void>((resolve, reject) => {
      child.on('close', (code) => {
        // Change back to the original directory
        process.chdir(originalDirectory)

        if (code !== 0) {
          reject(
            new Error(
              `Command ${gitCommand} ${gitArgs.join(' ')} failed with exit code ${code}`
            )
          )
        } else {
          resolve()
        }
      })

      child.on('error', (error) => {
        // Change back to the original directory
        process.chdir(originalDirectory)

        console.error(
          `🧩 ${bold(`Extension.js`)} ${red(
            `✖︎✖︎✖︎`
          )} Child process error: Can't initialize ${yellow('git')} for ${bold(projectName)}. ${error.message}`
        )
        reject(error)
      })
    })
  } catch (error: any) {
    console.error(
      `🧩 ${bold(`Extension.js`)} ${red(
        `✖︎✖︎✖︎`
      )} Can't initialize ${yellow('git')} for ${bold(projectName)}. ${error.message || error.toString()}`
    )

    process.exit(1)
  }
}
