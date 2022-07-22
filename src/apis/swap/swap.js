import { MichelsonMap, TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { CheckIfWalletConnected } from '../wallet/wallet';
import CONFIG from '../../config/config';
import axios from 'axios';
import { packDataBytes, unpackDataBytes } from '@taquito/michel-codec';
import { TezosMessageUtils, TezosParameterFormat } from 'conseiljs';
import {
  type1MapIds,
  type2MapIds,
  type3MapIds,
  type4MapIds,
  type5MapIds,
} from '../../constants/global';
import BigNumber from 'bignumber.js';
import { RPC_NODE } from '../../constants/localStorage';

/**
 * Returns packed key (expr...) which will help to fetch user specific data from bigmap directly using rpc.
 * @param tokenId - Id of map from where you want to fetch data
 * @param address - address of the user for whom you want to fetch the data
 * @param type - FA1.2 OR FA2
 */
const getPackedKey = (tokenId, address, type) => {
  const accountHex = `0x${TezosMessageUtils.writeAddress(address)}`;
  let packedKey = null;
  if (type === 'FA2') {
    packedKey = TezosMessageUtils.encodeBigMapKey(
      // eslint-disable-next-line no-undef
      Buffer.from(
        TezosMessageUtils.writePackedData(
          `(Pair ${accountHex} ${tokenId})`,
          '',
          TezosParameterFormat.Michelson,
        ),
        'hex',
      ),
    );
  } else {
    packedKey = TezosMessageUtils.encodeBigMapKey(
      // eslint-disable-next-line no-undef
      Buffer.from(
        TezosMessageUtils.writePackedData(`${accountHex}`, '', TezosParameterFormat.Michelson),
        'hex',
      ),
    );
  }
  return packedKey;
};
/**
 * Swaps two tokens for which amm exists
 */
export const swapTokens = async (
  tokenIn,
  tokenOut,
  minimumTokenOut,
  recipent,
  tokenInAmount,
  caller,
  transactionSubmitModal,
  setShowConfirmSwap,
  resetAllValues,
  setShowConfirmTransaction,
) => {
  const connectedNetwork = CONFIG.NETWORK;
  // const rpcNode = CONFIG.RPC_NODES[connectedNetwork];
  const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[connectedNetwork];
  try {
    const network = {
      type: CONFIG.WALLET_NETWORK,
    };
    const options = {
      name: CONFIG.NAME,
    };
    const wallet = new BeaconWallet(options);
    const WALLET_RESP = await CheckIfWalletConnected(wallet, network.type);
    if (!WALLET_RESP.success) {
      throw new Error('Wallet connection failed');
    }
    const Tezos = new TezosToolkit(rpcNode);
    Tezos.setRpcProvider(rpcNode);
    Tezos.setWalletProvider(wallet);
    const dexContractAddress = CONFIG.AMM[connectedNetwork][tokenIn].DEX_PAIRS[tokenOut].contract;
    const tokenInId = CONFIG.AMM[connectedNetwork][tokenIn].TOKEN_ID;
    const tokenOutAddress = CONFIG.AMM[connectedNetwork][tokenOut].TOKEN_CONTRACT;
    const tokenOutId = CONFIG.AMM[connectedNetwork][tokenOut].TOKEN_ID;
    const tokenInAddress = CONFIG.AMM[connectedNetwork][tokenIn].TOKEN_CONTRACT;
    const tokenInInstance = await Tezos.contract.at(tokenInAddress);
    const dexContractInstance = await Tezos.contract.at(dexContractAddress);

    // const balanceWithoutDecimal = await getUserBalanceByRpcWithoutDecimal(
    //   tokenIn,
    //   caller,
    // );
    // const balanceWithoutDecimalNumber = new BigNumber(balanceWithoutDecimal.balance);
    // const lpBal = new BigNumber(tokenInAmount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenIn].TOKEN_DECIMAL));

    // if (lpBal > balanceWithoutDecimalNumber) {
    //   tokenInAmount = balanceWithoutDecimalNumber;
    // } else {
    //   tokenInAmount = tokenInAmount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenIn].TOKEN_DECIMAL);
    // }
    // console.log(tokenInAmount);
    // tokenInAmount =
    //   tokenInAmount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenIn].TOKEN_DECIMAL);

    tokenInAmount = tokenInAmount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenIn].TOKEN_DECIMAL);
      const balanceWithoutDecimal = await getUserBalanceByRpcWithoutDecimal([tokenIn], caller);
  
      const balanceWithoutDecimalNumber = new BigNumber(balanceWithoutDecimal.balance);
      const lpBal = new BigNumber(tokenInAmount);
  
      if (lpBal.isGreaterThan(balanceWithoutDecimalNumber) ) {
        tokenInAmount = balanceWithoutDecimalNumber;
      } else {
        tokenInAmount = lpBal;
      }
      // tokenInAmount = parseInt(tokenInAmount);
    minimumTokenOut =
      minimumTokenOut * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenOut].TOKEN_DECIMAL);
    minimumTokenOut = Math.floor(minimumTokenOut);
    let batch = null;
    // Approve call for FA1.2 type token
    if (CONFIG.AMM[connectedNetwork][tokenIn].CALL_TYPE === 'FA1.2') {
      batch = Tezos.wallet
        .batch()
        .withContractCall(tokenInInstance.methods.approve(dexContractAddress, tokenInAmount))
        .withContractCall(
          dexContractInstance.methods.Swap(
            minimumTokenOut,
            recipent,
            tokenOutAddress,
            tokenOutId,
            tokenInAmount,
          ),
        );
    }
    // add_operator for FA2 type token
    else {
      batch = Tezos.wallet
        .batch()
        .withContractCall(
          tokenInInstance.methods.update_operators([
            {
              add_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenInId,
              },
            },
          ]),
        )
        .withContractCall(
          dexContractInstance.methods.Swap(
            minimumTokenOut,
            recipent,
            tokenOutAddress,
            tokenOutId,
            tokenInAmount,
          ),
        )
        .withContractCall(
          tokenInInstance.methods.update_operators([
            {
              remove_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenInId,
              },
            },
          ]),
        );
    }

    const batchOperation = await batch.send();
    setShowConfirmTransaction(false);

    setShowConfirmSwap(false);
    transactionSubmitModal(batchOperation.opHash);
    resetAllValues();

    await batchOperation.confirmation().then(() => batchOperation.opHash);
    return {
      success: true,
      operationId: batchOperation.hash,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error,
    };
  }
};
/**
 * @deprecated
 * Was being used when there was only one middle token
 */
