import Web3 from 'web3';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import CoinbaseWalletSDK from '@coinbase/wallet-sdk';

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      supportedChainIds: [1, 4, 100, 80001],
      rpc: {
        1: 'https://api.mycryptoapi.com/eth',
        4: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        80001: 'https://rpc-mumbai.maticvigil.com/v1/f4d21a1974e4ed58212a0047ebda2058d80e5ec1',
      },
    },
  },
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: 'Plenty Bridge',
      rpc: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      chainId: 4,
      darkMode: false,
    },
  },
};

let web3Modal = new Web3Modal({
  network: 'rinkeby',
  cacheProvider: true,
  providerOptions,
  theme: localStorage.getItem('theme'),
});

export const connectWallet = async (setMetamaskAddress, theme) => {
  try {
    if (theme === 'light') {
      web3Modal = new Web3Modal({
        network: 'rinkeby',
        cacheProvider: true,
        providerOptions,
        theme: 'light',
      });
    } else {
      web3Modal = new Web3Modal({
        network: 'rinkeby',
        cacheProvider: true,
        providerOptions,
        theme: 'dark',
      });
    }
    const provider = await web3Modal.connect();
    const web3 = new Web3(provider);
    const address = await web3.eth.getAccounts();
    if (setMetamaskAddress) {
      setMetamaskAddress(address[0]);
      localStorage.setItem('isWalletConnected', true);
    }
    return {
      address: address[0],
      web3,
      provider,
      success: true,
    };
  } catch (e) {
    console.log(e);
    if (setMetamaskAddress) {
      localStorage.setItem('isWalletConnected', false);
      setMetamaskAddress(null);
    }
    return {
      success: false,
    };
  }
};

export const disconnectWallet = async () => {
  web3Modal.clearCachedProvider();
};
