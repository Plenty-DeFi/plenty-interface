import { TezosMessageUtils, TezosParameterFormat } from 'conseiljs';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { OpKind, TezosToolkit } from '@taquito/taquito';
import { RPC_NODE } from '../../../constants/localStorage';
import CONFIG from '../../../config/config';
import axios from 'axios';
import { getagEURePrice } from '../../../apis/swap/swap';

const { SERVERLESS_BASE_URL, SERVERLESS_REQUEST } = CONFIG;

export const getHomeStatsDataApi = async () => {
  const res = await axios.get(
    SERVERLESS_BASE_URL[CONFIG.NETWORK] + SERVERLESS_REQUEST[CONFIG.NETWORK]['PLENTY-STATS'],
  );
  if (res.data.success) {
    return {
      success: true,
      data: res.data.body,
    };
  } else {
    return {
      success: false,
    };
  }
};

export const getTVLHelper = async () => {
  try {
    const tvlPromises = [];
    tvlPromises.push(
      axios.get(
        SERVERLESS_BASE_URL[CONFIG.NETWORK] + SERVERLESS_REQUEST[CONFIG.NETWORK]['HOME-PAGE-TVL'],
      ),
    );

    const tvlResponses = await Promise.all(tvlPromises);
    let tvl = 0;
    tvl = tvlResponses[0].data.body;
    return {
      success: true,
      data: tvl,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      data: 0,
    };
  }
};

export const calculateHarvestValue = async (
  stakingContractAddress,
  DECIMAL,
  currentBlockLevel,
  mapId,
  packedAddress,
) => {
  try {
    const initialDataPromises = [];

    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[CONFIG.NETWORK];
    let url = `${rpcNode}chains/main/blocks/head/context/contracts/${stakingContractAddress}/storage`;
    initialDataPromises.push(axios.get(url));
    url = `${rpcNode}chains/main/blocks/head/context/big_maps/${mapId}/${packedAddress}`;
    initialDataPromises.push(axios.get(url));
    const initialDataResponse = await Promise.all(initialDataPromises);
    const smartContractResponse = initialDataResponse[0];
    const periodFinish = smartContractResponse.data.args[1].args[0].args[0].int;
    const lastUpdateTime = smartContractResponse.data.args[0].args[2].int;
    const rewardRate = smartContractResponse.data.args[1].args[1].int;
    const totalSupply = smartContractResponse.data.args[3].int;
    const rewardPerTokenStored = smartContractResponse.data.args[1].args[0].args[1].int;
    if (totalSupply === 0) {
      throw 'No One Staked';
    }
    let rewardPerToken = Math.min(currentBlockLevel, parseInt(periodFinish));
    rewardPerToken = rewardPerToken - parseInt(lastUpdateTime);
    rewardPerToken *= parseInt(rewardRate) * Math.pow(10, DECIMAL);
    rewardPerToken = rewardPerToken / totalSupply + parseInt(rewardPerTokenStored);
    url = `${rpcNode}chains/main/blocks/head/context/big_maps/${mapId}/${packedAddress}`;
    const bigMapResponse = initialDataResponse[1];
    const userBalance = bigMapResponse.data.args[0].args[1].int;
    const userRewardPaid = bigMapResponse.data.args[3].int;
    const rewards = bigMapResponse.data.args[2].int;
    let totalRewards = parseInt(userBalance) * (rewardPerToken - parseInt(userRewardPaid));
    totalRewards = totalRewards / Math.pow(10, DECIMAL) + parseInt(rewards);
    totalRewards = totalRewards / Math.pow(10, DECIMAL);
    if (totalRewards < 0) {
      totalRewards = 0;
    }
    return {
      success: true,
      totalRewards,
      address: stakingContractAddress,
    };
  } catch (error) {
    return {
      success: false,
      totalRewards: 0,
      address: stakingContractAddress,
    };
  }
};

const calculateHarvestValueDualEntity = async (
  stakingContractAddress,
  DECIMAL,
  currentBlockLevel,
  mapId,
  packedAddress,
) => {
  try {

    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[CONFIG.NETWORK];
    let url = `${rpcNode}chains/main/blocks/head/context/contracts/${stakingContractAddress}/storage`;
    const smartContractResponse = await axios.get(url);
    if (stakingContractAddress === 'KT1PxZCPGoxukDXq1smJcmQcLiadTB6czjCY') {

      const periodFinish = smartContractResponse.data.args[1].args[1].int;

      const lastUpdateTime = smartContractResponse.data.args[0].args[2].int;

      const rewardRate = smartContractResponse.data.args[3].int;

      const totalSupply = smartContractResponse.data.args[4].int;

      const rewardPerTokenStored = smartContractResponse.data.args[2].int;

      if (totalSupply === 0) {
        throw 'No One Staked';
      }

      let rewardPerToken = Math.min(currentBlockLevel, parseInt(periodFinish));
      rewardPerToken = rewardPerToken - parseInt(lastUpdateTime);
      rewardPerToken *= parseInt(rewardRate) * Math.pow(10, 6);
      rewardPerToken = rewardPerToken / totalSupply + parseInt(rewardPerTokenStored);

      url = `${rpcNode}chains/main/blocks/head/context/big_maps/${mapId}/${packedAddress}`;
      const bigMapResponse = await axios.get(url);
      const userBalance = bigMapResponse.data.args[0].int;
      const userRewardPaid = bigMapResponse.data.args[2].int;
      const rewards = bigMapResponse.data.args[1].int;

      let totalRewards = parseInt(userBalance) * (rewardPerToken - parseInt(userRewardPaid));
      totalRewards = totalRewards / Math.pow(10, 6) + parseInt(rewards);
      totalRewards = totalRewards / Math.pow(10, 6);


      if (totalRewards < 0) {
        totalRewards = 0;
      }
      return {
        success: true,
        totalRewards: totalRewards,
        address: stakingContractAddress,
      };
    }

    if (stakingContractAddress === 'KT1QkadMTUTDxyNiTaz587ssPXFuwmWWQzDG') {
      const periodFinish = smartContractResponse.data.args[1].args[1].int;

      const lastUpdateTime = smartContractResponse.data.args[0].args[3].int;

      const rewardRate = smartContractResponse.data.args[2].int;

      const totalSupply = smartContractResponse.data.args[4].int;

      const rewardPerTokenStored = smartContractResponse.data.args[1].args[2].int;

      if (totalSupply === 0) {
        throw 'No One Staked';
      }

      let rewardPerToken = Math.min(currentBlockLevel, parseInt(periodFinish));
      rewardPerToken = rewardPerToken - parseInt(lastUpdateTime);
      rewardPerToken *= parseInt(rewardRate) * Math.pow(10, DECIMAL);
      rewardPerToken = rewardPerToken / totalSupply + parseInt(rewardPerTokenStored);

      url = `${rpcNode}chains/main/blocks/head/context/big_maps/${mapId}/${packedAddress}`;
      const bigMapResponse = await axios.get(url);
      const userBalance = bigMapResponse.data.args[0].int;
      const userRewardPaid = bigMapResponse.data.args[2].int;
      const rewards = bigMapResponse.data.args[1].int;

      let totalRewards = parseInt(userBalance) * (rewardPerToken - parseInt(userRewardPaid));
      totalRewards = totalRewards / Math.pow(10, DECIMAL) + parseInt(rewards);
      totalRewards = totalRewards / Math.pow(10, DECIMAL);

      if (totalRewards < 0) {
        totalRewards = 0;
      }
      return {
        success: true,
        totalRewards,
        address: stakingContractAddress,
      };
    } else {
      const periodFinish = smartContractResponse.data.args[1].args[0].int;

      const lastUpdateTime = smartContractResponse.data.args[0].args[2].int;

      const rewardRate = smartContractResponse.data.args[1].args[2].int;

      const totalSupply = smartContractResponse.data.args[4].int;

      const rewardPerTokenStored = smartContractResponse.data.args[1].args[1].int;

      if (totalSupply === 0) {
        throw 'No One Staked';
      }

      let rewardPerToken = Math.min(currentBlockLevel, parseInt(periodFinish));
      rewardPerToken = rewardPerToken - parseInt(lastUpdateTime);
      rewardPerToken *= parseInt(rewardRate) * Math.pow(10, DECIMAL);
      rewardPerToken = rewardPerToken / totalSupply + parseInt(rewardPerTokenStored);
      url = `${rpcNode}chains/main/blocks/head/context/big_maps/${mapId}/${packedAddress}`;
      const bigMapResponse = await axios.get(url);

      const userBalance = bigMapResponse.data.args[0].int;
      const userRewardPaid = bigMapResponse.data.args[2].int;
      const rewards = bigMapResponse.data.args[1].int;
      let totalRewards = parseInt(userBalance) * (rewardPerToken - parseInt(userRewardPaid));
      totalRewards = totalRewards / Math.pow(10, DECIMAL) + parseInt(rewards);
      totalRewards = totalRewards / Math.pow(10, DECIMAL);

      if (totalRewards < 0) {
        totalRewards = 0;
      }
      return {
        success: true,
        totalRewards,
        address: stakingContractAddress,
      };
    }
  } catch (error) {
    return {
      success: false,
      totalRewards: 0,
      address: stakingContractAddress,
    };
  }
};

