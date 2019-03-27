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
import type { WebSocketProvider } from 'web3-providers-ws'

const log = logger.child({ from: 'MultipleAddressWallet' })

class MultipleAddressWallet {
  ready: Promise<Web3>
  wallet: Object
  mnemonic: string
  addresses: Array<string>
  numOfAccounts: int = 10

  constructor(mnemonic, numOfAccounts) {
    let root = HDKey.fromMasterSeed(this.mnemonic)
    var path = "m/44'/60'/0'/0/1"
    let addrNode = root.derive(path)
    let privateKeyBuffer = EthUtil.toBuffer(addrNode._privateKey)
    this.wallet = Wallet.fromPrivateKey(privateKeyBuffer) // point to the main wallet
    this.mnemonic = mnemonic
    this.numOfAccounts = numOfAccounts
    this.initAccounts()
  }
  initAccounts() {
    for (let i = 0; i < this.numOfAccounts; i++) {
      let root = HDKey.fromMasterSeed(this.mnemonic)
      var path = "m/44'/60'/0'/0/" + (i + 1)
      let addrNode = root.derive(path)
      let privateKeyBuffer = EthUtil.toBuffer(addrNode._privateKey)
      let wallet = Wallet.fromPrivateKey(privateKeyBuffer)
      let address = wallet.getAddressString()
      this.addresses.push(address)
    }
  }
}

export default MultipleAddressWallet