export const swapTokenUsingRoute = async (
  tokenIn,
  tokenOut,
  caller,
  amount,
  minimum_Out,
  minimum_Out_Plenty,
  transactionSubmitModal,
  middleToken,
) => {
  const connectedNetwork = CONFIG.NETWORK;
  // const rpcNode = CONFIG.RPC_NODES[connectedNetwork];
  const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[connectedNetwork];
  try {
    const network = {
      type: CONFIG.WALLET_NETWORK,
    };
    const options = {
      name: CONFIG.NAME,
    };
    const wallet = new BeaconWallet(options);
    const WALLET_RESP = await CheckIfWalletConnected(wallet, network.type);
    if (!WALLET_RESP.success) {
      throw new Error('Wallet connection failed');
    }

    const Tezos = new TezosToolkit(rpcNode);
    Tezos.setRpcProvider(rpcNode);
    Tezos.setWalletProvider(wallet);
    const tokenInAddress = CONFIG.AMM[connectedNetwork][tokenIn].TOKEN_CONTRACT;
    const tokenOutAddress = CONFIG.AMM[connectedNetwork][tokenOut].TOKEN_CONTRACT;
    const tokenInId = CONFIG.AMM[connectedNetwork][tokenIn].TOKEN_ID;
    const tokenOutId = CONFIG.AMM[connectedNetwork][tokenOut].TOKEN_ID;
    const tokenInCallType = CONFIG.AMM[connectedNetwork][tokenIn].CALL_TYPE;

    const tokenInInstance = await Tezos.wallet.at(tokenInAddress);

    const routerAddress = CONFIG.ROUTER[CONFIG.NETWORK];

    const routerInstance = await Tezos.wallet.at(routerAddress);

    const middleTokenContractAddress =
      CONFIG.AMM[connectedNetwork][middleToken[0].name].TOKEN_CONTRACT;

    // const plentyContractInstance = await Tezos.contract.at(
    //   plentyContractAddress
    // );

    const inputDexAddress =
      CONFIG.AMM[connectedNetwork][tokenIn].DEX_PAIRS[middleToken[0].name].contract;
    const outputDexAddress =
      CONFIG.AMM[connectedNetwork][middleToken[0].name].DEX_PAIRS[tokenOut].contract;

    const middleTokenId = CONFIG.AMM[connectedNetwork][middleToken[0].name].TOKEN_ID;
    minimum_Out_Plenty = Math.floor(
      minimum_Out_Plenty *
        Math.pow(10, CONFIG.AMM[connectedNetwork][middleToken[0].name].TOKEN_DECIMAL),
    );
    minimum_Out = Math.floor(
      minimum_Out * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenOut].TOKEN_DECIMAL),
    );

    const DataMap = MichelsonMap.fromLiteral({
      0: {
        exchangeAddress: inputDexAddress,
        minimumOutput: minimum_Out_Plenty,
        requiredTokenAddress: middleTokenContractAddress,
        requiredTokenId: middleTokenId,
      },
      1: {
        exchangeAddress: outputDexAddress,
        minimumOutput: minimum_Out,
        requiredTokenAddress: tokenOutAddress,
        requiredTokenId: tokenOutId,
      },
    });
    // const swapAmount = Math.floor(
    //   amount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenIn].TOKEN_DECIMAL),
    // );

    let swapAmount = amount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenIn].TOKEN_DECIMAL);
    const balanceWithoutDecimal = await getUserBalanceByRpcWithoutDecimal([tokenIn], caller);

    const balanceWithoutDecimalNumber = new BigNumber(balanceWithoutDecimal.balance);
    const lpBal = new BigNumber(swapAmount);

    if (lpBal.isGreaterThan(balanceWithoutDecimalNumber) && (tokenInCallType !== 'XTZ') ) {
      swapAmount = balanceWithoutDecimalNumber;
    } else {
      swapAmount = lpBal;
    }
    // swapAmount = parseInt(swapAmount);
    let batch = null;
    if (tokenInCallType === 'FA1.2') {
      batch = Tezos.wallet
        .batch()
        .withContractCall(tokenInInstance.methods.transfer(caller, routerAddress, swapAmount))
        .withContractCall(routerInstance.methods.routerSwap(DataMap, swapAmount, caller));
    } else {
      batch = Tezos.wallet
        .batch()
        .withContractCall(
          tokenInInstance.methods.transfer([
            {
              from_: caller,
              txs: [{ to_: routerAddress, token_id: tokenInId, amount: swapAmount }],
            },
          ]),
        )
        .withContractCall(routerInstance.methods.routerSwap(DataMap, swapAmount, caller));
    }
    const batchOp = await batch.send();
    transactionSubmitModal(batchOp.opHash);
    await batchOp.confirmation();
    return {
      success: true,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
    };
  }
};

export const loadSwapData = async (tokenIn, tokenOut) => {
  try {
    const connectedNetwork = CONFIG.NETWORK;
    // const rpcNode = CONFIG.RPC_NODES[connectedNetwork];
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[connectedNetwork];
    const dexContractAddress = CONFIG.AMM[connectedNetwork][tokenIn].DEX_PAIRS[tokenOut].contract;
    const Tezos = new TezosToolkit(rpcNode);
    const dexContractInstance = await Tezos.contract.at(dexContractAddress);
    const dexStorage = await dexContractInstance.storage();
    let systemFee = await dexStorage.systemFee;
    systemFee = systemFee.toNumber();
    let lpFee = await dexStorage.lpFee;
    lpFee = lpFee.toNumber();
    let token1_pool = await dexStorage.token1_pool;
    token1_pool = token1_pool.toNumber();
    let token2_pool = await dexStorage.token2_pool;
    token2_pool = token2_pool.toNumber();
    let lpTokenSupply = await dexStorage.totalSupply;
    lpTokenSupply = lpTokenSupply.toNumber();
    const lpToken = CONFIG.AMM[connectedNetwork][tokenIn].DEX_PAIRS[tokenOut].liquidityToken;
    let tokenIn_supply = 0;
    let tokenOut_supply = 0;
    if (CONFIG.AMM[connectedNetwork][tokenIn].DEX_PAIRS[tokenOut].property === 'token2_pool') {
      tokenOut_supply = token2_pool;
      tokenIn_supply = token1_pool;
    } else {
      tokenOut_supply = token1_pool;
      tokenIn_supply = token2_pool;
    }
    const tokenIn_Decimal = CONFIG.AMM[connectedNetwork][tokenIn].TOKEN_DECIMAL;
    const tokenOut_Decimal = CONFIG.AMM[connectedNetwork][tokenOut].TOKEN_DECIMAL;
    const liquidityToken_Decimal =
      CONFIG.AMM[connectedNetwork][
        CONFIG.AMM[connectedNetwork][tokenIn].DEX_PAIRS[tokenOut].liquidityToken
      ].TOKEN_DECIMAL;
    tokenIn_supply = tokenIn_supply / Math.pow(10, tokenIn_Decimal);
    tokenOut_supply = tokenOut_supply / Math.pow(10, tokenOut_Decimal);
    lpTokenSupply = lpTokenSupply / Math.pow(10, liquidityToken_Decimal);
    const exchangeFee = 1 / lpFee + 1 / systemFee;
    const tokenOutPerTokenIn = tokenOut_supply / tokenIn_supply;
    return {
      success: true,
      tokenIn,
      tokenIn_supply,
      tokenOut,
      tokenOut_supply,
      exchangeFee,
      tokenOutPerTokenIn,
      lpTokenSupply,
      lpToken,
      dexContractInstance,
    };
  } catch (error) {
    console.log({ message: 'swap data error', error });
    return {
      success: true,
      tokenIn,
      tokenIn_supply: 0,
      tokenOut,
      tokenOut_supply: 0,
      exchangeFee: 0,
      tokenOutPerTokenIn: 0,
      lpTokenSupply: 0,
      lpToken: null,
      dexContractInstance: null,
    };
  }
};

export const getRouteSwapData = async (tokenIn, tokenOut, middleToken) => {
  try {
    const response = await Promise.all([
      loadSwapData(tokenIn, middleToken[0].name),
      loadSwapData(middleToken[0].name, tokenOut),
    ]);
    const tokenOutPerTokenIn =
      (response[0].tokenOut_supply / response[0].tokenIn_supply) *
      (response[1].tokenOut_supply / response[1].tokenIn_supply);
    return {
      success: true,
      inToMid: response[0],
      midToOut: response[1],
      tokenOutPerTokenIn: tokenOutPerTokenIn,
    };
  } catch (error) {
    return {
      success: false,
      inToMid: null,
      midToOut: null,
      tokenOutPerTokenIn: 0,
    };
  }
};

export const computeTokenOutForRouteBase = (inputAmount, swapData, slippage) => {
  try {
    const inToMidOutput = computeTokenOutput(
      inputAmount,
      swapData.inToMid.tokenIn_supply,
      swapData.inToMid.tokenOut_supply,
      swapData.inToMid.exchangeFee,
      slippage,
    );

    const midToOutOutput = computeTokenOutput(
      inToMidOutput.tokenOut_amount,
      swapData.midToOut.tokenIn_supply,
      swapData.midToOut.tokenOut_supply,
      swapData.midToOut.exchangeFee,
      slippage,
    );

    return {
      tokenOut_amount: midToOutOutput.tokenOut_amount,
      fees: inToMidOutput.fees,
      addtPlentyFee: inToMidOutput.tokenOut_amount / 400,
      minimum_Out: midToOutOutput.minimum_Out,
      minimum_Out_Plenty: inToMidOutput.minimum_Out,
      priceImpact: inToMidOutput.priceImpact + midToOutOutput.priceImpact,
    };
  } catch (err) {
    console.log(err);
    return {
      tokenOut_amount: 0,
      fees: 0,
      minimum_Out: 0,
      priceImpact: 0,
    };
  }
};

export const computeTokenOutForRouteBaseByOutAmount = (outputAmount, swapData, slippage) => {
  try {
    const inToMidOutput = computeTokenOutput(
      outputAmount,
      swapData.midToOut.tokenOut_supply,
      swapData.midToOut.tokenIn_supply,
      swapData.midToOut.exchangeFee,
      slippage,
    );

    const midToOutOutput = computeTokenOutput(
      inToMidOutput.tokenOut_amount,
      swapData.inToMid.tokenOut_supply,
      swapData.inToMid.tokenIn_supply,
      swapData.inToMid.exchangeFee,
      slippage,
    );

    const forPlenty = computeTokenOutput(
      midToOutOutput.tokenOut_amount,
      swapData.inToMid.tokenIn_supply,
      swapData.inToMid.tokenOut_supply,
      swapData.inToMid.exchangeFee,
      slippage,
    );

    const forMinimumOut = computeTokenOutput(
      forPlenty.minimum_Out,
      swapData.midToOut.tokenIn_supply,
      swapData.midToOut.tokenOut_supply,
      swapData.midToOut.exchangeFee,
      slippage,
    );

    // let minimum_Out_Plenty;
    // minimum_Out_Plenty =
    //   inToMidOutput.tokenOut_amount - (slippage * inToMidOutput.tokenOut_amount) / 100;

    return {
      tokenIn_amount: midToOutOutput.tokenOut_amount,
      tokenOut_amount: outputAmount,
      fees: midToOutOutput.fees,
      minimum_Out: forMinimumOut.minimum_Out,
      //minimum_Out_Plenty: inToMidOutput.minimum_Out,
      minimum_Out_Plenty: forPlenty.minimum_Out,
      //minimum_Out_Plenty: 0,
      addtPlentyFee: forPlenty.minimum_Out / 400,
      priceImpact: inToMidOutput.priceImpact + midToOutOutput.priceImpact,
    };
  } catch (err) {
    console.log(err);
    return {
      tokenOut_amount: 0,
      fees: 0,
      minimum_Out: 0,
      priceImpact: 0,
    };
  }
};