const calculateHarvestValueDual = async (
  stakingContract,
  dualInfo,
  currentBlock,
  packedAddress,
) => {
  try {
    const harvestValuePromises = [];

    harvestValuePromises.push(
      calculateHarvestValueDualEntity(
        dualInfo.tokenFirst.rewardContract,
        dualInfo.tokenFirst.tokenDecimal,
        currentBlock,
        dualInfo.tokenFirst.rewardMapId,
        packedAddress,
      ),
    );

    harvestValuePromises.push(
      calculateHarvestValueDualEntity(
        dualInfo.tokenSecond.rewardContract,
        dualInfo.tokenSecond.tokenDecimal,
        currentBlock,
        dualInfo.tokenSecond.rewardMapId,
        packedAddress,
      ),
    );


    const harvestValueResponse = await Promise.all(harvestValuePromises);
    return {
      success: true,
      totalRewards: [harvestValueResponse[0].totalRewards, harvestValueResponse[1].totalRewards],
      address: stakingContract,
    };
  } catch (error) {
    return {
      success: false,
      totalRewards: [0, 0],
      address: stakingContract,
    };
  }
};

export const getPackedKey = (tokenId, address, type) => {
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

export const getHarvestValue = async (address, type, isActive) => {
  try {
    const packedKey = getPackedKey(0, address, 'FA1.2');
    const blockData = await axios.get(`${CONFIG.TZKT_NODES[CONFIG.NETWORK]}/v1/blocks/count`);
    const promises = [];
    const harvestResponse = {};
    for (const identifier in CONFIG.STAKING_CONTRACTS[type][CONFIG.NETWORK]) {
      for (const i in CONFIG.STAKING_CONTRACTS[type][CONFIG.NETWORK][identifier][
        isActive === true ? 'active' : 'inactive'
      ]) {
        if (identifier === 'PLENTY - GIF' || identifier === 'CTEZ - TEZ') {
          promises.push(
            calculateHarvestValueDual(
              CONFIG.STAKING_CONTRACTS[type][CONFIG.NETWORK][identifier][
                isActive === true ? 'active' : 'inactive'
              ][i].address,
              CONFIG.STAKING_CONTRACTS[type][CONFIG.NETWORK][identifier][
                isActive === true ? 'active' : 'inactive'
              ][i].dualInfo,
              blockData.data,
              packedKey,
            ),
          );
        } else {
          promises.push(
            calculateHarvestValue(
              CONFIG.STAKING_CONTRACTS[type][CONFIG.NETWORK][identifier][
                isActive === true ? 'active' : 'inactive'
              ][i].address,
              CONFIG.STAKING_CONTRACTS[type][CONFIG.NETWORK][identifier][
                isActive === true ? 'active' : 'inactive'
              ][i].decimal,
              blockData.data,
              CONFIG.STAKING_CONTRACTS[type][CONFIG.NETWORK][identifier][
                isActive === true ? 'active' : 'inactive'
              ][i].mapId,
              packedKey,
            ),
          );
        }
      }
    }
    const response = await Promise.all(promises);

    for (const i in response) {
      if (Array.isArray(response[i].totalRewards)) {
        harvestResponse[response[i].address] = {
          totalRewards: response[i].totalRewards[0],
        };
      } else {
        harvestResponse[response[i].address] = {
          totalRewards: response[i].totalRewards,
        };
      }
    }
    return {
      success: true,
      response: harvestResponse,
    };
  } catch (error) {
    return {
      success: false,
      response: {},
    };
  }
};

export const getBalanceAmount = async (mapId, packedKey, identifier, decimal) => {
  try {
    let balance;
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[CONFIG.NETWORK];
    const url = `${rpcNode}chains/main/blocks/head/context/big_maps/${mapId}/${packedKey}`;
    const response = await axios.get(url);
    if (mapId === 3956 || mapId === 4353) {
      balance = response.data.args[0].args[1].int;
    } else if (mapId === 3943) {
      balance = response.data.args[1].int;
    } else if (mapId === 199 || mapId === 36) {
      balance = response.data.args[0].int;
    } else if (
      mapId === 1777 ||
      mapId === 1772 ||
      mapId === 515 ||
      mapId === 4178 ||
      mapId === 18153
    ) {
      balance = response.data.int;
    }

    balance = parseInt(balance);
    balance = balance / Math.pow(10, decimal);

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

const CheckIfWalletConnected = async (wallet) => {
  try {
    const connectedNetwork = CONFIG.NETWORK;
    const network = {
      type: connectedNetwork,
    };
    const activeAccount = await wallet.client.getActiveAccount();
    if (!activeAccount) {
      await wallet.client.requestPermissions({
        network,
      });
    }
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

const getAllActiveContractAddresses = async () => {
  const contracts = [];
  const connectedNetwork = CONFIG.NETWORK;
  for (const x in CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork]) {
    if (CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][x]['active'].length > 0) {
      for (const y in CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][x]['active']) {
        contracts.push({
          contract: CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][x]['active'][y]['address'],
          mapId: CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][x]['active'][y]['mapId'],
          dualInfo: CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][x]['active'][y]['dualInfo'],
          x: x,
        });
      }
    }
  }
  return contracts;
};

const getAllInactiveContractAddresses = async () => {
  const contracts = [];
  const connectedNetwork = CONFIG.NETWORK;
  for (const x in CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork]) {
    if (CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][x]['inactive'].length > 0) {
      for (const y in CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][x]['inactive']) {
        contracts.push({
          contract: CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][x]['inactive'][y]['address'],
          mapId: CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][x]['inactive'][y]['mapId'],
          dualInfo: CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][x]['inactive'][y]['dualInfo'],
          x: x,
        });
      }
    }
  }
  return contracts;
};

const getLpPriceFromDex = async (identifier, dexAddress) => {
  try {
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[CONFIG.NETWORK];
    const response = await axios.get(
      `${rpcNode}chains/main/blocks/head/context/contracts/${dexAddress}/storage`,
    );
    const tez_pool = parseInt(response.data.args[1].args[0].args[1].args[2].int);
    let total_Supply = null;
    if (identifier === 'PLENTY - XTZ') {
      total_Supply = parseInt(response.data.args[1].args[0].args[4].int);
    } else {
      total_Supply = parseInt(response.data.args[1].args[1].args[0].args[0].int);
    }
    const lpPriceInXtz = (tez_pool * 2) / total_Supply;
    return {
      success: true,
      identifier,
      lpPriceInXtz,
      tez_pool,
      total_Supply,
      dexAddress,
    };
  } catch (error) {
    return {
      success: false,
      identifier,
      lpPriceInXtz: 0,
    };
  }
};

