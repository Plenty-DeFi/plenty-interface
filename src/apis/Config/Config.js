import axios from 'axios';
import CONFIG from '../../config/config';

// List of tokens to be filtered out while creating the local config from the main config in API.
// Should be updated if any token needs to be added to PLENTY Bridges.
const TOKEN_FILTER = {
  RINKEBY: ['USDC', 'MATIC'],
  ETHEREUM: ['WBTC','WETH','BUSD','USDC','USDT','MATIC','LINK','DAI'],
  MUMBAI: ['WMATIC'],
};

export const loadConfiguration = async () => {
  try {
    const networkSelected = CONFIG.NETWORK;
    const availableChainsObject = CONFIG.BRIDGES_INDEXER_LINKS[networkSelected];
    const availableChainsArray = Object.keys(availableChainsObject).map((chain) => ({name: chain, url: availableChainsObject[chain]}));
    const finalConfig = {};
    const results = await Promise.allSettled(availableChainsArray.map((chain) => axios.get(chain.url)));
    results.forEach((result, index) => {
      if(result.status === 'fulfilled') {
        const data = result.value.data;
        finalConfig[availableChainsArray[index].name] = {};
        const chainObject = finalConfig[availableChainsArray[index].name];
        chainObject.NETWORK = data.ethereumNetwork;
        chainObject.NETWORK_ID = data.ethereumNetworkId;
        chainObject.WRAP_CONTRACT_ADDRESS = data.ethereumWrapContract;
        chainObject.WRAP_SIGNATURE_REQ = data.wrapRequiredSignatures;
        chainObject.UNWRAP_SIGNATURE_REQ = data.unwrapRequiredSignatures;
        chainObject.FEES = {};
        chainObject.FEES.WRAP_FEES = data.fees.erc20WrappingFees;
        chainObject.FEES.UNWRAP_FEES = data.fees.erc20UnwrappingFees;
        chainObject.TEZOS = {};
        chainObject.TEZOS.NETWORK = data.tezosNetwork;
        chainObject.TEZOS.MINTER_CONTRACT = data.tezosMinterContract;
        chainObject.TEZOS.QOURUM_CONTRACT = data.tezosQuorumContract;
        chainObject.TOKENS = {};
        chainObject.TEZOS.WRAPPED_TOKENS = {};
        const tokens = chainObject.TOKENS;
        const tezosTokens = chainObject.TEZOS.WRAPPED_TOKENS;

        data.tokens.forEach((token) => {
          if(token.type === 'ERC20' && TOKEN_FILTER[availableChainsArray[index].name].includes(token.ethereumSymbol)) {
            tokens[token.ethereumSymbol] = {};
            const tokenName = tokens[token.ethereumSymbol];
            tokenName.TYPE = token.type;
            tokenName.SYMBOL = token.ethereumSymbol;
            tokenName.CONTRACT_ADDRESS = token.ethereumContractAddress;
            tokenName.DECIMALS = token.decimals;
            tokenName.TEZOS_WRAPPING_CONTRACT = token.tezosWrappingContract;
            tokenName.WRAPPED_TOKEN = {};
            tokenName.WRAPPED_TOKEN.NAME = token.tezosSymbol;
            tokenName.WRAPPED_TOKEN.TOKEN_ID = token.tezosTokenId;
            tokenName.WRAPPED_TOKEN.THUMB_URI = token.thumbnailUri;
            tokenName.WRAPPED_TOKEN.CONTRACT_ADDRESS = token.tezosWrappingContract;
            // Create list of tezos ref tokens and their corresponding unwrapped tokens 
            tezosTokens[token.tezosSymbol] = {};
            const tezosTokenName = tezosTokens[token.tezosSymbol];
            tezosTokenName.SYMBOL = token.tezosSymbol;
            tezosTokenName.TOKEN_ID = token.tezosTokenId;
            tezosTokenName.CONTRACT_ADDRESS = token.tezosWrappingContract;
            tezosTokenName.UNWRAPPED_TOKEN = {};
            tezosTokenName.UNWRAPPED_TOKEN.NAME = token.ethereumSymbol;
            tezosTokenName.UNWRAPPED_TOKEN.CONTRACT = token.ethereumContractAddress;
            tezosTokenName.UNWRAPPED_TOKEN.DECIMALS = token.decimals;
          }
        });
      }
    });
    return {
      success: true,
      data: finalConfig
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};