// @flow
import Web3 from 'web3'
import bip39 from 'bip39'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import type { WalletConfig } from './WalletFactory'
import type { HttpProvider } from 'web3-providers-http'
import type { WebSocketProvider } from 'web3-providers-ws'
import MultipleAddressWallet from './MultipleAddressWallet'

const log = logger.child({ from: 'EthereumJsWalletProvider' })

class EthereumJsWalletProvider {
  ready: Promise<Web3>
  GD_USER_PKEY: string = 'GD_USER_PKEY'
  GD_USER_MNEMONIC: string = 'GD_USER_MNEMONIC'
  conf: WalletConfig

  constructor(conf: WalletConfig) {
    this.conf = conf
    this.ready = this.initHD()
  }

  async initHD(): Promise<Web3> {
    let mnemonic: ?string = localStorage.getItem(this.GD_USER_MNEMONIC)
    if (!mnemonic) {
      mnemonic = this.generateMnemonic()
      localStorage.setItem(this.GD_USER_MNEMONIC, mnemonic)
      mnemonic = localStorage.getItem(this.GD_USER_MNEMONIC)
      log.info('item set in localStorage ', { mnemonic })
    } else {
      log.info('mnemonic found, creating account from mnemonic:', { mnemonic })
    }
    let wallet = new MultipleAddressWallet(mnemonic, 10)
    return wallet
  }

  generateMnemonic(): string {
    let mnemonic = bip39.generateMnemonic()
    return mnemonic
  }

  getWeb3TransportProvider(): HttpProvider | WebSocketProvider {
    let provider
    let web3Provider
    let transport = this.conf.web3Transport
    switch (transport) {
      case 'WebSocket':
        provider = this.conf.websocketWeb3Provider
        web3Provider = new Web3.providers.WebsocketProvider(provider)
        break

      case 'HttpProvider':
        const infuraKey = this.conf.httpWeb3provider.indexOf('infura') !== -1 ? Config.infuraKey : ''
        provider = this.conf.httpWeb3provider + infuraKey
        web3Provider = new Web3.providers.HttpProvider(provider)
        break

      default:
        provider = this.conf.httpWeb3provider + Config.infuraKey
        web3Provider = new Web3.providers.HttpProvider(provider)
        break
    }

    return web3Provider
  }
}

export default EthereumJsWalletProvider
