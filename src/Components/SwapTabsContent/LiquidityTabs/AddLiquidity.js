import PropTypes from 'prop-types';
import { addLiquidity, estimateOtherToken, lpTokenOutput } from '../../../apis/swap/swap';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import InfoModal from '../../Ui/Modals/InfoModal';
import ConfirmAddLiquidity from './ConfirmAddLiquidity';
import Button from '../../Ui/Buttons/Button';
import {
  add_liquidity,
  getXtzDollarPrice,
  liqCalc,
  liqCalcRev,
  getExchangeRate,
  loadSwapDataStable,
} from '../../../apis/stableswap/stableswap';

const AddLiquidity = (props) => {
  const [estimatedTokenAmout, setEstimatedTokenAmout] = useState('');
  const [secondTokenAmount, setSecondTokenAmount] = useState('');
  const [lpTokenAmount, setLpTokenAmount] = useState({});
  const [showTransactionSubmitModal, setShowTransactionSubmitModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [dolar, setDolar] = useState('');
  const [poolShare, setPoolShare] = useState('0.0');
  const [xtztoctez, setxtztoctez] = useState('0.00');
  const [cteztoxtz, setcteztoxtz] = useState('0.00');
  const fetchOutputData = async () => {
    const res = getExchangeRate(
      props.swapData.tezPool,
      props.swapData.ctezPool,
      props.swapData.target,
    );

    setxtztoctez(res.ctezexchangeRate.toFixed(6));
    setcteztoxtz(res.tezexchangeRate.toFixed(6));
  };
  useEffect(() => {
    if (props.isStableSwap) {
      fetchOutputData();
      getSwapData();
    }
  }, [props]);
  const getSwapData = async () => {
    await loadSwapDataStable(props.tokenIn.name, props.tokenOut.name);
  };
  useEffect(() => {
    setErrorMessage(false);
  }, [props.tokenOut.name, props.firstTokenAmount]);

  const setErrorMessageOnUI = (value) => {
    setMessage(value);
    setErrorMessage(true);
  };
  const getXtz = async (input) => {
    const values = await liqCalc(
      input,
      props.swapData.tezPool,
      props.swapData.ctezPool,
      props.swapData.lpTokenSupply,
    );
    setPoolShare(values.poolPercent.toFixed(5));
    if (props.tokenIn.name === 'tez') {
      setLpTokenAmount((values.lpToken / 10 ** 6).toFixed(6));
    }
    return values.ctez / 10 ** 6;
  };

  const liqCa = async (input) => {
    const values = await liqCalcRev(
      input,
      props.swapData.tezPool,
      props.swapData.ctezPool,
      props.swapData.lpTokenSupply,
    );
    setPoolShare(values.poolPercent.toFixed(5));
    if (props.tokenIn.name === 'tez') {
      setLpTokenAmount((values.lpToken / 10 ** 6).toFixed(6));
    }
    return values.tez / 10 ** 6;
  };

  useEffect(() => {
    getXtzDollarPrice().then((res) => {
      setDolar(res);
    });
  }, []);

  const handleLiquidityInput = async (input) => {
    props.setFirstTokenAmount(input);
    setEstimatedTokenAmout({});
    if (input === '' || isNaN(input)) {
      setSecondTokenAmount('');
      props.setFirstTokenAmount('');
      setEstimatedTokenAmout({
        otherTokenAmount: '',
      });
      return;
    }
    if (props.tokenIn.name === 'tez') {
      const res = await getXtz(input);

      setEstimatedTokenAmout({
        otherTokenAmount: res.toFixed(6),
      });
    } else {
      const estimatedTokenAmout = estimateOtherToken(
        input,
        props.swapData.tokenIn_supply,
        props.swapData.tokenOut_supply,
      );
      setEstimatedTokenAmout(estimatedTokenAmout);
    }
  };
  const handleLiquiditySecondInput = async (input) => {
    setSecondTokenAmount(input);
    setEstimatedTokenAmout({});
    if (input === '' || isNaN(input)) {
      setSecondTokenAmount('');
      props.setFirstTokenAmount('');
      setEstimatedTokenAmout({
        otherTokenAmount: '',
      });
    } else {
      if (props.tokenIn.name === 'tez') {
        const res = await liqCa(input);

        setEstimatedTokenAmout({
          otherTokenAmount: res.toFixed(6),
        });
        props.setFirstTokenAmount(res.toFixed(6));
      } else {
        const estimatedTokenAmout = estimateOtherToken(
          input,
          props.swapData.tokenOut_supply,
          props.swapData.tokenIn_supply,
        );
        setEstimatedTokenAmout(estimatedTokenAmout);
        props.setFirstTokenAmount(estimatedTokenAmout.otherTokenAmount);
      }
    }
  };
  const confirmAddLiquidity = () => {
    props.setShowConfirmAddSupply(true);
    //props.setHideContent('content-hide');

    const secondTokenAmountEntered = secondTokenAmount
      ? parseFloat(secondTokenAmount)
      : estimatedTokenAmout.otherTokenAmount;

    if (props.tokenIn.name !== 'tez') {
      const lpTokenAmount = lpTokenOutput(
        props.firstTokenAmount,
        secondTokenAmountEntered,
        props.swapData.tokenIn_supply,
        props.swapData.tokenOut_supply,
        props.swapData.lpTokenSupply,
      );
      setLpTokenAmount(lpTokenAmount);
    }
  };
  const transactionSubmitModal = (id) => {
    setTransactionId(id);
    setShowTransactionSubmitModal(true);
  };

  const CallConfirmAddLiquidity = () => {
    props.setLoading(true);
    const secondTokenAmountEntered = secondTokenAmount
      ? parseFloat(secondTokenAmount)
      : estimatedTokenAmout.otherTokenAmount;
    if (props.tokenIn.name === 'tez') {
      add_liquidity(
        props.tokenIn.name,
        props.tokenOut.name,
        secondTokenAmountEntered,
        props.firstTokenAmount,
        props.walletAddress,
        transactionSubmitModal,
        props.setShowConfirmAddSupply,
        props.resetAllValues,
      ).then((data) => {
        if (data.success) {
          props.setLoading(false);
          props.handleLoaderMessage('success', 'Transaction confirmed');
          props.setShowConfirmAddSupply(false);
          //props.setHideContent('');
          props.resetAllValues();
          setTimeout(() => {
            props.setLoaderMessage({});
          }, 5000);
        } else {
          props.setLoading(false);
          props.handleLoaderMessage('error', 'Transaction failed');
          props.setShowConfirmAddSupply(false);
          //props.setHideContent('');
          props.resetAllValues();
          setTimeout(() => {
            props.setLoaderMessage({});
          }, 5000);
        }
      });
    } else {
      addLiquidity(
        props.tokenIn.name,
        props.tokenOut.name,
        props.firstTokenAmount,
        secondTokenAmountEntered,
        props.tokenContractInstances[props.tokenIn.name],
        props.tokenContractInstances[props.tokenOut.name],
        props.walletAddress,
        props.swapData.dexContractInstance,
        transactionSubmitModal,
        props.resetAllValues,
        props.setShowConfirmAddSupply,
      ).then((data) => {
        if (data.success) {
          props.setLoading(false);
          props.handleLoaderMessage('success', 'Transaction confirmed');
          getSwapData();
          props.setShowConfirmAddSupply(false);
          //props.setHideContent('');
          props.resetAllValues();
          setTimeout(() => {
            props.setLoaderMessage({});
          }, 5000);
        } else {
          props.setLoading(false);
          props.handleLoaderMessage('error', 'Transaction failed');
          props.setShowConfirmAddSupply(false);
          //props.setHideContent('');
          props.resetAllValues();
          setTimeout(() => {
            props.setLoaderMessage({});
          }, 5000);
        }
      });
    }
  };

  useEffect(() => {
    if (props.firstTokenAmount === '' || props.firstTokenAmount === 0) {
      setSecondTokenAmount('');
      setEstimatedTokenAmout({
        otherTokenAmount: '',
      });
    }
  }, [props.firstTokenAmount]);

  let swapContentButton = (
    <Button
      onClick={props.connecthWallet}
      color={'primary'}
      startIcon={'add'}
      className={'mt-4 w-100 flex align-items-center justify-content-center'}
    >
      Connect Wallet
    </Button>
  );

  if (props.walletAddress) {
    if (props.tokenOut.name && props.firstTokenAmount) {
      swapContentButton = (
        <Button
          onClick={confirmAddLiquidity}
          color={'primary'}
          className={'mt-4 w-100 flex align-items-center justify-content-center'}
        >
          Add Liquidity
        </Button>
      );
    } else if (!props.tokenOut.name) {
      swapContentButton = (
        <Button
          onClick={() => setErrorMessageOnUI('Please select a token and then enter the amount')}
          color={'disabled'}
          className={'enter-amount mt-4 w-100 flex align-items-center justify-content-center'}
        >
          Add Liquidity
        </Button>
      );
    } else {
      swapContentButton = props.loaderInButton ? (
        <Button
          onClick={() => null}
          color={'primary'}
          loading={true}
          className={'enter-amount mt-4 w-100 flex align-items-center justify-content-center'}
        ></Button>
      ) : (
        <Button
          onClick={() => setErrorMessageOnUI('Enter an amount to add liqiidity')}
          color={'disabled'}
          className={' mt-4 w-100 flex align-items-center justify-content-center'}
        >
          Add Liquidity
        </Button>
      );
    }
  }

  const onClickAmount = () => {
    const value =
      props.userBalances[props.tokenIn.name].toLocaleString('en-US', {
        maximumFractionDigits: 20,
        useGrouping: false,
      }) ?? 0;
    props.setFirstTokenAmount(value.substring(0, value.length - 1));
    handleLiquidityInput(value.substring(0, value.length - 1));
  };

  return (
    <>
      <div className="swap-content-box">
        <div
          className={clsx(
            'swap-token-select-box',

            errorMessage && 'errorBorder',
          )}
        >
          <div className="token-selector-balance-wrapper">
            <button
              className={clsx(
                props.isStableSwap && 'stable-swap-token-selector',
                'token-selector dropdown-themed',
              )}
              {...(props.isStableSwap ? {} : { onClick: () => props.handleTokenType('tokenIn') })}
            >
              <img src={props.tokenIn.image} className="button-logo" />
              {props.tokenIn.name}{' '}
              {!props.isStableSwap && <span className="material-icons-round">expand_more</span>}
            </button>
          </div>

          <div className="token-user-input-wrapper">
            {props.swapData.success && props.userBalances[props.tokenIn.name] ? (
              <input
                type="text"
                className="token-user-input"
                placeholder="0.0"
                value={props.firstTokenAmount}
                onChange={(e) => {
                  props.setFirstTokenAmount(e.target.value);
                  handleLiquidityInput(e.target.value);
                }}
              />
            ) : (
              <input
                type="text"
                className="token-user-input"
                placeholder="0.0"
                disabled
                value={props.firstTokenAmount}
              />
            )}
          </div>
          {props.walletAddress ? (
            <div className="flex justify-between" style={{ flex: '0 0 100%' }}>
              <p
                className="wallet-token-balance"
                style={{ cursor: 'pointer' }}
                onClick={onClickAmount}
              >
                Balance:{' '}
                {props.userBalances[props.tokenIn.name] >= 0 ? (
                  props.userBalances[props.tokenIn.name]
                ) : (
                  <div className="shimmer">0.0000</div>
                )}{' '}
                <span className="max-btn">(Max)</span>
              </p>
              <p className="wallet-token-balance">
                ~$
                {props.tokenIn.name === 'tez'
                  ? (dolar * props.firstTokenAmount).toFixed(2)
                  : props.getTokenPrice.success && props.firstTokenAmount
                  ? (
                      props.firstTokenAmount * props.getTokenPrice.tokenPrice[props.tokenIn.name]
                    ).toFixed(5)
                  : '0.00'}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="swap-arrow-center">
        <span className="material-icons-round">add</span>
      </div>

      <div className="swap-content-box">
        <div
          className={clsx(
            'swap-token-select-box',

            errorMessage && 'errorBorder',
          )}
        >
          <div className="token-selector-balance-wrapper">
            {props.tokenOut.name ? (
              <button
                className={clsx(
                  props.isStableSwap && 'stable-swap-token-selector',
                  'token-selector dropdown-themed',
                )}
                {...(props.isStableSwap
                  ? {}
                  : { onClick: () => props.handleTokenType('tokenOut') })}
              >
                <img src={props.tokenOut.image} className="button-logo" />
                {props.tokenOut.name}{' '}
                {!props.isStableSwap && <span className="material-icons-round">expand_more</span>}
              </button>
            ) : (
              <button
                className="token-selector not-selected"
                {...(props.isStableSwap
                  ? {}
                  : { onClick: () => props.handleTokenType('tokenOut') })}
              >
                Select a token <span className="material-icons-round">expand_more</span>
              </button>
            )}
          </div>

          <div className="token-user-input-wrapper">
            {props.swapData.success ? (
              <input
                type="text"
                className="token-user-input"
                placeholder="0.0"
                value={secondTokenAmount ? secondTokenAmount : estimatedTokenAmout.otherTokenAmount}
                onChange={(e) => handleLiquiditySecondInput(e.target.value)}
              />
            ) : (
              <input
                type="text"
                disabled
                className="token-user-input"
                placeholder="0.0"
                value={props.firstTokenAmount}
              />
            )}
          </div>
          {props.walletAddress && props.tokenOut.name ? (
            <div className="flex justify-between" style={{ flex: '0 0 100%' }}>
              <p className="wallet-token-balance">
                Balance:{' '}
                {props.userBalances[props.tokenOut.name] >= 0 ? (
                  props.userBalances[props.tokenOut.name]
                ) : (
                  <div className="shimmer">0.0000</div>
                )}
              </p>
              <p className="wallet-token-balance">
                ~$
                {props.tokenIn.name === 'tez'
                  ? isNaN(
                      dolar *
                        (secondTokenAmount
                          ? secondTokenAmount
                          : estimatedTokenAmout.otherTokenAmount),
                    )
                    ? '0.00'
                    : (
                        dolar *
                        (secondTokenAmount
                          ? secondTokenAmount
                          : estimatedTokenAmout.otherTokenAmount)
                      ).toFixed(2)
                  : props.getTokenPrice.success && estimatedTokenAmout.otherTokenAmount
                  ? (
                      (secondTokenAmount
                        ? secondTokenAmount
                        : estimatedTokenAmout.otherTokenAmount) *
                      props.getTokenPrice.tokenPrice[props.tokenOut.name]
                    ).toFixed(5)
                  : '0.00'}
              </p>
            </div>
          ) : null}
        </div>
      </div>
      {errorMessage && <span className="error-message">{message}</span>}
      <div className="swap-detail-wrapper bg-themed-light">
        <div className="add-liquidity-tip">
          When you add liquidity, you will receive pool tokens representing your position. These
          tokens automatically earn fees proportional to your share of the pool, and can be redeemed
          at any time.
        </div>
      </div>

      {swapContentButton}
      <ConfirmAddLiquidity
        {...props}
        CallConfirmAddLiquidity={CallConfirmAddLiquidity}
        lpTokenAmount={lpTokenAmount}
        onHide={props.handleClose}
        estimatedTokenAmout={estimatedTokenAmout}
        secondTokenAmount={secondTokenAmount}
        poolShare={poolShare}
        xtztoctez={xtztoctez}
        cteztoxtz={cteztoxtz}
      />
      <InfoModal
        open={showTransactionSubmitModal}
        onClose={() => setShowTransactionSubmitModal(false)}
        message={'Transaction submitted'}
        buttonText={'View on TzKT'}
        onBtnClick={
          transactionId ? () => window.open(`https://tzkt.io/${transactionId}`, '_blank') : null
        }
      />
    </>
  );
};

export default AddLiquidity;

AddLiquidity.propTypes = {
  connecthWallet: PropTypes.any,
  fetchUserWalletBalance: PropTypes.any,
  firstTokenAmount: PropTypes.any,
  getTokenPrice: PropTypes.any,
  handleClose: PropTypes.any,
  handleLoaderMessage: PropTypes.any,
  handleTokenType: PropTypes.any,
  loaderInButton: PropTypes.any,
  resetAllValues: PropTypes.any,
  setFirstTokenAmount: PropTypes.any,
  //setHideContent: PropTypes.any,
  setLoaderMessage: PropTypes.any,
  setLoading: PropTypes.any,
  setShowConfirmAddSupply: PropTypes.any,
  swapData: PropTypes.any,
  tokenContractInstances: PropTypes.any,
  tokenIn: PropTypes.any,
  tokenOut: PropTypes.any,
  userBalances: PropTypes.any,
  walletAddress: PropTypes.any,
  isStableSwap: PropTypes.any,
  getSwapData: PropTypes.func,
  setSwapData: PropTypes.func,
};