export const getStorageForFarms = async (isActive, tokenPricesData) => {
  try {
    const dexPromises = [];
    const initialDataPromises = [];
    initialDataPromises.push(axios.get(CONFIG.API.url));
    const initialDataResponse = await Promise.all(initialDataPromises);
    const xtzPriceResponse = initialDataResponse[0];
    const xtzPriceInUsd = xtzPriceResponse.data.market_data.current_price.usd;
    let priceOfPlenty = 0;
    for (const i in tokenPricesData) {
      if (
        tokenPricesData[i].symbol === 'PLENTY' &&
        tokenPricesData[i].tokenAddress === 'KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b'
      ) {
        // eslint-disable-next-line no-unused-vars
        priceOfPlenty = tokenPricesData[i].usdValue;
      }
    }

    for (const key in CONFIG.FARMS[CONFIG.NETWORK]) {
      for (const key1 in CONFIG.FARMS[CONFIG.NETWORK][key][isActive]) {
        if (key === 'PLENTY - XTZ' || key === 'KALAM - XTZ') {
          dexPromises.push(
            getLpPriceFromDex(key, CONFIG.FARMS[CONFIG.NETWORK][key][isActive][key1].DEX),
          );
        } else if (
          key === 'PLENTY - wBUSD' ||
          key === 'PLENTY - wUSDC' ||
          key === 'PLENTY - wWBTC' ||
          key === 'PLENTY - wMATIC' ||
          key === 'PLENTY - wLINK' ||
          key === 'PLENTY - USDtz' ||
          key === 'PLENTY - hDAO' ||
          key === 'PLENTY - ETHtz' ||
          key === 'PLENTY - wWETH' ||
          key === 'PLENTY - kUSD' ||
          key === 'PLENTY - QUIPU' ||
          key === 'PLENTY - KALAM' ||
          key === 'PLENTY - SMAK' ||
          key === 'PLENTY - UNO' ||
          key === 'PLENTY - WRAP' ||
          key === 'PLENTY - tzBTC' ||
          key === 'PLENTY - uUSD' ||
          key === 'PLENTY - GIF' ||
          key === 'PLENTY - YOU' ||
          key === 'PLENTY - wDAI' ||
          key === 'PLENTY - wUSDT' ||
          key === 'PLENTY - cTez' ||
          key === 'uUSD - YOU' ||
          key === 'uUSD - wUSDC' ||
          key === 'uUSD - uDEFI' ||
          key === 'ctez - kUSD' ||
          key === 'ctez - USDtz' ||
          key === 'ctez - wUSDT' ||
          key === 'ctez - wBUSD' ||
          key === 'ctez - wUSDC' ||
          key === 'ctez - wDAI' ||
          key === 'ctez - KALAM' ||
          key === 'ctez - GIF' ||
          key === 'ctez - ETHtz' ||
          key === 'ctez - QUIPU' ||
          key === 'ctez - hDAO' ||
          key === 'ctez - kDAO' ||
          key === 'ctez - wWETH' ||
          key === 'ctez - uUSD' ||
          key === 'ctez - FLAME' ||
          key === 'ctez - SMAK' ||
          key === 'ctez - crDAO' ||
          key === 'ctez - PXL' ||
          key === 'ctez - UNO' ||
          key === 'ctez - WRAP' ||
          key === 'ctez - wWBTC' ||
          key === 'ctez - tzBTC' ||
          key === 'ctez - PAUL' ||
          key === 'ctez - INSTA' ||
          key === 'ctez - CRUNCH' ||
          key === 'CTEZ - DOGA' ||
          key === 'CTEZ - TEZ' ||
          key === 'WBTC.e - CTEZ' ||
          key === 'USDC.e - CTEZ' ||
          key === 'kUSD - USDC.e' ||
          key === 'uUSD - USDC.e' ||
          key === 'tzBTC - WBTC.e' ||
          key === 'DAI.e - USDC.e' ||
          key === 'ETHtz - WETH.e' ||
          key === 'MATIC.e - CTEZ' ||
          key === 'WETH.e - CTEZ' ||
          key === 'LINK.e - CTEZ' ||
          key === 'USDtz - USDC.e' ||
          key === 'USDT.e - USDC.e' ||
          key === 'EURL - agEUR.e' ||
          key === 'uUSD - USDt' ||
          key === 'kUSD - USDt'
        ) {
          dexPromises.push(
            getPriceForPlentyLpTokens(
              key,
              CONFIG.FARMS[CONFIG.NETWORK][key][isActive][key1].TOKEN_DECIMAL,
              CONFIG.FARMS[CONFIG.NETWORK][key][isActive][key1].DEX,
              tokenPricesData,
            ),
          );
        }
      }
    }
    const response = await Promise.all(dexPromises);
    const lpPricesInUsd = {};
    for (const i in response) {
      if (response[i].lpPriceInXtz * xtzPriceInUsd) {
        lpPricesInUsd[response[i].identifier] = response[i].lpPriceInXtz * xtzPriceInUsd;
      } else {
        lpPricesInUsd[response[i].identifier] = response[i].totalAmount;
      }
    }
    return {
      success: true,
      priceOfLPToken: lpPricesInUsd,
    };
  } catch (error) {
    return {
      success: false,
      response: {},
    };
  }
};

