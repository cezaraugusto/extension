import WebSocket from 'ws'
import {type Compiler} from 'webpack'
import messages from '../../../helpers/messages'
import {type StatsPreset} from '../../../types'
import {type ManifestBase} from '../../../manifest-types'

interface Data {
  id: string
  manifest: ManifestBase
  management: chrome.management.ExtensionInfo
}

interface Message {
  data?: Data | undefined
  status: string
}

export default function (
  compiler: Compiler,
  statsConfig: StatsPreset | undefined,
  port?: number
) {
  const webSocketServer = new WebSocket.Server({
    host: 'localhost',
    port
  })

  webSocketServer.on('connection', (ws) => {
    ws.send(JSON.stringify({status: 'serverReady'}))

    ws.on('error', (error) => {
      messages.webSocketError(error)
      webSocketServer.close()
    })

    ws.on('close', (code, reason) => {
      webSocketServer.close()
    })

    // We're only ready when the extension says so
    ws.on('message', (msg) => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const message: Message = JSON.parse(msg.toString())

      if (message.status === 'clientReady') {
        if (statsConfig === true) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          messages.extensionData(compiler, message, false)
        }

        messages.stdoutData(compiler, message)
      }
    })
  })

  return webSocketServer
}
