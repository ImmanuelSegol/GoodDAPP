// @flow
import Web3 from 'web3'
import bip39 from 'bip39'
import HDKey from 'hdkey'
import EthUtil from 'ethereumjs-util'
import Wallet from 'ethereumjs-wallet'
import Config from '../../config/config'
import logger from '../logger/pino-logger'
import type { WalletConfig } from './WalletFactory'
import type { HttpProvider } from 'web3-providers-http'
import HDWalletProvider from 'truffle-hdwallet-provider'
import type { WebSocketProvider } from 'web3-providers-ws'

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
  getPKey() {
    return localStorage.getItem(this.GD_USER_PKEY)
  }
  async init(): Promise<Web3> {
    let provider = this.getWeb3TransportProvider()
    log.info('wallet config:', this.conf, provider)

    let web3 = new Web3(provider)
    //let web3 = new Web3(new WebsocketProvider("wss://ropsten.infura.io/ws"))
    let pkey: ?string = localStorage.getItem(this.GD_USER_PKEY)
    let account
    if (!pkey) {
      account = await web3.eth.accounts.create()
      log.info('account Add is:', account.address)
      log.info('Private Key is:', account.privateKey)
      localStorage.setItem(this.GD_USER_PKEY, account.privateKey)
      pkey = localStorage.getItem(this.GD_USER_PKEY)
      log.info('item set in localStorage ', { pkey })
    } else {
      log.info('pkey found, creating account from pkey:', { pkey })
    }
    web3.eth.accounts.wallet.add(pkey)
    web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address

    return web3
  }

  async initHD(): Promise<Web3> {
    let provider = this.getWeb3TransportProvider()
    log.info('wallet config:', this.conf, provider)

    //let web3 = new Web3(new WebsocketProvider("wss://ropsten.infura.io/ws"))
    let mnemonic: ?string = localStorage.getItem(this.GD_USER_MNEMONIC)
    if (!mnemonic) {
      mnemonic = this.generateMnemonic()
      localStorage.setItem(this.GD_USER_MNEMONIC, mnemonic)
      mnemonic = localStorage.getItem(this.GD_USER_MNEMONIC)
      log.info('item set in localStorage ', { mnemonic })
    } else {
      log.info('pkey found, creating account from pkey:', { mnemonic })
    }

    let root = HDKey.fromMasterSeed(mnemonic)

    //we start from addres 1, since from address 0 pubkey all public keys can  be generated
    //and we want privacy
    var path = "m/44'/60'/0'/0/1"
    let addrNode = root.derive(path)
    let privateKeyBuffer = EthUtil.toBuffer(addrNode._privateKey)

    const wallet = Wallet.fromPrivateKey(privateKeyBuffer)

    let publicKey = wallet.getPublicKeyString()
    console.log(publicKey)
    let address = wallet.getAddressString()
    console.log(address)
    let keystoreFilename = wallet.getV3Filename()
    console.log(keystoreFilename)
    let keystore = wallet.toV3('PASSWORD')
    console.log(keystore)

    let web3 = new Web3(provider)
    wallet.addresses.forEach(addr => {
      let currentWallet = web3.eth.accounts.privateKeyToAccount('0x' + wallet.wallets[addr]._privKey.toString('hex'))
      web3.eth.accounts.wallet.add(currentWallet)
    })
    let accounts = wallet.addresses
    web3.eth.defaultAccount = accounts[0]
    wallet.engine.stop()
    return web3
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