const getCtezPrice = async () => {
  try {
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[CONFIG.NETWORK];
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

const getPriceForPlentyLpTokens = async (
  identifier,
  lpTokenDecimal,
  dexAddress,
  tokenPricesData,
) => {
  try {
    const storageResponse = await axios.get(
      CONFIG.RPC_NODES[CONFIG.NETWORK] +
        `/chains/main/blocks/head/context/contracts/${dexAddress}/storage`,
    );
    if (identifier === 'CTEZ - TEZ') {
      // do remodelling changes for ctez-tez
      // token1 - tez, token2 - ctez

      const token1Pool = parseInt(storageResponse.data.args[2].args[1].int);

      const token2Pool = parseInt(storageResponse.data.args[0].args[1].args[0].int);

      const lpTokenTotalSupply = parseInt(storageResponse.data.args[0].args[4].int);

      const promises = [];

      const ctezPriceInUSD = await getCtezPrice();

      const xtzDollarValueUrl = CONFIG.API.url;

      promises.push(axios.get(xtzDollarValueUrl));

      const promisesResponse = await Promise.all(promises);
      const xtzPrice = promisesResponse[0].data.market_data.current_price.usd;

      let token1Amount = (Math.pow(10, 6) * token1Pool) / lpTokenTotalSupply;

      token1Amount = (token1Amount * xtzPrice) / Math.pow(10, 6);

      let token2Amount = (Math.pow(10, 6) * token2Pool) / lpTokenTotalSupply;
      token2Amount = (token2Amount * ctezPriceInUSD.ctezPriceInUSD) / Math.pow(10, 6);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);

      return {
        success: true,
        identifier,
        totalAmount,
      };
    } else if (identifier === 'CTEZ - DOGA') {
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      // token1Pool = token1Pool / Math.pow(10, 12);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[4].int);

      const token1Address = 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4';
      //const token1Check = 'False';

      const token2Address = 'KT1Ha4yFVeyzw6KRAdkzq6TxDHB97KG4pZe8';
      const token2Id = 0;
      const token2Check = 'False';

      const tokenData = {};

      if (token1Address === 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4') {
        const ctezPriceInUSD = await getCtezPrice();
        tokenData['token1'] = {
          tokenName: 'ctez',
          tokenValue: ctezPriceInUSD.ctezPriceInUSD,
          tokenDecimal: 6,
        };
      }

      //let token1Type;
      let token2Type;
      if (token2Check.match('True')) {
        token2Type = 'fa2';
      } else {
        token2Type = 'fa1.2';
      }

      for (const i in tokenPricesData) {
        if (token2Type === 'fa2') {
          if (
            tokenPricesData[i].tokenAddress === token2Address &&
            tokenPricesData[i].type === token2Type &&
            tokenPricesData[i].tokenId === token2Id
          ) {
            tokenData['token2'] = {
              tokenName: tokenPricesData[i].symbol,
              tokenValue: tokenPricesData[i].usdValue,
              tokenDecimal: tokenPricesData[i].decimals,
            };
          }
        } else if (token2Type === 'fa1.2') {
          if (
            tokenPricesData[i].tokenAddress === token2Address &&
            tokenPricesData[i].type === token2Type
          ) {
            tokenData['token2'] = {
              tokenName: tokenPricesData[i].symbol,
              tokenValue: tokenPricesData[i].usdValue,
              tokenDecimal: tokenPricesData[i].decimals,
            };
          }
        }
      }

      let token1Amount = (Math.pow(10, 5) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      let token2Amount = (Math.pow(10, 5) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);
      const totalAmount = (token1Amount + token2Amount).toFixed(2);

      return {
        success: true,
        identifier,
        totalAmount,
      };
    } else if (identifier === 'USDC.e - CTEZ') {
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[4].int);
      const token1Address = 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4';
      //const token1Check = 'False';
      // const token2Address = 'KT1UsSfaXyqcjSVPeiD7U1bWgKy3taYN7NWY';
      // const token2Id = 2;
      // const token2Check = 'True';

      const tokenData = {};

      if (token1Address === 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4') {
        const ctezPriceInUSD = await getCtezPrice();
        tokenData['token1'] = {
          tokenName: 'ctez',
          tokenValue: ctezPriceInUSD.ctezPriceInUSD,
          tokenDecimal: 6,
        };
      }
      //let token1Type;
      // let token2Type;

      // if (token1Check.match('True')) {
      //   token1Type = 'fa2';
      // } else {
      //   token1Type = 'fa1.2';
      // }
      // if (token2Check.match('True')) {
      //   token2Type = 'fa2';
      // } else {
      //   token2Type = 'fa1.2';
      // }
      let idx = 0;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'wUSDC') {
          idx = x;
        }
      }
      tokenData['token2'] = {
        tokenName: 'USDC.e',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 6,
      };
      // for (const i in tokenPricesData) {
      //   if (token2Type === 'fa2') {
      //     if (
      //       tokenPricesData[i].tokenAddress === token2Address &&
      //       tokenPricesData[i].type === token2Type &&
      //       tokenPricesData[i].tokenId === token2Id
      //     ) {
      //       tokenData['token2'] = {
      //         tokenName: tokenPricesData[i].symbol,
      //         tokenValue: tokenPricesData[i].usdValue,
      //         tokenDecimal: tokenPricesData[i].decimals,
      //       };
      //     }
      //   } else if (token2Type === 'fa1.2') {
      //     if (
      //       tokenPricesData[i].tokenAddress === token2Address &&
      //       tokenPricesData[i].type === token2Type
      //     ) {
      //       tokenData['token2'] = {
      //         tokenName: tokenPricesData[i].symbol,
      //         tokenValue: tokenPricesData[i].usdValue,
      //         tokenDecimal: tokenPricesData[i].decimals,
      //       };
      //     }
      //   }
      // }

      let token1Amount = (Math.pow(10, 6) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      let token2Amount = (Math.pow(10, 6) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);
      const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };
    } else if (identifier === 'WBTC.e - CTEZ') {
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[4].int);

      const token1Address = 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4';
      // const token2Check = 'True';

      const tokenData = {};

      if (token1Address === 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4') {
        const ctezPriceInUSD = await getCtezPrice();
        tokenData['token1'] = {
          tokenName: 'ctez',
          tokenValue: ctezPriceInUSD.ctezPriceInUSD,
          tokenDecimal: 6,
        };
      }

      //let token1Type;
      // let token2Type;

      // if (token1Check.match('True')) {
      //   token1Type = 'fa2';
      // } else {
      //   token1Type = 'fa1.2';
      // }
      // if (token2Check.match('True')) {
      //   token2Type = 'fa2';
      // } else {
      //   token2Type = 'fa1.2';
      // }
      let idx = 0;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'wWBTC') {
          idx = x;
        }
      }

      tokenData['token2'] = {
        tokenName: 'WBTC.e',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 8,
      };
      // for (const i in tokenPricesData) {
      //   if (token2Type === 'fa2') {
      //     if (
      //       tokenPricesData[i].tokenAddress === token2Address &&
      //       tokenPricesData[i].type === token2Type &&
      //       tokenPricesData[i].tokenId === token2Id
      //     ) {
      //       tokenData['token2'] = {
      //         tokenName: tokenPricesData[i].symbol,
      //         tokenValue: tokenPricesData[i].usdValue,
      //         tokenDecimal: tokenPricesData[i].decimals,
      //       };
      //     }
      //   } else if (token2Type === 'fa1.2') {
      //     if (
      //       tokenPricesData[i].tokenAddress === token2Address &&
      //       tokenPricesData[i].type === token2Type
      //     ) {
      //       tokenData['token2'] = {
      //         tokenName: tokenPricesData[i].symbol,
      //         tokenValue: tokenPricesData[i].usdValue,
      //         tokenDecimal: tokenPricesData[i].decimals,
      //       };
      //     }
      //   }
      // }

      let token1Amount = (Math.pow(10, 7) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      let token2Amount = (Math.pow(10, 7) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);
      const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };
    }else if (identifier === 'WETH.e - CTEZ') {
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[4].int);

      const token1Address = 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4';
      // const token2Check = 'True';

      const tokenData = {};

      if (token1Address === 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4') {
        const ctezPriceInUSD = await getCtezPrice();
        tokenData['token1'] = {
          tokenName: 'ctez',
          tokenValue: ctezPriceInUSD.ctezPriceInUSD,
          tokenDecimal: 6,
        };
      }

      //let token1Type;
      // let token2Type;

      // if (token1Check.match('True')) {
      //   token1Type = 'fa2';
      // } else {
      //   token1Type = 'fa1.2';
      // }
      // if (token2Check.match('True')) {
      //   token2Type = 'fa2';
      // } else {
      //   token2Type = 'fa1.2';
      // }
      let idx = 0;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'wWETH') {
          idx = x;
        }
      }

      tokenData['token2'] = {
        tokenName: 'WETH.e',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 18,
      };
      // for (const i in tokenPricesData) {
      //   if (token2Type === 'fa2') {
      //     if (
      //       tokenPricesData[i].tokenAddress === token2Address &&
      //       tokenPricesData[i].type === token2Type &&
      //       tokenPricesData[i].tokenId === token2Id
      //     ) {
      //       tokenData['token2'] = {
      //         tokenName: tokenPricesData[i].symbol,
      //         tokenValue: tokenPricesData[i].usdValue,
      //         tokenDecimal: tokenPricesData[i].decimals,
      //       };
      //     }
      //   } else if (token2Type === 'fa1.2') {
      //     if (
      //       tokenPricesData[i].tokenAddress === token2Address &&
      //       tokenPricesData[i].type === token2Type
      //     ) {
      //       tokenData['token2'] = {
      //         tokenName: tokenPricesData[i].symbol,
      //         tokenValue: tokenPricesData[i].usdValue,
      //         tokenDecimal: tokenPricesData[i].decimals,
      //       };
      //     }
      //   }
      // }

      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);

      // let token1Amount = (Math.pow(10, 7) * token1Pool) / lpTokenTotalSupply;
      // token1Amount =
      //   (token1Amount * tokenData['token2'].tokenValue) /
      //   Math.pow(10, tokenData['token2'].tokenDecimal);

      // let token2Amount = (Math.pow(10, 7) * token2Pool) / lpTokenTotalSupply;
      // token2Amount =
      //   (token2Amount * tokenData['token1'].tokenValue) /
      //   Math.pow(10, tokenData['token1'].tokenDecimal);
      // const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };
    } 
    else if (identifier === 'MATIC.e - CTEZ') {
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[4].int);

      const token1Address = 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4';
      // const token2Check = 'True';

      const tokenData = {};

      if (token1Address === 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4') {
        const ctezPriceInUSD = await getCtezPrice();
        tokenData['token1'] = {
          tokenName: 'ctez',
          tokenValue: ctezPriceInUSD.ctezPriceInUSD,
          tokenDecimal: 6,
        };
      }

      //let token1Type;
      // let token2Type;

      // if (token1Check.match('True')) {
      //   token1Type = 'fa2';
      // } else {
      //   token1Type = 'fa1.2';
      // }
      // if (token2Check.match('True')) {
      //   token2Type = 'fa2';
      // } else {
      //   token2Type = 'fa1.2';
      // }
      let idx = 0;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'wMATIC') {
          idx = x;
        }
      }

      tokenData['token2'] = {
        tokenName: 'MATIC.e',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 18,
      };
      // for (const i in tokenPricesData) {
      //   if (token2Type === 'fa2') {
      //     if (
      //       tokenPricesData[i].tokenAddress === token2Address &&
      //       tokenPricesData[i].type === token2Type &&
      //       tokenPricesData[i].tokenId === token2Id
      //     ) {
      //       tokenData['token2'] = {
      //         tokenName: tokenPricesData[i].symbol,
      //         tokenValue: tokenPricesData[i].usdValue,
      //         tokenDecimal: tokenPricesData[i].decimals,
      //       };
      //     }
      //   } else if (token2Type === 'fa1.2') {
      //     if (
      //       tokenPricesData[i].tokenAddress === token2Address &&
      //       tokenPricesData[i].type === token2Type
      //     ) {
      //       tokenData['token2'] = {
      //         tokenName: tokenPricesData[i].symbol,
      //         tokenValue: tokenPricesData[i].usdValue,
      //         tokenDecimal: tokenPricesData[i].decimals,
      //       };
      //     }
      //   }
      // }


      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);

      // let token1Amount = (Math.pow(10, 7) * token1Pool) / lpTokenTotalSupply;
      // token1Amount =
      //   (token1Amount * tokenData['token2'].tokenValue) /
      //   Math.pow(10, tokenData['token2'].tokenDecimal);

      // let token2Amount = (Math.pow(10, 7) * token2Pool) / lpTokenTotalSupply;
      // token2Amount =
      //   (token2Amount * tokenData['token1'].tokenValue) /
      //   Math.pow(10, tokenData['token1'].tokenDecimal);
      // const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };
    } 
    else if (identifier === 'LINK.e - CTEZ') {
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[4].int);

      const token1Address = 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4';
      // const token2Check = 'True';

      const tokenData = {};

      if (token1Address === 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4') {
        const ctezPriceInUSD = await getCtezPrice();
        tokenData['token1'] = {
          tokenName: 'ctez',
          tokenValue: ctezPriceInUSD.ctezPriceInUSD,
          tokenDecimal: 6,
        };
      }

      //let token1Type;
      // let token2Type;

      // if (token1Check.match('True')) {
      //   token1Type = 'fa2';
      // } else {
      //   token1Type = 'fa1.2';
      // }
      // if (token2Check.match('True')) {
      //   token2Type = 'fa2';
      // } else {
      //   token2Type = 'fa1.2';
      // }
      let idx = 0;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'wLINK') {
          idx = x;
        }
      }

      tokenData['token2'] = {
        tokenName: 'LINK.e',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 18,
      };

      const connectedNetwork = CONFIG.NETWORK;
      const liquidityToken = CONFIG.AMM[connectedNetwork][tokenData['token1'].tokenName].DEX_PAIRS[tokenData['token2'].tokenName].liquidityToken;
      const lpTokenDecimal = CONFIG.AMM[connectedNetwork][liquidityToken].TOKEN_DECIMAL;

      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);

      // let token1Amount = (Math.pow(10, 7) * token1Pool) / lpTokenTotalSupply;
      // token1Amount =
      //   (token1Amount * tokenData['token2'].tokenValue) /
      //   Math.pow(10, tokenData['token2'].tokenDecimal);

      // let token2Amount = (Math.pow(10, 7) * token2Pool) / lpTokenTotalSupply;
      // token2Amount =
      //   (token2Amount * tokenData['token1'].tokenValue) /
      //   Math.pow(10, tokenData['token1'].tokenDecimal);
      // const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };
    } 
    else if (identifier === 'uUSD - USDC.e' || identifier === 'kUSD - USDC.e') {
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[0].args[0].args[2].int); 


      const tokenData = {};


      if (identifier === 'uUSD - USDC.e') {
        let idx = 0;
        for (const x in tokenPricesData) {
          if (tokenPricesData[x].symbol === 'uUSD') {
            idx = x;
          }
        }
        tokenData['token1'] = {
          tokenName: 'uUSD',
          tokenValue: tokenPricesData[idx].usdValue,
          tokenDecimal: 12,
        };
      }

      else if (identifier === 'kUSD - USDC.e') {
        let idx = 0;
        for (const x in tokenPricesData) {
          if (tokenPricesData[x].symbol === 'kUSD') {
            idx = x;
          }
        }
        tokenData['token1'] = {
          tokenName: 'kUSD',
          tokenValue: tokenPricesData[idx].usdValue,
          tokenDecimal: 18,
        };
      }


      let idx = 0;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'wUSDC') {
          idx = x;
        }
      }

      tokenData['token2'] = {
        tokenName: 'USDC.e',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 6,
      };

      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };
    }
    else if (identifier === 'tzBTC - WBTC.e'){
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[0].args[0].args[2].int); 

      const tokenData = {};



      let idx = 0;
      let idx2 = 0 ;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'tzBTC') {
          idx = x;
        }
        if(tokenPricesData[x].symbol === 'wWBTC'){
          idx2=x;
        }
      }

      tokenData['token1'] = {
        tokenName: 'tzBTC',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 8,
      };

      tokenData['token2'] = {
        tokenName: 'WBTC.e',
        tokenValue: tokenPricesData[idx2].usdValue,
        tokenDecimal: 8,
      };

      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };

    }
    else if (identifier === 'DAI.e - USDC.e'){
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[0].args[0].args[2].int); 

      const tokenData = {};



      let idx = 0;
      let idx2 = 0 ;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'wDAI') {
          idx = x;
        }
        if(tokenPricesData[x].symbol === 'wUSDC'){
          idx2=x;
        }
      }
      tokenData['token1'] = {
        tokenName: 'USDC.e',
        tokenValue: tokenPricesData[idx2].usdValue,
        tokenDecimal: 6,
      };
      tokenData['token2'] = {
        tokenName: 'DAI.e',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 18,
      };

      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };

    }
    else if (identifier === 'ETHtz - WETH.e'){
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[0].args[0].args[2].int); 

      const tokenData = {};



      let idx = 0;
      let idx2 = 0 ;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'ETHtz') {
          idx = x;
        }
        if(tokenPricesData[x].symbol === 'wWETH'){
          idx2=x;
        }
      }

      tokenData['token1'] = {
        tokenName: 'ETHtz',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 18,
      };

      tokenData['token2'] = {
        tokenName: 'WETH.e',
        tokenValue: tokenPricesData[idx2].usdValue,
        tokenDecimal: 18,
      };

      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };

    }   
    else if (identifier === 'USDtz - USDC.e'){
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[0].args[0].args[2].int); 

      const tokenData = {};



      let idx = 0;
      let idx2 = 0 ;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'USDtz') {
          idx = x;
        }
        if(tokenPricesData[x].symbol === 'wUSDC'){
          idx2=x;
        }
      }

      tokenData['token1'] = {
        tokenName: 'USDtz',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 6,
      };

      tokenData['token2'] = {
        tokenName: 'USDC.e',
        tokenValue: tokenPricesData[idx2].usdValue,
        tokenDecimal: 6,
      };

      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };
    }
    else if (identifier === 'EURL - agEUR.e'){
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[0].args[0].args[2].int); 

      const tokenData = {};

      let idx;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'EURL') {
          idx = x;
        }
      }

      tokenData['token1'] = {
        tokenName: 'EURL',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 6,
      };

      const agEure = await getagEURePrice();


      tokenData['token2'] = {
        tokenName: 'agEUR.e',
        tokenValue: agEure.agEUReInUSD,
        tokenDecimal: 18,
      };


      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };
    }
    else if (identifier === 'kUSD - USDt'){
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[0].args[0].args[2].int); 
      
      const tokenData = {};

      let idx;
      let idx2;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'kUSD') {
          idx = x;
        }
        if (tokenPricesData[x].symbol === 'USDt') {
          idx2 = x;
        }
        
      }

      tokenData['token1'] = {
        tokenName: 'kUSD',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 18,
      };

      tokenData['token2'] = {
        tokenName: 'USDt',
        tokenValue: tokenPricesData[idx2].usdValue,
        tokenDecimal: 6,
      };

      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;

      token1Amount =
        (token1Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;

      token2Amount =
        (token2Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };
    }
    else if (identifier === 'uUSD - USDt'){
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[0].args[0].args[2].int); 
      
      const tokenData = {};

      let idx;
      let idx2;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'uUSD') {
          idx = x;
        }
        if (tokenPricesData[x].symbol === 'USDt') {
          idx2 = x;
        }
        
      }

      tokenData['token1'] = {
        tokenName: 'uUSD',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 12,
      };

      tokenData['token2'] = {
        tokenName: 'USDt',
        tokenValue: tokenPricesData[idx2].usdValue,
        tokenDecimal: 6,
      };

      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;

      token1Amount =
        (token1Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;

      token2Amount =
        (token2Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };
    }
    else if (identifier === 'USDT.e - USDC.e'){
      const token1Pool = parseInt(storageResponse.data.args[1].args[0].args[1].int);
      const token2Pool = parseInt(storageResponse.data.args[3].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[0].args[0].args[2].int); 

      const tokenData = {};



      let idx = 0;
      let idx2 = 0 ;
      for (const x in tokenPricesData) {
        if (tokenPricesData[x].symbol === 'wUSDT') {
          idx = x;
        }
        if(tokenPricesData[x].symbol === 'wUSDC'){
          idx2=x;
        }
      }

      tokenData['token1'] = {
        tokenName: 'USDT.e',
        tokenValue: tokenPricesData[idx].usdValue,
        tokenDecimal: 6,
      };

      tokenData['token2'] = {
        tokenName: 'USDC.e',
        tokenValue: tokenPricesData[idx2].usdValue,
        tokenDecimal: 6,
      };

      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token2'].tokenValue) /
        Math.pow(10, tokenData['token2'].tokenDecimal);

      const totalAmount = (token1Amount + token2Amount).toFixed(2);
      return {
        success: true,
        identifier,
        totalAmount,
      };
    }
    else {
      const token1Pool = parseInt(storageResponse.data.args[1].args[1].int);
      // token1Pool = token1Pool / Math.pow(10, 12);
      const token2Pool = parseInt(storageResponse.data.args[4].int);
      const lpTokenTotalSupply = parseInt(storageResponse.data.args[5].int);

      const token1Address = storageResponse.data.args[0].args[2].string.toString();
      const token1Check = storageResponse.data.args[0].args[3].prim.toString();

      const token2Address = storageResponse.data.args[1].args[2].string.toString();
      const token2Id = parseInt(storageResponse.data.args[2].args[1].int);
      const token2Check = storageResponse.data.args[2].args[0].prim.toString();

      // const tokenPriceResponse = await axios.get(
      //   'https://api.teztools.io/token/prices'
      // );
      // const tokenPricesData = tokenPriceResponse.data.contracts;

      const tokenData = {};

      if (token2Address === 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4') {
        const ctezPriceInUSD = await getCtezPrice();
        tokenData['token1'] = {
          tokenName: 'ctez',
          tokenValue: ctezPriceInUSD.ctezPriceInUSD,
          tokenDecimal: 6,
        };
      }

      let token1Type;
      let token2Type;

      if (token1Check.match('True')) {
        token1Type = 'fa2';
      } else {
        token1Type = 'fa1.2';
      }

      if (token2Check.match('True')) {
        token2Type = 'fa2';
      } else {
        token2Type = 'fa1.2';
      }

      for (const i in tokenPricesData) {
        if (
          tokenPricesData[i].tokenAddress === token1Address &&
          tokenPricesData[i].type === token1Type &&
          tokenPricesData[i].symbol !== 'uBTC'
        ) {
          tokenData['token0'] = {
            tokenName: tokenPricesData[i].symbol,
            tokenValue: tokenPricesData[i].usdValue,
            tokenDecimal: tokenPricesData[i].decimals,
          };
        }

        // if (
        //   tokenPricesData[i].tokenAddress === token2Address &&
        //   tokenPricesData[i].type === token2Type &&
        //   tokenPricesData[i].tokenId === token2Id &&
        //   tokenPricesData[i].tokenId === token2Id
        // ) {
        //   tokenData['token1'] = {
        //     tokenName: tokenPricesData[i].symbol,
        //     tokenValue: tokenPricesData[i].usdValue,
        //     tokenDecimal: tokenPricesData[i].decimals,
        //   };
        // }

        if (token2Type === 'fa2') {
          if (
            tokenPricesData[i].tokenAddress === token2Address &&
            tokenPricesData[i].type === token2Type &&
            tokenPricesData[i].tokenId === token2Id
          ) {
            tokenData['token1'] = {
              tokenName: tokenPricesData[i].symbol,
              tokenValue: tokenPricesData[i].usdValue,
              tokenDecimal: tokenPricesData[i].decimals,
            };
          }
        } else if (token2Type === 'fa1.2') {
          if (
            tokenPricesData[i].tokenAddress === token2Address &&
            tokenPricesData[i].type === token2Type
          ) {
            tokenData['token1'] = {
              tokenName: tokenPricesData[i].symbol,
              tokenValue: tokenPricesData[i].usdValue,
              tokenDecimal: tokenPricesData[i].decimals,
            };
          }
        }
      }
      let token1Amount = (Math.pow(10, lpTokenDecimal) * token1Pool) / lpTokenTotalSupply;
      token1Amount =
        (token1Amount * tokenData['token0'].tokenValue) /
        Math.pow(10, tokenData['token0'].tokenDecimal);

      let token2Amount = (Math.pow(10, lpTokenDecimal) * token2Pool) / lpTokenTotalSupply;
      token2Amount =
        (token2Amount * tokenData['token1'].tokenValue) /
        Math.pow(10, tokenData['token1'].tokenDecimal);
      const totalAmount = (token1Amount + token2Amount).toFixed(2);

      return {
        success: true,
        identifier,
        totalAmount,
      };
    }
  } catch (error) {
    return {
      success: false,
    };
  }
};

