import path from 'path'
import {green, blue, white, yellow, bold, underline} from '@colors/colors/safe'
import AdmZip from 'adm-zip'
import slugify from 'slugify'
import {BuildOptions} from '../extensionBuild'

function sanitizeString(input: string): string {
  return slugify(input, {
    // replace spaces with dashes
    replacement: '-',
    // remove non-alphanumeric characters except spaces
    remove: /[^a-zA-Z0-9 ]/g,
    lower: true
  })
}

function getExtensionExtension(vendor: string): string {
  switch (vendor) {
    case 'opera':
      return 'crx'
    case 'firefox':
      return 'xpi'
    default:
      return 'zip'
  }
}

function getPackageName(manifest: any, options: BuildOptions): string {
  const sanitizedStr = sanitizeString(options.zipFilename || manifest.name)
  if (options.zipFilename) return sanitizedStr

  return `${sanitizedStr}-${manifest.version}`
}

function capitalizeBrowserName(browser: string): string {
  return browser.charAt(0).toUpperCase() + browser.slice(1)
}

export default function generateZip(
  projectDir: string,
  {browser = 'chrome', ...options}: BuildOptions
) {
  try {
    const outputDir = path.join(projectDir, 'dist', browser)
    // We collect data from the projectDir if the user wants to zip the source files.
    const dataDir = options.zipSource ? projectDir : outputDir
    const manifest = require(path.join(dataDir, 'manifest.json'))
    const name = getPackageName(manifest, options)
    const ext = getExtensionExtension(browser)
    const distZipPath = path.join(outputDir, `${name}.${ext}`)
    const sourceZipPath = path.join(outputDir, `${name}-source.${ext}`)
    const capitalizedBrowser = capitalizeBrowserName(browser)

    if (options.zipSource) {
      console.log(
        `\nPackaging extension source files to ${white(underline(sourceZipPath))}. This might take a while...`
      )
      const zip = new AdmZip()
      zip.addLocalFolder(projectDir)
      zip.writeZip(sourceZipPath)
    }

    if (options.zip) {
      console.log(
        `\nPackaging extension distribution files to ${white(underline(distZipPath))}...`
      )

      const zip = new AdmZip()
      zip.addLocalFolder(outputDir)
      zip.writeZip(distZipPath)
    }

    if (options.zip && options.zipSource) {
      console.log(
        `\n${bold('📦 Package name:')} ${yellow(`${name}`)}, ${bold('Target Browser:')} ${`${capitalizedBrowser}`}` +
          `\n   ${bold('└─')} ${underline(`${sourceZipPath}`)} (source)` +
          `\n   ${bold('└─')} ${underline(`${distZipPath}`)} (distribution)`
      )
    } else if (options.zip) {
      console.log(
        `\n${bold('📦 Package name:')} ${yellow(`${name}.${ext}`)}, ${bold('Target Browser:')} ${`${capitalizedBrowser}`}` +
          `\n   ${bold('└─')} ${underline(`${distZipPath}`)} (distribution)`
      )
    } else if (options.zipSource) {
      console.log(
        `\n${bold('📦 Package name:')} ${yellow(`${name}-source.${ext}`)}, ${bold('Target Browser:')} ${`${capitalizedBrowser}`}` +
          `\n   ${bold('└─')} ${underline(`${sourceZipPath}`)} (source)`
      )
    }
  } catch (error) {
    console.error(
      `🧩 ${bold('Extension.js')} ${blue('✖︎✖︎✖︎')} Failed to compress extension package: ${error}`
    )
    throw error
  }
}
