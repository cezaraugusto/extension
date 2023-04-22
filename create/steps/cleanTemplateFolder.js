//  ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗
// ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝
// ██║     ██████╔╝█████╗  ███████║   ██║   █████╗
// ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝
// ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗
//  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

const fs = require('fs-extra')
const {log} = require('log-md')

const getTemplatePath = require('./getTemplatePath')

module.exports = async function cleanTemplateFolder(
  template,
  isExternalTemplate
) {
  // We don't want to delete local templates
  if (!isExternalTemplate) {
    return
  }

  log('🧹 - Cleaning up everything...')

  try {
    await fs.remove(getTemplatePath(template))
  } catch (error) {
    log(`😕❓ Removing \`${template}\` failed: ${error}`)
  }
}