export const getAllFarmsContracts = async () => {
  const activeContracts = [];
  const inactiveContracts = [];
  const connectedNetwork = CONFIG.NETWORK;
  for (const key in CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork]) {
    if (CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['active'].length > 0) {
      for (const key2 in CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['active']) {
        activeContracts.push({
          contract:
            CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['active'][key2]['address'],
          mapId: CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['active'][key2]['mapId'],
          identifier: key,
          decimal: CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['active'][key2]['decimal'],
          tokenDecimal:
            CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['active'][key2]['tokenDecimal'],
        });
      }
    }
  }
  for (const key in CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork]) {
    if (CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['inactive'].length > 0) {
      for (const key2 in CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['inactive']) {
        inactiveContracts.push({
          contract:
            CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['inactive'][key2]['address'],
          mapId: CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['inactive'][key2]['mapId'],
          identifier: key,
          decimal:
            CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['inactive'][key2]['decimal'],
          tokenDecimal:
            CONFIG.STAKING_CONTRACTS.FARMS[connectedNetwork][key]['inactive'][key2]['tokenDecimal'],
        });
      }
    }
  }
  return {
    activeContracts: activeContracts,
    inactiveContracts: inactiveContracts,
  };
};

export const getAllPoolsContracts = async () => {
  const activeContracts = [];
  const inactiveContracts = [];
  const connectedNetwork = CONFIG.NETWORK;
  for (const key in CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork]) {
    if (CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['active'].length > 0) {
      for (const key2 in CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['active']) {
        activeContracts.push({
          contract:
            CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['active'][key2]['address'],
          mapId: CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['active'][key2]['mapId'],
          identifier: key,
          decimal: CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['active'][key2]['decimal'],
          tokenDecimal:
            CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['active'][key2]['tokenDecimal'],
        });
      }
    }
  }
  for (const key in CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork]) {
    if (CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['inactive'].length > 0) {
      for (const key2 in CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['inactive']) {
        inactiveContracts.push({
          contract:
            CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['inactive'][key2]['address'],
          mapId: CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['inactive'][key2]['mapId'],
          identifier: key,
          decimal:
            CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['inactive'][key2]['decimal'],
          tokenDecimal:
            CONFIG.STAKING_CONTRACTS.POOLS[connectedNetwork][key]['inactive'][key2]['tokenDecimal'],
        });
      }
    }
  }
  return {
    activeContracts: activeContracts,
    inactiveContracts: inactiveContracts,
  };
};

