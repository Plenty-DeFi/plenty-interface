import ctez from '../assets/images/ctez.png';
import xtz from '../assets/images/tez.png';
import ETHtz from '../assets/images/ethtz.png';
import tzBTC from '../assets/images/tzbtc-swap.png';
import uUSD from '../assets/images/uUSD.png';
import kusd from '../assets/images/kusd.png';
import usdce from '../assets/images/usdce.png';
import wbtce from '../assets/images/wbtce.png';
import weth_normal from '../assets/images/bridge/tokens/weth_icon.svg';
import dai_normal from '../assets/images/bridge/tokens/dai_icon.svg';
import usdtz from '../assets/images/usdtz.png';
import busd_normal from '../assets/images/bridge/tokens/busd_icon.svg';
import usdt_normal from '../assets/images/bridge/tokens/usdt_icon.svg';
import eurl from '../assets/images/eurl.png';
import ageure from '../assets/images/ageure.png';
import usdt from '../assets/images/usdt.png'; 

export const stableSwapTokens = [
  {
    name: 'USDt',
    image: usdt,
    new: true,
  },
  {
    name: 'EURL',
    image: eurl,
    new: true,
  },
  {
    name: 'agEUR.e',
    image: ageure,
    new: true,
  },
  {
    name: 'tez',
    image: xtz,
    new: true,
  },
  {
    name: 'WBTC.e',
    image: wbtce,
    new: true,
  },
  {
    name: 'USDC.e',
    image: usdce,
    new: true,
  },
  {
    name: 'DAI.e',
    image: dai_normal,
    new: true,
  },
  {
    name: 'WETH.e',
    image: weth_normal,
    new: true,
  },
  {
    name: 'ETHtz',
    image: ETHtz,
    new: true,
  },
  {
    name: 'USDT.e',
    image: usdt_normal,
    new: true,
  },
  {
    name: 'ctez',
    image: ctez,
    new: false,
    extra: {
      text: 'Get ctez',
      link: 'https://ctez.app',
    },
  },
  {
    name: 'uUSD',
    image: uUSD,
    new: false,
  },
  {
    name: 'kUSD',
    image: kusd,
    new: false,
  },
  {
    name: 'tzBTC',
    image: tzBTC,
    new: false,
  },
  {
    name: 'USDtz',
    image: usdtz,
    new: false,
  },
  {
    name: 'BUSD.e',
    image: busd_normal,
    new: false,
  },
];
