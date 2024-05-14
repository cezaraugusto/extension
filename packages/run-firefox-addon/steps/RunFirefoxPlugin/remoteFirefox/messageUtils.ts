import {bgWhite, red, bold} from '@colors/colors/safe'

export function parseMessage(data: Buffer): {
  remainingData: Buffer
  parsedMessage?: any
  error?: Error
  fatal?: boolean
} {
  const dataString = data.toString()
  const separatorIndex = dataString.indexOf(':')

  if (separatorIndex < 1) {
    return {remainingData: data}
  }

  const messageLength = parseInt(dataString.substring(0, separatorIndex), 10)

  if (isNaN(messageLength)) {
    return {
      remainingData: data,
      error: new Error(
        `${bgWhite(red(bold(` firefox-browser `)))} ${red(`✖︎✖︎✖︎`)} Error parsing message length.`
      ),
      fatal: true
    }
  }

  if (data.length - (separatorIndex + 1) < messageLength) {
    return {remainingData: data}
  }

  const messageContent = data.slice(
    separatorIndex + 1,
    separatorIndex + 1 + messageLength
  )
  const remainingData = data.slice(separatorIndex + 1 + messageLength)

  try {
    const parsedMessage = JSON.parse(messageContent.toString())
    return {remainingData, parsedMessage}
  } catch (error: any) {
    return {remainingData, error, fatal: false}
  }
}

export function requestErrorToMessage(err: any) {
  if (err instanceof Error) {
    return String(err)
  }
  return `${err.error}: ${err.message}`
}

export function isErrorWithCode(codeWanted: any, error: any) {
  if (Array.isArray(codeWanted) && codeWanted.indexOf(error.code) !== -1) {
    return true
  } else if (error.code === codeWanted) {
    return true
  }

  return false
}