export const getStorageForPools = async (isActive, tokenPricesData) => {
  try {
    let priceOfPlenty = 0;
    const priceOfToken = [];
    const tokenData = {};

    for (const i in tokenPricesData) {
      if (
        tokenPricesData[i].symbol === 'PLENTY' &&
        tokenPricesData[i].tokenAddress === 'KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b'
      ) {
        // eslint-disable-next-line no-unused-vars
        priceOfPlenty = tokenPricesData[i].usdValue;
        tokenData['PLENTY'] = {
          tokenName: tokenPricesData[i].symbol,
          tokenAddress: tokenPricesData[i].tokenAddress,
          tokenValue: tokenPricesData[i].usdValue,
        };
      } else if (tokenPricesData[i].tokenAddress !== 'KT1CU9BhZZ7zXJKwZ264xhzNx2eMNoUGVyCy') {
        tokenData[tokenPricesData[i].symbol] = {
          tokenName: tokenPricesData[i].symbol,
          tokenAddress: tokenPricesData[i].tokenAddress,
          tokenValue: tokenPricesData[i].usdValue,
        };
      }
    }

    for (const key in CONFIG.POOLS[CONFIG.NETWORK]) {
      for (const key1 in CONFIG.POOLS[CONFIG.NETWORK][key][isActive]) {
        if (
          tokenData[key].tokenName === key &&
          tokenData[key].tokenAddress === CONFIG.POOLS[CONFIG.NETWORK][key][isActive][key1].TOKEN
        ) {
          priceOfToken[key] = tokenData[key].tokenValue;
        }
      }
    }

    return {
      success: true,
      priceOfToken: priceOfToken,
    };
  } catch (error) {
    return {
      success: false,
      response: {},
    };
  }
};