// export const computeTokenOutForRouteBaseByOutAmount = (outputAmount, swapData, slippage) => {
//   try {
//     let inToMidOutput = computeTokenOutput(
//       outputAmount,
//       swapData.midToOut.tokenIn_supply,
//       swapData.midToOut.tokenOut_supply,
//       swapData.midToOut.exchangeFee,
//       slippage,
//     );

//     let midToOutOutput = computeTokenOutput(
//       inToMidOutput.tokenOut_amount,
//       swapData.inToMid.tokenIn_supply,
//       swapData.inToMid.tokenOut_supply,
//       swapData.inToMid.exchangeFee,
//       slippage,
//     );

//     return {
//       tokenOut_amount: midToOutOutput.tokenOut_amount,
//       fees: inToMidOutput.fees + midToOutOutput.fees,
//       minimum_Out: midToOutOutput.minimum_Out,
//       priceImpact: 0,
//     };
//   } catch (err) {
//     console.log(err);
//     return {
//       tokenOut_amount: 0,
//       fees: 0,
//       minimum_Out: 0,
//       priceImpact: 0,
//     };
//   }
// };

/**
 * For a particular token pair (for which AMM exists) based on tokenIn_amount, tokenOut_amount can be assumed.
 * @param tokenIn_amount - amount of tokenIn which user wants to swap
 * @param tokenIn_supply - As received form AMM contract
 * @param tokenOut_supply - As received form AMM contract
 * @param exchangeFee - As received form AMM contract
 * @param slippage - Slippage which the user can tolerate in percentage
 */
export const computeTokenOutput = (
  tokenIn_amount,
  tokenIn_supply,
  tokenOut_supply,
  exchangeFee,
  slippage,
) => {
  try {
    let tokenOut_amount = 0;
    tokenOut_amount = (1 - exchangeFee) * tokenOut_supply * tokenIn_amount;
    tokenOut_amount /= tokenIn_supply + (1 - exchangeFee) * tokenIn_amount;
    const fees = tokenIn_amount * exchangeFee;
    const minimum_Out = tokenOut_amount - (slippage * tokenOut_amount) / 100;

    const updated_TokenIn_Supply = tokenIn_supply - tokenIn_amount;
    const updated_TokenOut_Supply = tokenOut_supply - tokenOut_amount;
    let next_tokenOut_Amount = (1 - exchangeFee) * updated_TokenOut_Supply * tokenIn_amount;
    next_tokenOut_Amount /= updated_TokenIn_Supply + (1 - exchangeFee) * tokenIn_amount;
    let priceImpact = (tokenOut_amount - next_tokenOut_Amount) / tokenOut_amount;
    priceImpact = priceImpact * 100;
    priceImpact = priceImpact.toFixed(5);
    priceImpact = Math.abs(priceImpact);
    priceImpact = priceImpact * 100;

    return {
      tokenOut_amount,
      fees,
      minimum_Out,
      priceImpact,
    };
  } catch (error) {
    return {
      tokenOut_amount: 0,
      fees: 0,
      minimum_Out: 0,
      priceImpact: 0,
    };
  }
};
export const estimateOtherToken = (tokenIn_amount, tokenIn_supply, tokenOut_supply) => {
  try {
    const otherTokenAmount = (tokenIn_amount * tokenOut_supply) / tokenIn_supply;
    return {
      otherTokenAmount,
    };
  } catch (err) {
    return {
      otherTokenAmount: 0,
    };
  }
};

/**
 * Performs the adding liquidity operation
 * @param tokenA - First token of the pair , case specific to CONFIG
 * @param tokenB - Second token of the pair , case specific to CONFIG
 * @param tokenA_amount - Amount of tokenA which user want to invest
 * @param tokenB_amount - Amount of tokenB which user want to invest
 * @param tokenA_Instance - Pass NULL
 * @param tokenB_Instance - Pass NULL
 * @param caller - owner address being used for approve call
 * @param dexContractInstance - Pass NULL
 * @param transactionSubmitModal - Callback to open modal when transaction is submiited
 */

