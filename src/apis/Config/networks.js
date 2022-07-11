export const networks = {
  ETHEREUM: {
    chainId: `0x${Number(1).toString(16)}`,
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://api.mycryptoapi.com/eth', 'https://cloudflare-eth.com'],
    blockExplorerUrls: ['https://etherscan.io/'],
  },
  RINKEBY: {
    chainId: `0x${Number(4).toString(16)}`,
    chainName: 'Rinkeby',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    blockExplorerUrls: ['https://rinkeby.etherscan.io'],
  },
  MUMBAI: {
    chainId: `0x${Number(80001).toString(16)}`,
    chainName: 'Mumbai',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-mumbai.maticvigil.com/v1/f4d21a1974e4ed58212a0047ebda2058d80e5ec1'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
};