export const getPondContracts = async () => {
  const activeContracts = [];
  const inactiveContracts = [];
  const connectedNetwork = CONFIG.NETWORK;
  for (const key in CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork]) {
    if (CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['active'].length > 0) {
      for (const key2 in CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['active']) {
        activeContracts.push({
          contract:
            CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['active'][key2]['address'],
          mapId: CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['active'][key2]['mapId'],
          identifier: key,
          decimal: CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['active'][key2]['decimal'],
          tokenDecimal:
            CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['active'][key2]['tokenDecimal'],
        });
      }
    }
  }
  for (const key in CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork]) {
    if (CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['inactive'].length > 0) {
      for (const key2 in CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['inactive']) {
        inactiveContracts.push({
          contract:
            CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['inactive'][key2]['address'],
          mapId: CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['inactive'][key2]['mapId'],
          decimal:
            CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['inactive'][key2]['decimal'],
          tokenDecimal:
            CONFIG.STAKING_CONTRACTS.PONDS[connectedNetwork][key]['inactive'][key2]['tokenDecimal'],
          identifier: key,
        });
      }
    }
  }
  return {
    activeContracts: activeContracts,
    inactiveContracts: inactiveContracts,
  };
};

export const getStorageForPonds = async (isActive, tokenPricesData) => {
  try {
    let priceOfPlenty = 0;
    const tokenData = {};

    for (const i in tokenPricesData) {
      if (
        tokenPricesData[i].symbol === 'PLENTY' &&
        tokenPricesData[i].tokenAddress === 'KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b'
      ) {
        priceOfPlenty = tokenPricesData[i].usdValue;
        tokenData['PLENTY'] = {
          tokenName: tokenPricesData[i].symbol,
          tokenAddress: tokenPricesData[i].tokenAddress,
          tokenValue: tokenPricesData[i].usdValue,
        };
      }
    }

    return {
      success: true,
      priceOfPlenty: priceOfPlenty,
    };
  } catch (error) {
    return {
      success: false,
      response: {},
    };
  }
};

const getStakedAmount = async (mapId, packedKey, identifier, decimal, address, tokenDecimal) => {
  try {
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[CONFIG.NETWORK];
    const url = `${rpcNode}chains/main/blocks/head/context/big_maps/${mapId}/${packedKey}`;
    const response = await axios.get(url);

    if (identifier === 'CTEZ - TEZ') {
      let balance = response.data.int;
      balance = parseInt(balance);
      balance = balance / Math.pow(10, decimal);

      const singularStakes = [];

      singularStakes.push({
        mapId: 0,
        amount: balance,
        block: 0,
      });
      return {
        success: true,
        balance,
        identifier,
        address,
        singularStakes,
      };
    } else {
      let balance = response.data.args[0].args[1].int;
      balance = parseInt(balance);
      balance = balance / Math.pow(10, decimal);
      const singularStakes = [];
      for (let i = 0; i < response.data.args[0].args[0].length; i++) {
        let amount = parseInt(response.data.args[0].args[0][i].args[1].args[0].int);
        amount = parseFloat(
          response.data.args[0].args[0][i].args[1].args[0].int / Math.pow(10, tokenDecimal),
        );
        singularStakes.push({
          mapId: response.data.args[0].args[0][i].args[0].int,
          amount: amount,
          block: response.data.args[0].args[0][i].args[1].args[1].int,
        });
      }
      return {
        success: true,
        balance,
        identifier,
        address,
        singularStakes,
      };
    }
  } catch (error) {
    return {
      success: false,
      balance: 0,
      address,
      identifier,
      singularStakes: [],
    };
  }
};

const getStakedAmountDual = async (
  mapId,
  packedKey,
  identifier,
  decimal,
  address,
  tokenDecimal,
) => {
  try {
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[CONFIG.NETWORK];
    const url = `${rpcNode}chains/main/blocks/head/context/big_maps/${mapId}/${packedKey}`;
    const response = await axios.get(url);

    if (identifier === 'CTEZ - TEZ') {
      let balance = response.data.int;
      balance = parseInt(balance);
      balance = balance / Math.pow(10, decimal);

      const singularStakes = [];

      singularStakes.push({
        mapId: 0,
        amount: balance,
        block: 0,
      });
      return {
        success: true,
        balance,
        identifier,
        address,
        singularStakes,
      };
    }

    let balance = response.data.args[1].int;
    balance = parseInt(balance);
    balance = balance / Math.pow(10, tokenDecimal);
    const singularStakes = [];
    //amt - args[0][0].args[1].args[0]
    for (let i = 0; i < response.data.args[0].length; i++) {
      const amount = parseFloat(
        response.data.args[0][i].args[1].args[0].int / Math.pow(10, tokenDecimal),
      );
      singularStakes.push({
        mapId: response.data.args[0][i].args[0].int,
        amount: amount,
        block: response.data.args[0][i].args[1].args[0].int,
      });
    }

    return {
      success: true,
      balance,
      identifier,
      address,
      singularStakes,
    };
  } catch (error) {
    return {
      success: false,
      balance: 0,
      address,
      identifier,
      singularStakes: [],
    };
  }
};

const getCurrentBlockLevel = async () => {
  const response = await axios.get('https://api.better-call.dev/v1/head');
  if (response.data[0].network !== 'mainnet') {
    throw 'Invalid Network';
  }
  return response.data[0].level;
};

export const harvestAllHelper = async (
  userAddress,
  dispatchHarvestAllProcessing,
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
    const connectedNetwork = CONFIG.NETWORK;
    const rpcNode = localStorage.getItem(RPC_NODE) ?? CONFIG.RPC_NODES[connectedNetwork];
    const initialDataPromises = [];
    initialDataPromises.push(getAllActiveContractAddresses());
    initialDataPromises.push(getCurrentBlockLevel());
    initialDataPromises.push(CheckIfWalletConnected(wallet, network.type));
    initialDataPromises.push(getAllInactiveContractAddresses());
    const initialDataResponse = await Promise.all(initialDataPromises);
    const allActiveContracts = initialDataResponse[0];
    const blockLevel = initialDataResponse[1];
    const WALLET_RESP = initialDataResponse[2];
    const allInactiveContracts = initialDataResponse[3];
    if (WALLET_RESP.success) {
      const Tezos = new TezosToolkit(rpcNode);
      Tezos.setRpcProvider(rpcNode);
      Tezos.setWalletProvider(wallet);
      const promises = [];
      const packedKey = await getPackedKey(0, userAddress, 'FA1.2');
      for (const key in allActiveContracts) {
        const output =
          allActiveContracts[key].x === 'PLENTY - GIF' || allActiveContracts[key].x === 'CTEZ - TEZ'
            ? await calculateHarvestValueDual(
                allActiveContracts[key].contract,
                allActiveContracts[key].dualInfo,
                blockLevel,
                packedKey,
              )
            : await calculateHarvestValue(
                allActiveContracts[key].contract,
                18,
                blockLevel,
                allActiveContracts[key].mapId,
                packedKey,
              );
        if (
          allActiveContracts[key].x === 'PLENTY - GIF' ||
          allActiveContracts[key].x === 'CTEZ - TEZ'
        ) {
          if (output.totalRewards[0] > 0) {
            promises.push(await Tezos.wallet.at(allActiveContracts[key].contract));
          }
        } else {
          if (output.totalRewards > 0) {
            promises.push(await Tezos.wallet.at(allActiveContracts[key].contract));
          }
        }
      }
      for (const key in allInactiveContracts) {
        const output =
        allInactiveContracts[key].x === 'PLENTY - GIF' || allInactiveContracts[key].x === 'CTEZ - TEZ'
            ? await calculateHarvestValueDual(
              allInactiveContracts[key].contract,
              allInactiveContracts[key].dualInfo,
                blockLevel,
                packedKey,
              )
            : await calculateHarvestValue(
              allInactiveContracts[key].contract,
                18,
                blockLevel,
                allInactiveContracts[key].mapId,
                packedKey,
              );
        if (
          allInactiveContracts[key].x === 'PLENTY - GIF' ||
          allInactiveContracts[key].x === 'CTEZ - TEZ'
        ) {
          if (output.totalRewards[0] > 0) {
            promises.push(await Tezos.wallet.at(allInactiveContracts[key].contract));
          }
        } else {
          if (output.totalRewards > 0) {
            promises.push(await Tezos.wallet.at(allInactiveContracts[key].contract));
          }
        }
      }
      if (promises.length > 0) {
        const response = await Promise.all(promises);
        const harvestBatch = [];
        for (const key1 in response) {
          harvestBatch.push({
            kind: OpKind.TRANSACTION,
            ...response[key1].methods.GetReward(1).toTransferParams(),
          });
        }
        const batch = await Tezos.wallet.batch(harvestBatch);
        const batchOperation = await batch.send();
        setShowConfirmTransaction(false);
        dispatchHarvestAllProcessing(batchOperation);
        const batchConfirm = await batchOperation.confirmation();
        return {
          success: true,
          batchConfirm: batchConfirm,
        };
      }
    }
  } catch (error) {
    return { success: false, error: error };
  }
};