export const addLiquidity = async (
  tokenA,
  tokenB,
  tokenA_Amount,
  tokenB_Amount,
  tokenA_Instance,
  tokenB_Instance,
  caller,
  dexContractInstance,
  transactionSubmitModal,
  resetAllValues,
  setShowConfirmAddSupply,
  setShowConfirmTransaction,
) => {
  try {
    const network = {
      type: CONFIG.WALLET_NETWORK,
    };
    const options = {
      name: CONFIG.NAME,
    };
    const wallet = new BeaconWallet(options);
    const WALLET_RESP = await CheckIfWalletConnected(wallet, network.type);
    if (!WALLET_RESP.success) {
      throw new Error('Wallet connection failed');
    }
    let tokenFirst = null;
    let tokenSecond = null;
    let tokenFirst_Amount = 0;
    let tokenSecond_Amount = 0;
    let tokenFirstInstance = null;
    let tokenSecondInstance = null;

    const connectedNetwork = CONFIG.NETWORK;
    // const rpcNode = CONFIG.RPC_NODES[connectedNetwork];
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[connectedNetwork];
    const Tezos = new TezosToolkit(rpcNode);
    Tezos.setRpcProvider(rpcNode);
    Tezos.setWalletProvider(wallet);
    if (CONFIG.AMM[connectedNetwork][tokenA].DEX_PAIRS[tokenB].property === 'token2_pool') {
      tokenFirst = tokenA;
      tokenFirstInstance = tokenA_Instance;
      tokenFirst_Amount = Math.floor(
        tokenA_Amount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenA].TOKEN_DECIMAL),
      );
      tokenSecond = tokenB;
      tokenSecondInstance = tokenB_Instance;
      tokenSecond_Amount = Math.floor(
        tokenB_Amount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenB].TOKEN_DECIMAL),
      );
    } else {
      tokenFirst = tokenB;
      tokenFirstInstance = tokenB_Instance;
      tokenFirst_Amount = Math.floor(
        tokenB_Amount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenB].TOKEN_DECIMAL),
      );
      tokenSecond = tokenA;
      tokenSecondInstance = tokenA_Instance;
      tokenSecond_Amount = Math.floor(
        tokenA_Amount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenA].TOKEN_DECIMAL),
      );
    }
    const dexContractAddress =
      CONFIG.AMM[connectedNetwork][tokenFirst].DEX_PAIRS[tokenSecond].contract;
    const tokenFirstAddress = CONFIG.AMM[connectedNetwork][tokenFirst].TOKEN_CONTRACT;
    const tokenSecondAddress = CONFIG.AMM[connectedNetwork][tokenSecond].TOKEN_CONTRACT;
    const tokenFirstId = CONFIG.AMM[connectedNetwork][tokenFirst].TOKEN_ID;
    const tokenSecondId = CONFIG.AMM[connectedNetwork][tokenSecond].TOKEN_ID;

    tokenFirstInstance = await Tezos.contract.at(tokenFirstAddress);
    tokenSecondInstance = await Tezos.contract.at(tokenSecondAddress);
    dexContractInstance = await Tezos.contract.at(dexContractAddress);

    let batch = null;
    if (
      CONFIG.AMM[connectedNetwork][tokenFirst].CALL_TYPE === 'FA1.2' &&
      CONFIG.AMM[connectedNetwork][tokenSecond].CALL_TYPE === 'FA2'
    ) {
      batch = Tezos.wallet
        .batch()
        .withContractCall(tokenFirstInstance.methods.approve(dexContractAddress, tokenFirst_Amount))
        .withContractCall(
          tokenSecondInstance.methods.update_operators([
            {
              add_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenSecondId,
              },
            },
          ]),
        )
        .withContractCall(
          dexContractInstance.methods.AddLiquidity(caller, tokenFirst_Amount, tokenSecond_Amount),
        )
        .withContractCall(tokenFirstInstance.methods.approve(dexContractAddress, 0))
        .withContractCall(
          tokenSecondInstance.methods.update_operators([
            {
              remove_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenSecondId,
              },
            },
          ]),
        );
    } else if (
      CONFIG.AMM[connectedNetwork][tokenFirst].CALL_TYPE === 'FA2' &&
      CONFIG.AMM[connectedNetwork][tokenSecond].CALL_TYPE === 'FA1.2'
    ) {
      batch = Tezos.wallet
        .batch()
        .withContractCall(
          tokenFirstInstance.methods.update_operators([
            {
              add_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenFirstId,
              },
            },
          ]),
        )
        .withContractCall(
          tokenSecondInstance.methods.approve(dexContractAddress, tokenSecond_Amount),
        )
        .withContractCall(
          dexContractInstance.methods.AddLiquidity(caller, tokenFirst_Amount, tokenSecond_Amount),
        )
        .withContractCall(
          tokenFirstInstance.methods.update_operators([
            {
              remove_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenFirstId,
              },
            },
          ]),
        )
        .withContractCall(tokenSecondInstance.methods.approve(dexContractAddress, 0));
    } else if (
      CONFIG.AMM[connectedNetwork][tokenFirst].CALL_TYPE === 'FA2' &&
      CONFIG.AMM[connectedNetwork][tokenSecond].CALL_TYPE === 'FA2'
    ) {
      batch = Tezos.wallet
        .batch()
        .withContractCall(
          tokenFirstInstance.methods.update_operators([
            {
              add_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenFirstId,
              },
            },
          ]),
        )
        .withContractCall(
          tokenSecondInstance.methods.update_operators([
            {
              add_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenSecondId,
              },
            },
          ]),
        )
        .withContractCall(
          dexContractInstance.methods.AddLiquidity(caller, tokenFirst_Amount, tokenSecond_Amount),
        )
        .withContractCall(
          tokenFirstInstance.methods.update_operators([
            {
              remove_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenFirstId,
              },
            },
          ]),
        )
        .withContractCall(
          tokenSecondInstance.methods.update_operators([
            {
              remove_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenSecondId,
              },
            },
          ]),
        );
    } else if (
      CONFIG.AMM[connectedNetwork][tokenFirst].CALL_TYPE === 'FA1.2' &&
      CONFIG.AMM[connectedNetwork][tokenSecond].CALL_TYPE === 'FA1.2'
    ) {
      batch = Tezos.wallet
        .batch()
        .withContractCall(tokenFirstInstance.methods.approve(dexContractAddress, tokenFirst_Amount))
        .withContractCall(
          tokenSecondInstance.methods.approve(dexContractAddress, tokenSecond_Amount),
        )
        .withContractCall(
          dexContractInstance.methods.AddLiquidity(caller, tokenFirst_Amount, tokenSecond_Amount),
        )
        .withContractCall(tokenFirstInstance.methods.approve(dexContractAddress, 0))
        .withContractCall(tokenSecondInstance.methods.approve(dexContractAddress, 0));
    }
    const batchOperation = await batch.send();

    setShowConfirmAddSupply(false);
    setShowConfirmTransaction(false);
    transactionSubmitModal(batchOperation.opHash);
    resetAllValues();
    await batchOperation.confirmation().then(() => batchOperation.opHash);
    return {
      success: true,
      operationId: batchOperation.hash,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

export const addLiquidity_generalStable = async (
  tokenA,
  tokenB,
  tokenA_Amount,
  tokenB_Amount,
  tokenA_Instance,
  tokenB_Instance,
  caller,
  dexContractInstance,
  transactionSubmitModal,
  resetAllValues,
  setShowConfirmAddSupply,
  setShowConfirmTransaction,
) => {
  try {
    const network = {
      type: CONFIG.WALLET_NETWORK,
    };
    const options = {
      name: CONFIG.NAME,
    };
    const wallet = new BeaconWallet(options);
    const WALLET_RESP = await CheckIfWalletConnected(wallet, network.type);
    if (!WALLET_RESP.success) {
      throw new Error('Wallet connection failed');
    }
    let tokenFirst = null;
    let tokenSecond = null;
    let tokenFirst_Amount = 0;
    let tokenSecond_Amount = 0;
    let tokenFirstInstance = null;
    let tokenSecondInstance = null;

    const connectedNetwork = CONFIG.NETWORK;
    // const rpcNode = CONFIG.RPC_NODES[connectedNetwork];
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[connectedNetwork];
    const Tezos = new TezosToolkit(rpcNode);
    Tezos.setRpcProvider(rpcNode);
    Tezos.setWalletProvider(wallet);
    if (CONFIG.AMM[connectedNetwork][tokenA].DEX_PAIRS[tokenB].property === 'token2_pool') {
      tokenFirst = tokenA;
      tokenFirstInstance = tokenA_Instance;
      tokenFirst_Amount = Math.floor(
        tokenA_Amount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenA].TOKEN_DECIMAL),
      );
      tokenSecond = tokenB;
      tokenSecondInstance = tokenB_Instance;
      tokenSecond_Amount = Math.floor(
        tokenB_Amount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenB].TOKEN_DECIMAL),
      );
    } else {
      tokenFirst = tokenB;
      tokenFirstInstance = tokenB_Instance;
      tokenFirst_Amount = Math.floor(
        tokenB_Amount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenB].TOKEN_DECIMAL),
      );
      tokenSecond = tokenA;
      tokenSecondInstance = tokenA_Instance;
      tokenSecond_Amount = Math.floor(
        tokenA_Amount * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenA].TOKEN_DECIMAL),
      );
    }
    const dexContractAddress =
      CONFIG.AMM[connectedNetwork][tokenFirst].DEX_PAIRS[tokenSecond].contract;
    const tokenFirstAddress = CONFIG.AMM[connectedNetwork][tokenFirst].TOKEN_CONTRACT;
    const tokenSecondAddress = CONFIG.AMM[connectedNetwork][tokenSecond].TOKEN_CONTRACT;
    const tokenFirstId = CONFIG.AMM[connectedNetwork][tokenFirst].TOKEN_ID;
    const tokenSecondId = CONFIG.AMM[connectedNetwork][tokenSecond].TOKEN_ID;

    tokenFirstInstance = await Tezos.contract.at(tokenFirstAddress);
    tokenSecondInstance = await Tezos.contract.at(tokenSecondAddress);
    dexContractInstance = await Tezos.contract.at(dexContractAddress);

    let batch = null;
    if (
      CONFIG.AMM[connectedNetwork][tokenFirst].CALL_TYPE === 'FA1.2' &&
      CONFIG.AMM[connectedNetwork][tokenSecond].CALL_TYPE === 'FA2'
    ) {
      batch = Tezos.wallet
        .batch()
        .withContractCall(tokenFirstInstance.methods.approve(dexContractAddress, tokenFirst_Amount))
        .withContractCall(
          tokenSecondInstance.methods.update_operators([
            {
              add_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenSecondId,
              },
            },
          ]),
        )
        .withContractCall(
          dexContractInstance.methods.add_liquidity(caller, tokenFirst_Amount, tokenSecond_Amount),
        )
        .withContractCall(tokenFirstInstance.methods.approve(dexContractAddress, 0))
        .withContractCall(
          tokenSecondInstance.methods.update_operators([
            {
              remove_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenSecondId,
              },
            },
          ]),
        );
    } else if (
      CONFIG.AMM[connectedNetwork][tokenFirst].CALL_TYPE === 'FA2' &&
      CONFIG.AMM[connectedNetwork][tokenSecond].CALL_TYPE === 'FA1.2'
    ) {
      batch = Tezos.wallet
        .batch()
        .withContractCall(
          tokenFirstInstance.methods.update_operators([
            {
              add_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenFirstId,
              },
            },
          ]),
        )
        .withContractCall(
          tokenSecondInstance.methods.approve(dexContractAddress, tokenSecond_Amount),
        )
        .withContractCall(
          dexContractInstance.methods.add_liquidity(caller, tokenFirst_Amount, tokenSecond_Amount),
        )
        .withContractCall(
          tokenFirstInstance.methods.update_operators([
            {
              remove_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenFirstId,
              },
            },
          ]),
        )
        .withContractCall(tokenSecondInstance.methods.approve(dexContractAddress, 0));
    } else if (
      CONFIG.AMM[connectedNetwork][tokenFirst].CALL_TYPE === 'FA2' &&
      CONFIG.AMM[connectedNetwork][tokenSecond].CALL_TYPE === 'FA2'
    ) {
      batch = Tezos.wallet
        .batch()
        .withContractCall(
          tokenFirstInstance.methods.update_operators([
            {
              add_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenFirstId,
              },
            },
          ]),
        )
        .withContractCall(
          tokenSecondInstance.methods.update_operators([
            {
              add_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenSecondId,
              },
            },
          ]),
        )
        .withContractCall(
          dexContractInstance.methods.add_liquidity(caller, tokenFirst_Amount, tokenSecond_Amount),
        )
        .withContractCall(
          tokenFirstInstance.methods.update_operators([
            {
              remove_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenFirstId,
              },
            },
          ]),
        )
        .withContractCall(
          tokenSecondInstance.methods.update_operators([
            {
              remove_operator: {
                owner: caller,
                operator: dexContractAddress,
                token_id: tokenSecondId,
              },
            },
          ]),
        );
    } else if (
      CONFIG.AMM[connectedNetwork][tokenFirst].CALL_TYPE === 'FA1.2' &&
      CONFIG.AMM[connectedNetwork][tokenSecond].CALL_TYPE === 'FA1.2'
    ) {
      batch = Tezos.wallet
        .batch()
        .withContractCall(tokenFirstInstance.methods.approve(dexContractAddress, tokenFirst_Amount))
        .withContractCall(
          tokenSecondInstance.methods.approve(dexContractAddress, tokenSecond_Amount),
        )
        .withContractCall(
          dexContractInstance.methods.add_liquidity(caller, tokenFirst_Amount, tokenSecond_Amount),
        )
        .withContractCall(tokenFirstInstance.methods.approve(dexContractAddress, 0))
        .withContractCall(tokenSecondInstance.methods.approve(dexContractAddress, 0));
    }
    const batchOperation = await batch.send();

    setShowConfirmAddSupply(false);
    setShowConfirmTransaction(false);
    transactionSubmitModal(batchOperation.opHash);
    resetAllValues();
    await batchOperation.confirmation().then(() => batchOperation.opHash);
    return {
      success: true,
      operationId: batchOperation.hash,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

/**
 * Helps in estimating the amount of token the user will get in exchange for LP
 * @param burnAmount - Amount of LP tokens the user wants to burn
 * @param lpTotalSupply - As received from contract
 * @param tokenFirst_Supply - As received from contract
 * @param tokenSecond_Supply - As received from contract
 * @param slippage - amount of slippage user can tolerate
 */
export const computeRemoveTokens = (
  burnAmount,
  lpTotalSupply,
  tokenFirst_Supply,
  tokenSecond_Supply,
  slippage,
) => {
  try {
    let tokenFirst_Out = (burnAmount * tokenFirst_Supply) / lpTotalSupply;
    let tokenSecond_Out = (burnAmount * tokenSecond_Supply) / lpTotalSupply;
    tokenFirst_Out = tokenFirst_Out - (slippage * tokenFirst_Out) / 100;
    tokenSecond_Out = tokenSecond_Out - (slippage * tokenSecond_Out) / 100;
    return {
      tokenFirst_Out,
      tokenSecond_Out,
    };
  } catch (e) {
    return {
      tokenFirst_Out: 0,
      tokenSecond_Out: 0,
    };
  }
};

/**
 * Gets balance of user of a particular token using RPC
 * @param identifier - Name of token, case-sensitive to CONFIG
 * @param address - tz1 address of user
 */
export const getUserBalanceByRpc = async (identifier, address) => {
  try {
    const token = CONFIG.AMM[CONFIG.NETWORK][identifier];
    const mapId = token.mapId;
    const type = token.READ_TYPE;
    const decimal = token.TOKEN_DECIMAL;
    const tokenId = token.TOKEN_ID;
    // const rpcNode = CONFIG.RPC_NODES[CONFIG.NETWORK];
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[CONFIG.NETWORK];
    const packedKey = getPackedKey(tokenId, address, type);
    const url = `${rpcNode}chains/main/blocks/head/context/big_maps/${mapId}/${packedKey}`;
    const response = await axios.get(url);

    const balance = (() => {
      // IIFE
      let _balance;
      if (type1MapIds.includes(mapId)) {
        _balance = response.data.args[0].args[1].int;
      } else if (type2MapIds.includes(mapId)) {
        _balance = response.data.args[1].int;
      } else if (type3MapIds.includes(mapId)) {
        _balance = response.data.args[0].int;
      } else if (type4MapIds.includes(mapId)) {
        _balance = response.data.int;
      } else if (type5MapIds.includes(mapId)) {
        _balance = response.data.args[0][0].args[1].int;
      } else {
        _balance = response.data.args[1].int;
      }
      _balance = new BigNumber(_balance);
      _balance = _balance.dividedBy(10 ** decimal);
      _balance = _balance.toFixed(decimal);
      return Number(_balance);
    })();
    return {
      success: true,
      balance,
      identifier,
    };
  } catch (error) {
    return {
      success: false,
      balance: 0,
      identifier,
      error: error,
    };
  }
};

export const getUserBalanceByRpcWithoutDecimal = async (identifier, address) => {
  try {
    const token = CONFIG.AMM[CONFIG.NETWORK][identifier];
    const mapId = token.mapId;
    const type = token.READ_TYPE;
    const tokenId = token.TOKEN_ID;
    // const rpcNode = CONFIG.RPC_NODES[CONFIG.NETWORK];
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[CONFIG.NETWORK];
    const packedKey = getPackedKey(tokenId, address, type);
    const url = `${rpcNode}chains/main/blocks/head/context/big_maps/${mapId}/${packedKey}`;
    const response = await axios.get(url);

    const balance = (() => {
      // IIFE
      let _balance;
      if (type1MapIds.includes(mapId)) {
        _balance = response.data.args[0].args[1].int;
      } else if (type2MapIds.includes(mapId)) {
        _balance = response.data.args[1].int;
      } else if (type3MapIds.includes(mapId)) {
        _balance = response.data.args[0].int;
      } else if (type4MapIds.includes(mapId)) {
        _balance = response.data.int;
      } else if (type5MapIds.includes(mapId)) {
        _balance = response.data.args[0][0].args[1].int;
      } else {
        _balance = response.data.args[1].int;
      }
      return _balance;
    })();

    return {
      success: true,
      balance,
      identifier,
    };
  } catch (error) {
    return {
      success: false,
      balance: 0,
      identifier,
      error: error,
    };
  }
};
/**
 * Perform the remove liquidity operation
 * @param tokenA - First token of selected pair, case-sensitive to CONFIG
 * @param tokenB - Second token of selected pair, case-sensitive to CONFIG
 * @param tokenA_MinimumRecieve - minimum amount of tokenA type which user want to get out of that transaction
 * @param tokenB_MinimumRecieve - minimum amount of tokenB type which user want to get out of that transaction
 * @param lpToken_Amount - Amount of LP token user wants to divest
 * @param caller - Address of caller
 * @param dexContractInstance - Pass null
 * @param transactionSubmitModal - Callback to open modal when transaction is submitted
 */
export const removeLiquidity = async (
  tokenA,
  tokenB,
  tokenA_MinimumRecieve,
  tokenB_MinimumRecieve,
  lpToken_Amount,
  caller,
  dexContractInstance,
  transactionSubmitModal,
  resetAllValues,
  setShowConfirmRemoveSupply,
  setShowConfirmTransaction,
) => {
  try {
    let tokenFirst = null;
    let tokenSecond = null;
    let tokenFirst_Amount = 0;
    let tokenSecond_Amount = 0;
    const network = {
      type: CONFIG.WALLET_NETWORK,
    };
    const options = {
      name: CONFIG.NAME,
    };
    const connectedNetwork = CONFIG.NETWORK;
    // const rpcNode = CONFIG.RPC_NODES[connectedNetwork];
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[connectedNetwork];
    const wallet = new BeaconWallet(options);
    const WALLET_RESP = await CheckIfWalletConnected(wallet, network.type);
    if (!WALLET_RESP.success) {
      throw new Error('Wallet connection failed');
    }
    const Tezos = new TezosToolkit(rpcNode);
    Tezos.setRpcProvider(rpcNode);
    Tezos.setWalletProvider(wallet);

    if (CONFIG.AMM[connectedNetwork][tokenA].DEX_PAIRS[tokenB].property === 'token2_pool') {
      tokenFirst = tokenA;
      tokenFirst_Amount = Math.floor(
        tokenA_MinimumRecieve * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenA].TOKEN_DECIMAL),
      );

      tokenSecond = tokenB;
      tokenSecond_Amount = Math.floor(
        tokenB_MinimumRecieve * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenB].TOKEN_DECIMAL),
      );
    } else {
      tokenFirst = tokenB;
      tokenFirst_Amount = Math.floor(
        tokenB_MinimumRecieve * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenB].TOKEN_DECIMAL),
      );
      tokenSecond = tokenA;
      tokenSecond_Amount = Math.floor(
        tokenA_MinimumRecieve * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenA].TOKEN_DECIMAL),
      );
    }

    const lpTokenDecimal =
      CONFIG.AMM[connectedNetwork][
        CONFIG.AMM[connectedNetwork][tokenFirst].DEX_PAIRS[tokenSecond].liquidityToken
      ].TOKEN_DECIMAL;
    const balanceWithoutDecimal = await getUserBalanceByRpcWithoutDecimal(
      CONFIG.AMM[connectedNetwork][tokenA].DEX_PAIRS[tokenB].liquidityToken,
      caller,
    );

    const balanceWithoutDecimalNumber = new BigNumber(balanceWithoutDecimal.balance);
    const lpBal = new BigNumber(lpToken_Amount * Math.pow(10, lpTokenDecimal));

    if (lpBal.isGreaterThan(balanceWithoutDecimalNumber)) {
      lpToken_Amount = balanceWithoutDecimalNumber;
    } else {
      lpToken_Amount = Math.floor(lpToken_Amount * Math.pow(10, lpTokenDecimal));
    }
    const dexContractAddress = CONFIG.AMM[connectedNetwork][tokenA].DEX_PAIRS[tokenB].contract;

    const dexContractInstanceLocal = await Tezos.contract.at(dexContractAddress);

    const batch = Tezos.wallet
      .batch()
      .withContractCall(
        dexContractInstanceLocal.methods.RemoveLiquidity(
          lpToken_Amount,
          caller,
          parseInt(tokenFirst_Amount * 0.98),
          parseInt(tokenSecond_Amount * 0.98),
        ),
      );
    const batchOperation = await batch.send();

    setShowConfirmRemoveSupply(false);
    setShowConfirmTransaction(false);
    transactionSubmitModal(batchOperation.opHash);
    resetAllValues();
    await batchOperation.confirmation().then(() => batchOperation.opHash);
    return {
      success: true,
      operationId: batchOperation.hash,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

export const removeLiquidity_generalStable = async (
  tokenA,
  tokenB,
  tokenA_MinimumRecieve,
  tokenB_MinimumRecieve,
  lpToken_Amount,
  caller,
  dexContractInstance,
  transactionSubmitModal,
  resetAllValues,
  setShowConfirmRemoveSupply,
  setShowConfirmTransaction,
) => {
  try {
    let tokenFirst = null;
    let tokenSecond = null;
    let tokenFirst_Amount = 0;
    let tokenSecond_Amount = 0;
    const network = {
      type: CONFIG.WALLET_NETWORK,
    };
    const options = {
      name: CONFIG.NAME,
    };
    const connectedNetwork = CONFIG.NETWORK;
    // const rpcNode = CONFIG.RPC_NODES[connectedNetwork];
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[connectedNetwork];
    const wallet = new BeaconWallet(options);
    const WALLET_RESP = await CheckIfWalletConnected(wallet, network.type);
    if (!WALLET_RESP.success) {
      throw new Error('Wallet connection failed');
    }
    const Tezos = new TezosToolkit(rpcNode);
    Tezos.setRpcProvider(rpcNode);
    Tezos.setWalletProvider(wallet);

    if (CONFIG.AMM[connectedNetwork][tokenA].DEX_PAIRS[tokenB].property === 'token2_pool') {
      tokenFirst = tokenA;
      tokenFirst_Amount = Math.floor(
        tokenA_MinimumRecieve * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenA].TOKEN_DECIMAL),
      );

      tokenSecond = tokenB;
      tokenSecond_Amount = Math.floor(
        tokenB_MinimumRecieve * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenB].TOKEN_DECIMAL),
      );
    } else {
      tokenFirst = tokenB;
      tokenFirst_Amount = Math.floor(
        tokenB_MinimumRecieve * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenB].TOKEN_DECIMAL),
      );
      tokenSecond = tokenA;
      tokenSecond_Amount = Math.floor(
        tokenA_MinimumRecieve * Math.pow(10, CONFIG.AMM[connectedNetwork][tokenA].TOKEN_DECIMAL),
      );
    }

    const lpTokenDecimal =
      CONFIG.AMM[connectedNetwork][
        CONFIG.AMM[connectedNetwork][tokenFirst].DEX_PAIRS[tokenSecond].liquidityToken
      ].TOKEN_DECIMAL;

    const balanceWithoutDecimal = await getUserBalanceByRpcWithoutDecimal(
      CONFIG.AMM[connectedNetwork][tokenA].DEX_PAIRS[tokenB].liquidityToken,
      caller,
    );
    const balanceWithoutDecimalNumber = new BigNumber(balanceWithoutDecimal.balance);
    const lpBal = new BigNumber(lpToken_Amount * Math.pow(10, lpTokenDecimal));

    if (lpBal.isGreaterThan(balanceWithoutDecimalNumber)) {
      lpToken_Amount = balanceWithoutDecimalNumber;
    } else {
      lpToken_Amount = Math.floor(lpToken_Amount * Math.pow(10, lpTokenDecimal));
    }

    const dexContractAddress = CONFIG.AMM[connectedNetwork][tokenA].DEX_PAIRS[tokenB].contract;

    const dexContractInstanceLocal = await Tezos.contract.at(dexContractAddress);

    const batch = Tezos.wallet
      .batch()
      .withContractCall(
        dexContractInstanceLocal.methods.remove_liquidity(
          lpToken_Amount,
          caller,
          parseInt(tokenFirst_Amount * 0.98),
          parseInt(tokenSecond_Amount * 0.98),
        ),
      );
    const batchOperation = await batch.send();

    setShowConfirmRemoveSupply(false);
    setShowConfirmTransaction(false);
    transactionSubmitModal(batchOperation.opHash);
    resetAllValues();
    await batchOperation.confirmation().then(() => batchOperation.opHash);
    return {
      success: true,
      operationId: batchOperation.hash,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

/**
 * API for fetching tzBTC balance because it cannot be fetched using RPC
 * @param addressOfUser - Address of user for whom balance is to be fetched
 */
export const fetchtzBTCBalance = async (addressOfUser) => {
  try {
    const tokenContractAddress = 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn';
    const connectedNetwork = CONFIG.NETWORK;
    // const rpcNode = CONFIG.RPC_NODES[connectedNetwork];
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[connectedNetwork];
    const Tezos = new TezosToolkit(rpcNode);
    Tezos.setProvider(rpcNode);
    const contract = await Tezos.contract.at(tokenContractAddress);
    const storage = await contract.storage();
    let userBalance = 0;
    const packedAddress = packDataBytes({ string: addressOfUser }, { prim: 'address' });
    const ledgerKey = {
      prim: 'Pair',
      args: [{ string: 'ledger' }, { bytes: packedAddress.bytes.slice(12) }],
    };
    const ledgerKeyBytes = packDataBytes(ledgerKey);
    const ledgerInstance = storage[Object.keys(storage)[0]];
    const bigmapVal = await ledgerInstance.get(ledgerKeyBytes.bytes);
    if (bigmapVal) {
      const bigmapValData = unpackDataBytes({ bytes: bigmapVal });
      if (
        Object.prototype.hasOwnProperty.call(bigmapValData, 'prim') &&
        bigmapValData.prim === 'Pair'
      ) {
        userBalance = +bigmapValData.args[0].int / Math.pow(10, 8);
      }
    }
    return {
      success: true,
      balance: userBalance,
      identifier: 'tzBTC',
    };
  } catch (e) {
    return {
      success: false,
      balance: 0,
      identifier: 'tzBTC',
    };
  }
};

/**
 * @deprecated
 */

export const fetchWalletBalance = async (
  addressOfUser,
  tokenContractAddress,
  icon,
  type,
  token_id,
  token_decimal,
) => {
  try {
    const connectedNetwork = CONFIG.NETWORK;
    // const rpcNode = CONFIG.RPC_NODES[connectedNetwork];
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[connectedNetwork];
    const Tezos = new TezosToolkit(rpcNode);
    Tezos.setProvider(rpcNode);
    const contract = await Tezos.contract.at(tokenContractAddress);
    const storage = await contract.storage();
    let userBalance = 0;
    if (type === 'FA1.2') {
      if (['WRAP', 'PXL', 'CRUNCH', 'crDAO'].includes(icon)) {
        const userDetails = await storage.assets.ledger.get(addressOfUser);
        let userBalance = userDetails;
        userBalance = userBalance.toNumber() / Math.pow(10, token_decimal).toFixed(3);
        userBalance = parseFloat(userBalance);
        return {
          success: true,
          balance: userBalance,
          symbol: icon,
          contractInstance: contract,
        };
      } else if (icon === 'QUIPU') {
        const userDetails = await storage.account_info.get(addressOfUser);
        let userBalance = userDetails.balances.valueMap.get('"0"');
        userBalance = userBalance.toNumber() / Math.pow(10, token_decimal);
        userBalance = parseFloat(userBalance);
        return {
          success: true,
          balance: userBalance,
          symbol: icon,
          contractInstance: contract,
        };
      } else if (icon === 'ETHtz' || icon === 'FLAME') {
        const userDetails = await storage.ledger.get(addressOfUser);
        let userBalance = userDetails.balance;
        userBalance = userBalance.toNumber() / Math.pow(10, token_decimal).toFixed(3);
        userBalance = parseFloat(userBalance);
        return {
          success: true,
          balance: userBalance,
          symbol: icon,
          contractInstance: contract,
        };
      } else if (icon === 'KALAM' || icon === 'GIF' || icon === 'INSTA') {
        const userDetails = await storage.ledger.get(addressOfUser);
        let userBalance = userDetails;
        userBalance = userBalance.toNumber() / Math.pow(10, token_decimal).toFixed(3);
        userBalance = parseFloat(userBalance);
        return {
          success: true,
          balance: userBalance,
          symbol: icon,
          contractInstance: contract,
        };
      } else if (icon === 'USDtz' || icon === 'PAUL') {
        const userDetails = await storage.ledger.get(addressOfUser);
        let userBalance = userDetails.balance;
        userBalance = userBalance.toNumber() / Math.pow(10, token_decimal).toFixed(3);
        userBalance = parseFloat(userBalance);
        return {
          success: true,
          balance: userBalance,
          symbol: icon,
          contractInstance: contract,
        };
      } else if (icon === 'ctez') {
        const userDetails = await storage.tokens.get(addressOfUser);
        let userBalance = userDetails;
        userBalance = userBalance.toNumber() / Math.pow(10, token_decimal).toFixed(3);
        userBalance = parseFloat(userBalance);
        return {
          success: true,
          balance: userBalance,
          symbol: icon,
          contractInstance: contract,
        };
      } else if (icon === 'tzBTC') {
        let userBalance = 0;
        const packedAddress = packDataBytes({ string: addressOfUser }, { prim: 'address' });
        const ledgerKey = {
          prim: 'Pair',
          args: [{ string: 'ledger' }, { bytes: packedAddress.bytes.slice(12) }],
        };
        const ledgerKeyBytes = packDataBytes(ledgerKey);
        const ledgerInstance = storage[Object.keys(storage)[0]];
        const bigmapVal = await ledgerInstance.get(ledgerKeyBytes.bytes);
        if (bigmapVal) {
          const bigmapValData = unpackDataBytes({ bytes: bigmapVal });
          if (
            Object.prototype.hasOwnProperty.call(bigmapValData, 'prim') &&
            bigmapValData.prim === 'Pair'
          ) {
            userBalance = +bigmapValData.args[0].int / Math.pow(10, 8);
          }
        }
        return {
          success: true,
          balance: userBalance,
          symbol: icon,
          contractInstance: contract,
        };
      } else if (icon === 'kDAO') {
        let userBalance = await storage.balances.get(addressOfUser);
        //let userBalance = userDetails;

        userBalance = userBalance.toNumber() / Math.pow(10, token_decimal);
        userBalance = parseFloat(userBalance);
        return {
          success: true,
          balance: userBalance,
          symbol: icon,
          contractInstance: contract,
        };
      } else {
        const userDetails = await storage.balances.get(addressOfUser);
        let userBalance = userDetails.balance;

        userBalance = userBalance.toNumber() / Math.pow(10, token_decimal);
        userBalance = parseFloat(userBalance);
        return {
          success: true,
          balance: userBalance,
          symbol: icon,
          contractInstance: contract,
        };
      }
    } else {
      if (icon === 'hDAO' || icon === 'UNO') {
        const userDetails = await storage.ledger.get({
          0: addressOfUser,
          1: token_id,
        });

        userBalance = (userDetails.toNumber() / Math.pow(10, token_decimal)).toFixed(3);
        userBalance = parseFloat(userBalance);

        return {
          success: true,
          balance: userBalance,
          symbol: icon,
          contractInstance: contract,
        };
      } else if (icon === 'uUSD' || icon === 'uDEFI') {
        const packedKey = getPackedKey(token_id, addressOfUser, 'FA2');
        const balanceResponse = await axios.get(
          `${rpcNode}chains/main/blocks/head/context/big_maps/7706/${packedKey}`,
        );
        let balance = parseFloat(balanceResponse.data.int);
        balance = balance / Math.pow(10, token_decimal);

        return {
          success: true,
          balance,
          symbol: icon,
          contractInstance: contract,
        };
      } else if (icon === 'YOU') {
        const packedKey = getPackedKey(token_id, addressOfUser, 'FA2');
        const balanceResponse = await axios.get(
          `${rpcNode}chains/main/blocks/head/context/big_maps/7715/${packedKey}`,
        );
        let balance = parseFloat(balanceResponse.data.int);
        balance = balance / Math.pow(10, token_decimal);

        return {
          success: true,
          balance,
          symbol: icon,
          contractInstance: contract,
        };
      } else {
        const userDetails = await storage.assets.ledger.get({
          0: addressOfUser,
          1: token_id,
        });
        userBalance = (userDetails.toNumber() / Math.pow(10, token_decimal)).toFixed(token_decimal);
        userBalance = parseFloat(userBalance);

        return {
          success: true,
          balance: userBalance,
          symbol: icon,
          contractInstance: contract,
        };
      }
    }
  } catch (e) {
    return {
      success: false,
      balance: 0,
      symbol: icon,
      error: e,
      contractInstance: null,
    };
  }
};
/**
 * @deprecated
 */
export const fetchAllWalletBalance = async (addressOfUser) => {
  try {
    const network = CONFIG.NETWORK;
    const promises = [];
    for (const identifier in CONFIG.AMM[network]) {
      promises.push(
        fetchWalletBalance(
          addressOfUser,
          CONFIG.AMM[network][identifier].TOKEN_CONTRACT,
          identifier,
          CONFIG.AMM[network][identifier].READ_TYPE,
          CONFIG.AMM[network][identifier].TOKEN_ID,
          CONFIG.AMM[network][identifier].TOKEN_DECIMAL,
        ),
      );
    }
    const response = await Promise.all(promises);
    const userBalances = {};
    const contractInstances = {};
    for (const i in response) {
      userBalances[response[i].symbol] = response[i].balance;
      contractInstances[response[i].symbol] = response[i].contractInstance;
    }
    return {
      success: true,
      userBalances,
      contractInstances,
    };
  } catch (error) {
    return {
      success: false,
      userBalances: {},
    };
  }
};
/**
 * @deprecated
 */
const getCtezPrice = async () => {
  try {
    const connectedNetwork = CONFIG.NETWORK;
    const rpcNode = CONFIG.RPC_NODES[connectedNetwork];
    // const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[CONFIG.NETWORK];
    const promises = [];
    const cfmmStorageUrl = `${rpcNode}chains/main/blocks/head/context/contracts/KT1H5b7LxEExkFd2Tng77TfuWbM5aPvHstPr/storage`;
    const xtzDollarValueUrl = CONFIG.API.url;
    promises.push(axios.get(cfmmStorageUrl));
    promises.push(axios.get(xtzDollarValueUrl));

    const promisesResponse = await Promise.all(promises);
    const tokenPool = parseFloat(promisesResponse[0].data.args[0].int);
    const cashPool = parseFloat(promisesResponse[0].data.args[1].int);
    const xtzPrice = promisesResponse[1].data.market_data.current_price.usd;
    const ctezPriceInUSD = (cashPool / tokenPool) * xtzPrice;
    return {
      ctezPriceInUSD: ctezPriceInUSD,
    };
    //xtzPriceResponse.data.market_data.current_price.usd;
  } catch (e) {
    console.log({ e });
    return {
      ctezPriceInUSD: 0,
    };
  }
};
/**
 * @deprecated
 */
const getuDEFIPrice = async () => {
  try {
    const connectedNetwork = CONFIG.NETWORK;
    const rpcNode = CONFIG.RPC_NODES[connectedNetwork];
    // const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[CONFIG.NETWORK];

    const uDEFIOracleUrl = `${rpcNode}chains/main/blocks/head/context/contracts/KT1UuqJiGQgfNrTK5tuR1wdYi5jJ3hnxSA55/storage`;
    const uedfipriceResponse = await axios.get(uDEFIOracleUrl);
    let uDEFIinUSD = uedfipriceResponse.data.args[0].args[1].int;
    uDEFIinUSD = parseInt(uDEFIinUSD);
    uDEFIinUSD = parseFloat(uDEFIinUSD / Math.pow(10, 6));
    return {
      uDEFIinUSD,
    };
  } catch (err) {
    console.log({ err });
    return {
      uDEFIinUSD: 0,
    };
  }
};

/**
 * Gets price of agEUR.e from Ethereum chain 
 * Deprecate when token is listed on Tezos exchanges
 */

export const getagEURePrice = async () => {
  try {
  
    const url = 'https://api.angle.money/v1/prices';
    const APIpriceResponse = await axios.get(url);
    const dataObject = APIpriceResponse.data[4];

    let agEUReInUSD = 0;
    if(dataObject.token === 'agEUR'){
      agEUReInUSD = dataObject.rate;
      parseFloat(agEUReInUSD);
      return {agEUReInUSD : agEUReInUSD};
    }
    else{
      for(const x in APIpriceResponse.data){
        if(APIpriceResponse.data[x].token === 'agEUR'){
          agEUReInUSD = APIpriceResponse.data[x].rate;
          parseFloat(agEUReInUSD);
          return {agEUReInUSD : agEUReInUSD};
        }
      }
    }
  } catch (err) {
    console.log({ err });
    return {
      agEUReInUSD: 0,
    };
  }
};
/**
 * Gets price of tokens to show during trade
 */
export const getTokenPrices = async () => {
  try {
    const promises = [];
    promises.push(axios.get('https://api.teztools.io/token/prices'));
    promises.push(getCtezPrice());
    promises.push(getuDEFIPrice());
    promises.push(getagEURePrice());
    const promisesResponse = await Promise.all(promises);
    // let tokenPriceResponse = await axios.get(
    //   'https://api.teztools.io/token/prices'
    // );
    const tokenPrice = {};
    const tokenPriceResponse = promisesResponse[0].data;
    const tokens = [
      'PLENTY',
      'wDAI',
      'WRAP',
      'wWBTC',
      'wUSDC',
      'wBUSD',
      'wMATIC',
      'wLINK',
      'USDtz',
      'kUSD',
      'wWETH',
      'hDAO',
      'ETHtz',
      'QUIPU',
      'UNO',
      'SMAK',
      'KALAM',
      'tzBTC',
      'uUSD',
      'GIF',
      'wUSDT',
      'YOU',
      'PXL',
      'INSTA',
      'crDAO',
      'CRUNCH',
      'FLAME',
      'PAUL',
      'DOGA',
      'EURL',
      'USDt'
    ];
    const tokenAddress = {
      PLENTY: {
        contractAddress: 'KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b',
      },
      WRAP: {
        contractAddress: 'KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd',
      },
      wWBTC: {
        contractAddress: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
      },
      wUSDC: {
        contractAddress: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
      },
      wBUSD: {
        contractAddress: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
      },
      wMATIC: {
        contractAddress: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
      },
      wLINK: {
        contractAddress: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
      },
      wWETH: {
        contractAddress: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
      },
      wDAI: {
        contractAddress: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
      },
      wUSDT: {
        contractAddress: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
      },
      USDtz: {
        contractAddress: 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9',
      },
      kUSD: {
        contractAddress: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
      },
      hDAO: {
        contractAddress: 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW',
      },
      ETHtz: {
        contractAddress: 'KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8',
      },
      QUIPU: {
        contractAddress: 'KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb',
      },
      UNO: {
        contractAddress: 'KT1ErKVqEhG9jxXgUG2KGLW3bNM7zXHX8SDF',
      },
      SMAK: {
        contractAddress: 'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X',
      },
      KALAM: {
        contractAddress: 'KT1A5P4ejnLix13jtadsfV9GCnXLMNnab8UT',
      },
      tzBTC: {
        contractAddress: 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn',
      },
      uUSD: {
        contractAddress: 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW',
      },
      GIF: {
        contractAddress: 'KT1XTxpQvo7oRCqp85LikEZgAZ22uDxhbWJv',
      },
      YOU: {
        contractAddress: 'KT1Xobej4mc6XgEjDoJoHtTKgbD1ELMvcQuL',
      },
      PXL: {
        contractAddress: 'KT1F1mn2jbqQCJcsNgYKVAQjvenecNMY2oPK',
      },
      INSTA: {
        contractAddress: 'KT19y6R8x53uDKiM46ahgguS6Tjqhdj2rSzZ',
      },
      FLAME: {
        contractAddress: 'KT1Wa8yqRBpFCusJWgcQyjhRz7hUQAmFxW7j',
      },
      crDAO: {
        contractAddress: 'KT1XPFjZqCULSnqfKaaYy8hJjeY63UNSGwXg',
      },
      CRUNCH: {
        contractAddress: 'KT1BHCumksALJQJ8q8to2EPigPW6qpyTr7Ng',
      },
      PAUL: {
        contractAddress: 'KT19DUSZw7mfeEATrbWVPHRrWNVbNnmfFAE6',
      },
      DOGA: {
        contractAddress: 'KT1Ha4yFVeyzw6KRAdkzq6TxDHB97KG4pZe8',
      },
      EURL: {
        contractAddress: 'KT1JBNFcB5tiycHNdYGYCtR3kk6JaJysUCi8',
      },
      USDt: {
        contractAddress: 'KT1XnTn74bUtxHfDtBmm2bGZAQfhPbvKWR8o',
      },
    };
    for (const i in tokenPriceResponse.contracts) {
      if (tokens.includes(tokenPriceResponse.contracts[i].symbol)) {
        if (
          tokenAddress[tokenPriceResponse.contracts[i].symbol].contractAddress ===
          tokenPriceResponse.contracts[i].tokenAddress
        ) {
          tokenPrice[tokenPriceResponse.contracts[i].symbol] =
            tokenPriceResponse.contracts[i].usdValue;
        }
      }
    }
    // Depracate once the new tokens come on exchanges
    const connectedNetwork = CONFIG.NETWORK;
    for (const x in CONFIG.WRAPPED_ASSETS[connectedNetwork]) {
      if (
        x === 'DAI.e' ||
        x === 'USDC.e' ||
        x === 'USDT.e' ||
        x === 'LINK.e' ||
        x === 'MATIC.e' ||
        x === 'BUSD.e' ||
        x === 'WETH.e' ||
        x === 'WBTC.e'
      ) {
        tokenPrice[x] = tokenPrice[CONFIG.WRAPPED_ASSETS[connectedNetwork][x].REF_TOKEN];
      }
    }
    tokenPrice['ctez'] = promisesResponse[1].ctezPriceInUSD;
    tokenPrice['uDEFI'] = promisesResponse[2].uDEFIinUSD;
    tokenPrice['agEUR.e'] = promisesResponse[3].agEUReInUSD;
    return {
      success: true,
      tokenPrice,
    };
  } catch (error) {
    console.log({ tokenPriceError: error });
    return {
      success: false,
      tokenPrice: {},
    };
  }
};
export const lpTokenOutput = (
  tokenIn_amount,
  tokenOut_amount,
  tokenIn_supply,
  tokenOut_supply,
  lpTokenSupply,
) => {
  try {
    const lpOutputBasedOnTokenIn = (tokenIn_amount * lpTokenSupply) / tokenIn_supply;
    const lpOutputBasedOnTokenOut = (tokenOut_amount * lpTokenSupply) / tokenOut_supply;
    let estimatedLpOutput = 0;
    estimatedLpOutput =
      lpOutputBasedOnTokenIn < lpOutputBasedOnTokenOut
        ? lpOutputBasedOnTokenIn
        : lpOutputBasedOnTokenOut;
    return {
      estimatedLpOutput,
    };
  } catch (error) {
    return {
      estimatedLpOutput: 0,
    };
  }
};

export const computeOutputBasedOnTokenOutAmount = (
  tokenOut_amount,
  tokenIn_supply,
  tokenOut_supply,
  exchangeFee,
  slippage,
) => {
  try {
    let Invariant = 0;
    let tokenIn_amount = 0;
    Invariant = tokenIn_supply * tokenOut_supply;
    Invariant /= tokenOut_supply - tokenOut_amount;
    tokenIn_amount = Invariant - tokenIn_supply;
    tokenIn_amount = tokenIn_amount / (1 - exchangeFee);

    const fees = tokenIn_amount * exchangeFee;
    const minimum_Out = tokenOut_amount - (slippage * tokenOut_amount) / 100;
    const updated_TokenIn_Supply = tokenIn_supply - tokenIn_amount;
    const updated_TokenOut_Supply = tokenOut_supply - tokenOut_amount;
    let next_tokenOut_Amount = (1 - exchangeFee) * updated_TokenOut_Supply * tokenIn_amount;
    next_tokenOut_Amount /= updated_TokenIn_Supply + (1 - exchangeFee) * tokenIn_amount;

    let priceImpact = (tokenOut_amount - next_tokenOut_Amount) / tokenOut_amount;
    priceImpact = priceImpact * 100;
    priceImpact = priceImpact.toFixed(5);
    priceImpact = Math.abs(priceImpact);
    priceImpact = priceImpact * 100;
    return {
      tokenIn_amount,
      tokenOut_amount,
      fees,
      minimum_Out,
      priceImpact,
    };
  } catch (error) {
    console.log(error);
    return {
      tokenIn_amount: 0,
      tokenOut_amount: 0,
      fees: 0,
      minimum_Out: 0,
      priceImpact: 0,
    };
  }
};
