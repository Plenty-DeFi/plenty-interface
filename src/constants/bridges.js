// Bridges
/* import avaxRed from '../assets/images/bridge/avax_red.svg';
import avax from '../assets/images/bridge/avax.svg'; */
import ethereum from '../assets/images/bridge/eth.svg';
import { ReactComponent as ethereumButtonIcon } from '../assets/images/bridge/ethereum_btn_icon.svg';
import tezos from '../assets/images/bridge/ic_tezos.svg';
import { ReactComponent as polygonButtonIcon } from '../assets/images/bridge/tokens/matic_icon.svg';

// Tokens
import dai_normal from '../assets/images/bridge/tokens/dai_icon.svg';
import link_normal from '../assets/images/bridge/tokens/link_icon.svg';
import matic_normal from '../assets/images/bridge/tokens/matic_icon.svg';
import usdt_normal from '../assets/images/bridge/tokens/usdt_icon.svg';
import usdc_normal from '../assets/images/bridge/tokens/usdc_icon.svg';
import busd_normal from '../assets/images/bridge/tokens/busd_icon.svg';
import weth_normal from '../assets/images/bridge/tokens/weth_icon.svg';
import wbtc_normal from '../assets/images/bridge/tokens/wbtc_icon.svg';
import fallbackIcon from '../assets/images/bridge/tokens/fallback_icon.svg';

export const CHANGE_NETWORK_PROMPT_DELAY = 3000;

export const DEFAULT_ETHEREUM_TOKEN = 'USDC';
export const DEFAULT_TEZOS_TOKEN = 'USDC.e';

export const bridgesList = [
  /* {
    name: 'ETHEREUM',
    image: ethereum,
    buttonImage: ethereumButtonIcon,
    bigIcon: ethereum,
  }, */
  {
    name: 'RINKEBY',
    image: ethereum,
    buttonImage: ethereumButtonIcon,
    bigIcon: ethereum,
  },
  {
    name: 'TEZOS',
    image: tezos,
    buttonImage: tezos,
    bigIcon: tezos,
  },
  {
    name: 'MUMBAI',
    image: matic_normal,
    buttonImage: polygonButtonIcon,
    bigIcon: matic_normal,
  },
];

export const tokensList = {
  ETHEREUM: [
    {
      name: 'DAI',
      image: dai_normal,
      tinyIcon: dai_normal,
      bigIcon: dai_normal,
    },
    {
      name: 'LINK',
      image: link_normal,
      tinyIcon: link_normal,
      bigIcon: link_normal,
    },
    {
      name: 'MATIC',
      image: matic_normal,
      tinyIcon: matic_normal,
      bigIcon: matic_normal,
    },
    {
      name: 'USDT',
      image: usdt_normal,
      tinyIcon: usdt_normal,
      bigIcon: usdt_normal,
    },
    {
      name: 'USDC',
      image: usdc_normal,
      tinyIcon: usdc_normal,
      bigIcon: usdc_normal,
    },
    {
      name: 'BUSD',
      image: busd_normal,
      tinyIcon: busd_normal,
      bigIcon: busd_normal,
    },
    {
      name: 'WETH',
      image: weth_normal,
      tinyIcon: weth_normal,
      bigIcon: weth_normal,
    },
    {
      name: 'WBTC',
      image: wbtc_normal,
      tinyIcon: wbtc_normal,
      bigIcon: wbtc_normal,
    },
  ],
  TEZOS: [
    {
      name: 'DAI.e',
      image: dai_normal,
      tinyIcon: dai_normal,
      bigIcon: dai_normal,
    },
    {
      name: 'LINK.e',
      image: link_normal,
      tinyIcon: link_normal,
      bigIcon: link_normal,
    },
    {
      name: 'MATIC.e',
      image: matic_normal,
      tinyIcon: matic_normal,
      bigIcon: matic_normal,
    },
    {
      name: 'USDT.e',
      image: usdt_normal,
      tinyIcon: usdt_normal,
      bigIcon: usdt_normal,
    },
    {
      name: 'USDC.e',
      image: usdc_normal,
      tinyIcon: usdc_normal,
      bigIcon: usdc_normal,
    },
    {
      name: 'BUSD.e',
      image: busd_normal,
      tinyIcon: busd_normal,
      bigIcon: busd_normal,
    },
    {
      name: 'WETH.e',
      image: weth_normal,
      tinyIcon: weth_normal,
      bigIcon: weth_normal,
    },
    {
      name: 'WBTC.e',
      image: wbtc_normal,
      tinyIcon: wbtc_normal,
      bigIcon: wbtc_normal,
    },
  ],
};

export const allTokens = {
  DAI: dai_normal,
  LINK: link_normal,
  MATIC: matic_normal,
  USDT: usdt_normal,
  USDC: usdc_normal,
  BUSD: busd_normal,
  WETH: weth_normal,
  WBTC: wbtc_normal,
  'DAI.e': dai_normal,
  'LINK.e': link_normal,
  'MATIC.e': matic_normal,
  'USDT.e': usdt_normal,
  'USDC.e': usdc_normal,
  'BUSD.e': busd_normal,
  'WETH.e': weth_normal,
  'WBTC.e': wbtc_normal,
  'WETH.p': weth_normal,
  'WMATIC.p': matic_normal,
  WMATIC: matic_normal,
  fallback: fallbackIcon,
};