export const getTVLOfUserHelper = async (userAddress) => {
  try {
    let tvlOfUser = 0;
    const tokenPrices = await axios.get(CONFIG.API.tezToolTokenPrice);
    const tokenPricesData = tokenPrices.data.contracts;
    const initialDataResponse = await Promise.all([
      getAllFarmsContracts(),
      getAllPoolsContracts(),
      getPondContracts(),
      getStorageForPools('active', tokenPricesData),
      getStorageForPools('inactive', tokenPricesData),
      getStorageForPonds('active', tokenPricesData),
      getStorageForPonds('inactive', tokenPricesData),
      getStorageForFarms('active', tokenPricesData),
      getStorageForFarms('inactive', tokenPricesData),
    ]);
    const { activeContracts: farmActiveContracts, inactiveContracts: farmInactiveContracts } =
      initialDataResponse[0];
    const { activeContracts: poolActiveContracts, inactiveContracts: poolsInactiveContracts } =
      initialDataResponse[1];
    const { activeContracts: pondActiveContracts, inactiveContracts: pondInactiveContract } =
      initialDataResponse[2];

    const poolTokenDataActive = initialDataResponse[3].priceOfToken;
    const poolTokenDataInactive = initialDataResponse[4].priceOfToken;
    const pondTokenDataActive = initialDataResponse[5].priceOfPlenty;
    const pondTokenDataInactive = initialDataResponse[6].priceOfPlenty;
    const farmTokenDataActive = initialDataResponse[7].priceOfLPToken;
    const farmTokenDataInactive = initialDataResponse[8].priceOfLPToken;

    const packedKey = getPackedKey(0, userAddress, 'FA1.2');

    //FARM ACTIVE
    const stakedAmountsFromActiveFarmsPromises = [];
    for (const key in farmActiveContracts) {
      const { mapId, identifier, decimal, contract, tokenDecimal } = farmActiveContracts[key];
      if (identifier === 'PLENTY - GIF' || identifier === 'CTEZ - TEZ') {
        stakedAmountsFromActiveFarmsPromises.push(
          getStakedAmountDual(mapId, packedKey, identifier, decimal, contract, tokenDecimal),
        );
      } else {
        stakedAmountsFromActiveFarmsPromises.push(
          getStakedAmount(mapId, packedKey, identifier, decimal, contract, tokenDecimal),
        );
      }
    }
    const farmResponsesActive = await Promise.all(stakedAmountsFromActiveFarmsPromises);
    for (const key in farmResponsesActive) {
      if (farmResponsesActive[key].success) {
        tvlOfUser +=
          farmResponsesActive[key].balance *
          farmTokenDataActive[farmResponsesActive[key].identifier];
      }
    }

    //FARM INACTIVE
    const stakedAmountsFromInactiveFarmsPromises = [];
    for (const key in farmInactiveContracts) {
      const { mapId, identifier, decimal, contract, tokenDecimal } = farmInactiveContracts[key];
      stakedAmountsFromInactiveFarmsPromises.push(
        getStakedAmount(mapId, packedKey, identifier, decimal, contract, tokenDecimal),
      );
    }
    const farmResponsesInactive = await Promise.all(stakedAmountsFromInactiveFarmsPromises);
    for (const key in farmResponsesInactive) {
      if (farmResponsesInactive[key].success) {
        tvlOfUser +=
          farmResponsesInactive[key].balance *
          farmTokenDataInactive[farmResponsesInactive[key].identifier];
      }
    }

    //POOLS ACTIVE
    const stakedAmountsFromActivePoolsPromises = [];
    for (const key in poolActiveContracts) {
      const { mapId, identifier, decimal, contract, tokenDecimal } = poolActiveContracts[key];
      stakedAmountsFromActivePoolsPromises.push(
        getStakedAmount(mapId, packedKey, identifier, decimal, contract, tokenDecimal),
      );
    }
    const poolResponseActive = await Promise.all(stakedAmountsFromActivePoolsPromises);
    for (const key in poolResponseActive) {
      if (poolResponseActive[key].success) {
        tvlOfUser +=
          poolResponseActive[key].balance * poolTokenDataActive[poolResponseActive[key].identifier];
      }
    }

    //POOL Inactive

    const stakedAmountsFromInactivePoolsPromises = [];
    for (const key in poolsInactiveContracts) {
      const { mapId, identifier, decimal, contract, tokenDecimal } = poolsInactiveContracts[key];
      stakedAmountsFromInactivePoolsPromises.push(
        getStakedAmount(mapId, packedKey, identifier, decimal, contract, tokenDecimal),
      );
    }
    const poolResponseInactive = await Promise.all(stakedAmountsFromInactivePoolsPromises);
    for (const key in poolResponseInactive) {
      if (poolResponseInactive[key].success) {
        tvlOfUser +=
          poolResponseInactive[key].balance *
          poolTokenDataInactive[poolResponseInactive[key].identifier];
      }
    }

    //POND Active
    const stakedAmountsFromActivePondPromises = [];
    for (const key in pondActiveContracts) {
      const { mapId, identifier, decimal, contract, tokenDecimal } = pondActiveContracts[key];
      stakedAmountsFromActivePondPromises.push(
        getStakedAmount(mapId, packedKey, identifier, decimal, contract, tokenDecimal),
      );
    }
    const pondResponseActive = await Promise.all(stakedAmountsFromActivePondPromises);
    for (const key in pondResponseActive) {
      if (pondResponseActive[key].success) {
        tvlOfUser += pondResponseActive[key].balance * pondTokenDataActive;
      }
    }

    //POND Inactive
    const stakedAmountsFromInactivePondPromises = [];
    for (const key in pondInactiveContract) {
      const { mapId, identifier, decimal, contract, tokenDecimal } = pondInactiveContract[key];
      stakedAmountsFromInactivePondPromises.push(
        getStakedAmount(mapId, packedKey, identifier, decimal, contract, tokenDecimal),
      );
    }
    const pondResponseInactive = await Promise.all(stakedAmountsFromInactivePondPromises);
    for (const key in pondResponseInactive) {
      if (pondResponseInactive[key].success) {
        tvlOfUser += pondResponseInactive[key].balance * pondTokenDataInactive;
      }
    }
    return {
      success: true,
      data: tvlOfUser,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export const plentyToHarvestHelper = async (addressOfUser) => {
  let plentyToHarvest = 0;
  const promises = [
    getHarvestValue(addressOfUser, 'FARMS', true),
    getHarvestValue(addressOfUser, 'FARMS', false),
  ];
  const response = await Promise.all(promises);
  response.forEach((item) => {
    if (item.success) {
      for (const key in item.response) {
        if (!isNaN(item.response[key].totalRewards)) {
          plentyToHarvest += item.response[key].totalRewards;
        }
      }
    } else {
      return {
        success: false,
      };
    }
  });
  return {
    success: true,
    data: plentyToHarvest,
  };
};
