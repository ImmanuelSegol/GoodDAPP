// @flow
import Web3 from 'web3'
import SoftwareWalletProvider from './SoftwareWalletProvider'
import Config from '../../config/config'
import EthereumJsWalletProvider from './EthereumJsWalletProvider'

export type WalletConfig = {
  network_id: number,
  httpWeb3provider: string,
  websocketWeb3Provider: string,
  web3Transport: string
}
export default class WalletFactory {
  static create(walletType: string): Promise<Web3> {
    let provider
    switch (walletType) {
      case 'software':
        provider = new EthereumJsWalletProvider(Config.ethereum[Config.networkId])
        break
      case 'other':
      default:
        provider = SoftwareWalletProvider = new SoftwareWalletProvider(Config.ethereum[Config.networkId])
        break
    }
    return provider.ready
  }
}
