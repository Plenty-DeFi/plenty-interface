import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import truncateMiddle from 'truncate-middle';
import styles from './BridgeModal.module.scss';
import Button from '../Ui/Buttons/Button';
// import tezos from '../../assets/images/bridge/tezos.svg';
import '../../assets/scss/animation.scss';
import switchImg from '../../assets/images/bridge/bridge-switch.svg';
import switchImgDark from '../../assets/images/bridge/bridge-switch-dark.svg';
import { bridgesList } from '../../constants/bridges';
import SelectorModal from '../Bridges/SelectorModal';
import { BridgeConfiguration } from '../../apis/Config/BridgeConfig';
import { setConnectWalletTooltip } from '../../redux/slices/settings/settings.slice';
import { useDispatch } from 'react-redux';
import { allTokens } from '../../constants/bridges';
import { getBalance, getBalanceTez } from '../../apis/bridge/bridgeAPI';
import { FLASH_MESSAGE_DURATION } from '../../constants/global';
import { changeNetwork } from '../../apis/bridge/bridgeAPI';
import { CHANGE_NETWORK_PROMPT_DELAY } from '../../constants/bridges';
import { getAllowance } from '../../apis/bridge/bridgeAPI';
import { useInterval } from '../../hooks/useInterval';
import { getActionRequiredCount } from '../../apis/bridge/bridgeAPI';
import { titleCase } from '../TransactionHistory/helpers';
import fromExponential from 'from-exponential';
import BigNumber from 'bignumber.js';
import selectbridge from '../../assets/images/bridge/selectbridge.svg';
import selectbridgeDark from '../../assets/images/bridge/selectbridgeDark.svg';
import arrowbridge from '../../assets/images/bridge/arrowbridge.svg';
import arrowbridgeDark from '../../assets/images/bridge/arrowbridgedark.svg';
import SelectorModalBridge from '../Bridges/SelectorModalBridge';
const BridgeModal = (props) => {
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [showMetamaskTooltip, setShowMetamaskTooltip] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [show, setShow] = useState(false);
  const [showChain, setShowChain] = useState(false);
  const [userBalances, setUserBalances] = useState({});
  const [isLoading, SetisLoading] = useState(false);
  const [isTokenInSelected, setIsTokenInSelected] = useState(false);
  const [isBridgeSelected, setIsBridgeSelected] = useState(false);
  const [isTokenSelected, setIsTokenSelected] = useState(false);
  const [pendingTransCount, setPendingTransCount] = useState(0);
  const [animationClass, setAnimationClass] = useState('leftToRightFadeInAnimation-4-bridge');
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const selector = useRef('BRIDGES');
  const delay = useRef(5000);
  const firstTimeLoading = useRef(true);
  const {
    walletAddress,
    transaction,
    setTransaction,
    fromBridge,
    toBridge,
    tokenIn,
    tokenOut,
    firstTokenAmount,
    secondTokenAmount,
    fee,
    operation,
    setFromBridge,
    setToBridge,
    setTokenIn,
    setTokenOut,
    setFirstTokenAmount,
    setSecondTokenAmount,
    setFee,
    setOperation,
    tokenList,
    loadedTokensList,
    theme,
    setOpeningFromHistory,
    metamaskAddress,
    currentChain,
    metamaskChain,
    displayMessage,
    setSwitchButtonPressed,
    connectWalletHandler,
    setIsApproved,
    setTransactionTime,
  } = props;

  const [connectBridgeWallet, setConnectBrigeWallet] = useState({
    name: fromBridge.name,
    image: fromBridge.image,
    buttonImage: fromBridge.buttonImage,
  });

  useEffect(() => {
    if (currentChain !== metamaskChain && transaction === 1) {
      if (metamaskChain !== null) {
        displayMessage({
          type: 'warning',
          duration: FLASH_MESSAGE_DURATION,
          title: 'Chain mismatch',
          content: `Change wallet chain to ${titleCase(currentChain)}.`,
          isFlashMessageALink: false,
          flashMessageLink: '#',
        });

        setTimeout(async () => {
          try {
            await changeNetwork({ networkName: currentChain });
          } catch (error) {
            displayMessage({
              type: 'error',
              duration: FLASH_MESSAGE_DURATION,
              title: 'Chain change failed',
              content: 'Failed to force change the chain. Please change in wallet.',
              isFlashMessageALink: false,
              flashMessageLink: '#',
            });
          }
        }, CHANGE_NETWORK_PROMPT_DELAY);
      }
    }
  }, [currentChain, metamaskChain]);

  useEffect(() => {
    if (currentChain === metamaskChain && isError) {
      setIsError(false);
    }
  }, [metamaskChain]);

  useEffect(() => {
    setOpeningFromHistory(false);
    setIsApproved(false);
    setTransactionTime(null);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      dispatch(setConnectWalletTooltip(false));
      setIsError(false);
    }
  }, [walletAddress]);

  useEffect(async () => {
    if (metamaskAddress) {
      setShowMetamaskTooltip(false);
      setIsError(false);
    }
    if (firstTimeLoading.current && metamaskAddress && walletAddress) {
      const pendingHistoryCount = await getActionRequiredCount({
        ethereumAddress: metamaskAddress,
        tzAddress: walletAddress,
      });
      setPendingTransCount(pendingHistoryCount.count);
      setIsHistoryLoading(false);
      firstTimeLoading.current = false;
    }
  }, [metamaskAddress]);

  useEffect(async () => {
    setUserBalances((prevState) => ({ ...prevState, [tokenIn.name]: null }));
    if (
      tokenIn.name !== 'Token NA' &&
      walletAddress &&
      metamaskAddress &&
      metamaskChain === currentChain
    ) {
      if (operation === 'BRIDGE') {
        const balanceResult = await getBalance(tokenIn.tokenData.CONTRACT_ADDRESS, metamaskAddress);
        if (balanceResult.success) {
          setUserBalances((prevState) => ({
            ...prevState,
            [tokenIn.name]: new BigNumber(balanceResult.balance)
              .div(new BigNumber(10).pow(tokenIn.tokenData.DECIMALS))
              .toString(),
          }));
        } else {
          setUserBalances((prevState) => ({ ...prevState, [tokenIn.name]: -1 }));
        }
      } else {
        const tokenInDecimals = BridgeConfiguration.getOutTokenUnbridgingWhole(
          toBridge.name,
          tokenIn.name,
        ).DECIMALS;
        const balanceResult = await getBalanceTez(
          tokenIn.tokenData.CONTRACT_ADDRESS,
          tokenIn.tokenData.TOKEN_ID,
          walletAddress,
          tokenInDecimals,
        );
        if (balanceResult.success) {
          setUserBalances((prevState) => ({
            ...prevState,
            [tokenIn.name]: new BigNumber(balanceResult.balance).toString(),
          }));
        } else {
          setUserBalances((prevState) => ({ ...prevState, [tokenIn.name]: -1 }));
        }
      }
    } else {
      setUserBalances((prevState) => ({ ...prevState, [tokenIn.name]: -1 }));
    }
  }, [tokenIn, walletAddress, metamaskAddress, metamaskChain]);

  useInterval(async () => {
    if (metamaskAddress && walletAddress) {
      const pendingHistoryCount = await getActionRequiredCount({
        ethereumAddress: metamaskAddress,
        tzAddress: walletAddress,
      });
      setPendingTransCount(pendingHistoryCount.count);
      setIsHistoryLoading(false);
    }
  }, delay.current);

  const onClickAmount = () => {
    const value = userBalances[tokenIn.name] ?? 0;
    handleFromTokenInput(value);
  };

  const handleFromTokenInput = (input) => {
    setIsError(false);
    if (!walletAddress && !metamaskAddress) {
      dispatch(setConnectWalletTooltip(true));
      setShowMetamaskTooltip(true);
      displayMessage({
        type: 'info',
        duration: FLASH_MESSAGE_DURATION,
        title: 'Connect wallet',
        content: 'Connect both the wallets and proceed.',
        isFlashMessageALink: false,
        flashMessageLink: '#',
      });
      setErrorMessage('Please connect to both the wallets.');
      setIsError(true);
    } else if (!walletAddress && metamaskAddress) {
      dispatch(setConnectWalletTooltip(true));
      setErrorMessage('Please connect to tezos wallet.');
      setIsError(true);
    } else if (!metamaskAddress && walletAddress) {
      setShowMetamaskTooltip(true);
      setErrorMessage(
        `Please connect to ${
          fromBridge.name === 'TEZOS' ? toBridge.name : fromBridge.name
        } wallet.`,
      );
      setIsError(true);
    } else {
      if (
        input === '' ||
        isNaN(input) ||
        tokenIn.name === 'Token NA' ||
        userBalances[tokenIn.name] === null ||
        userBalances[tokenIn.name] < 0
      ) {
        setFirstTokenAmount('');
        setSecondTokenAmount('');
        setFee(0);
      } else {
        setFirstTokenAmount(input);
        if (new BigNumber(input).gt(new BigNumber(userBalances[tokenIn.name]))) {
          setErrorMessage('Insufficient balance');
          setIsError(true);
        } else {
          if (operation === 'BRIDGE') {
            setFee(
              new BigNumber(input)
                .multipliedBy(BridgeConfiguration.getFeesForChain(fromBridge.name).WRAP_FEES)
                .div(10000)
                .toString(),
            );
            const outputAmount = new BigNumber(input)
              .minus(
                new BigNumber(input)
                  .multipliedBy(BridgeConfiguration.getFeesForChain(fromBridge.name).WRAP_FEES)
                  .div(10000),
              )
              .toString();
            setSecondTokenAmount(outputAmount);
          } else {
            setFee(
              new BigNumber(input)
                .multipliedBy(BridgeConfiguration.getFeesForChain(toBridge.name).UNWRAP_FEES)
                .div(10000)
                .toString(),
            );
            const outputAmount = new BigNumber(input)
              .minus(
                new BigNumber(input)
                  .multipliedBy(BridgeConfiguration.getFeesForChain(toBridge.name).UNWRAP_FEES)
                  .div(10000),
              )
              .toString();
            setSecondTokenAmount(outputAmount);
          }
        }
      }
    }
  };

  const handelClickWithMetaAddedBtn = async () => {
    setIsError(false);
    if (firstTokenAmount === '' || isNaN(firstTokenAmount) || firstTokenAmount === 0) {
      setErrorMessage('Enter an amount to proceed');
      setIsError(true);
    } else if (new BigNumber(firstTokenAmount).gt(new BigNumber(userBalances[tokenIn.name]))) {
      setErrorMessage('Insufficient balance');
      setIsError(true);
    } else {
      if (currentChain !== metamaskChain) {
        displayMessage({
          type: 'warning',
          duration: FLASH_MESSAGE_DURATION,
          title: 'Chain mismatch',
          content: `Change wallet chain to ${titleCase(currentChain)}.`,
          isFlashMessageALink: false,
          flashMessageLink: '#',
        });

        setTimeout(async () => {
          try {
            await changeNetwork({ networkName: currentChain });
          } catch (error) {
            displayMessage({
              type: 'error',
              duration: FLASH_MESSAGE_DURATION,
              title: 'Chain change failed',
              content: 'Failed to force change the chain. Please change in wallet.',
              isFlashMessageALink: false,
              flashMessageLink: '#',
            });
          }
        }, CHANGE_NETWORK_PROMPT_DELAY);
      } else {
        SetisLoading(true);
        if (operation === 'BRIDGE') {
          const allowanceResult = await getAllowance(tokenIn, metamaskAddress, fromBridge.name);
          if (allowanceResult.success) {
            if (new BigNumber(allowanceResult.allowance).gte(new BigNumber(firstTokenAmount))) {
              setIsApproved(true);
            }
            setAnimationClass('rightToLeftFadeOutAnimation-4');
            setTimeout(() => {
              SetisLoading(false);
              setTransaction(3);
            }, 600);
          } else {
            displayMessage({
              type: 'error',
              duration: FLASH_MESSAGE_DURATION,
              title: 'Allowance error',
              content: 'Failed to fetch allowance for user. Please try again.',
              isFlashMessageALink: false,
              flashMessageLink: '#',
            });
            SetisLoading(false);
          }
        } else {
          setAnimationClass('rightToLeftFadeOutAnimation-4');
          setTimeout(() => {
            SetisLoading(false);
            setTransaction(3);
          }, 600);
        }
      }
    }
  };

  const handleClose = () => {
    setShow(false);
    setShowChain(false);
    setSearchQuery('');
  };

  const handleInputFocus = () => {
    setIsError(false);
    setIsTokenInSelected(true);
    if (walletAddress && metamaskAddress && currentChain !== metamaskChain) {
      setErrorMessage(`Please select ${titleCase(currentChain)} chain in wallet.`);
      setIsError(true);
    }
  };

  const selectBridge = (bridge) => {
    setFirstTokenAmount('');
    setSecondTokenAmount('');
    setFee(0);
    /* if (bridge.fromTokenName === 'TEZOS') {
      const currentFrom = {
        name: fromBridge.name,
        image: fromBridge.image,
        buttonImage: fromBridge.buttonImage,
      };
      if (currentFrom.name !== 'TEZOS') {
        setToBridge({
          name: currentFrom.name,
          image: currentFrom.image,
          buttonImage: currentFrom.buttonImage,
        });
      }
      setOperation('UNBRIDGE');
    } else {
      setConnectBrigeWallet({
        name: bridge.fromTokenName,
        image: bridge.fromTokenImage,
        buttonImage: bridge.buttonImage1,
      });
      if (operation === 'UNBRIDGE') {
        setToBridge({ name: 'TEZOS', image: tezos, buttonImage: '' });
        setOperation('BRIDGE');
      }
    } */
    if (bridge.fromTokenName === 'TEZOS') {
      setOperation('UNBRIDGE');
      setConnectBrigeWallet({
        name: bridge.toTokenName,
        image: bridge.toTokenImage,
        buttonImage: bridge.buttonImage,
      });
    } else {
      setOperation('BRIDGE');
      setConnectBrigeWallet({
        name: bridge.fromTokenName,
        image: bridge.fromTokenImage,
        buttonImage: bridge.buttonImage,
      });
    }
    setToBridge({
      name: bridge.toTokenName,
      image: bridge.toTokenImage,
      buttonImage: bridge.buttonImage2,
    });
    setFromBridge({
      name: bridge.fromTokenName,
      image: bridge.fromTokenImage,
      buttonImage: bridge.buttonImage1,
    });
    setIsBridgeSelected(true);
    handleClose();
  };

  const handleBridgeSelect = () => {
    selector.current = 'BRIDGES';
    setShowChain(true);
  };

  const selectToken = (token) => {
    setFirstTokenAmount('');
    setSecondTokenAmount('');
    setFee(0);

    setTokenIn({
      name: token.name,
      image: token.image,
      tokenData: token.tokenData,
    });
    if (fromBridge.name === 'TEZOS') {
      const outTokenName = BridgeConfiguration.getOutTokenUnbridging(toBridge.name, token.name);
      setTokenOut({
        name: outTokenName,
        image: Object.prototype.hasOwnProperty.call(allTokens, outTokenName)
          ? allTokens[outTokenName]
          : allTokens.fallback,
      });
    } else {
      const outTokenName = BridgeConfiguration.getOutTokenBridging(fromBridge.name, token.name);
      setTokenOut({
        name: outTokenName,
        image: Object.prototype.hasOwnProperty.call(allTokens, outTokenName)
          ? allTokens[outTokenName]
          : allTokens.fallback,
      });
    }
    setIsTokenSelected(true);
    handleClose();
  };

  const handleTokenSelect = () => {
    selector.current = 'TOKENS';
    setShow(true);
  };

  const switchHandler = () => {
    setSwitchButtonPressed(true);
    setFirstTokenAmount('');
    setSecondTokenAmount('');
    setFee(0);
    const currentFrom = {
      name: fromBridge.name,
      image: fromBridge.image,
      buttonImage: fromBridge.buttonImage,
    };
    const currentTo = {
      name: toBridge.name,
      image: toBridge.image,
      buttonImage: toBridge.buttonImage,
    };
    const currentTokenIn = tokenIn.name;
    const currentTokenOut = tokenOut.name;
    const tokenData =
      operation === 'BRIDGE'
        ? loadedTokensList.TEZOS[currentFrom.name].find((token) => token.name === currentTokenOut)
            .tokenData
        : loadedTokensList[currentTo.name].find((token) => token.name === currentTokenOut)
            .tokenData;

    setToBridge({
      name: currentFrom.name,
      image: currentFrom.image,
      buttonImage: currentFrom.buttonImage,
    });
    setFromBridge({
      name: currentTo.name,
      image: currentTo.image,
      buttonImage: currentTo.buttonImage,
    });
    setTokenIn({
      name: currentTokenOut,
      image: Object.prototype.hasOwnProperty.call(allTokens, currentTokenOut)
        ? allTokens[currentTokenOut]
        : allTokens.fallback,
      tokenData,
    });
    setTokenOut({
      name: currentTokenIn,
      image: Object.prototype.hasOwnProperty.call(allTokens, currentTokenIn)
        ? allTokens[currentTokenIn]
        : allTokens.fallback,
    });
    if (operation === 'BRIDGE') {
      setOperation('UNBRIDGE');
    } else {
      setOperation('BRIDGE');
    }
  };

  return (
    <div
      className={`justify-content-center mx-auto col-20 col-md-10 col-lg-12 col-xl-12 mb-3 ${styles.gov} ${animationClass}`}
    >
      <div className={styles.border}>
        <div className={` ${styles.bridgeModal}`}>
          <div>
            <div className={styles.resultsHeader}>
              <p className={styles.heading}>
                Bridge{' '}
                {metamaskAddress && (
                  <OverlayTrigger
                    overlay={(props) => (
                      <Tooltip className="connect-wallet-tooltip wallet-message-tooltip" {...props}>
                        Disconnect Ethereum wallets through wallet.
                      </Tooltip>
                    )}
                    placement="top"
                  >
                    <span className={styles.metamaskAddressText}>{`(${truncateMiddle(
                      metamaskAddress,
                      5,
                      4,
                      '...',
                    )})`}</span>
                  </OverlayTrigger>
                )}
                {metamaskAddress && (
                  <span>
                    <img src={operation === 'UNBRIDGE' ? toBridge.image : fromBridge.image} className={`ml-2 ${styles.walletIcon}`} />
                  </span>
                )}
              </p>
              {walletAddress &&
                metamaskAddress &&
                (isHistoryLoading ? (
                  <p className={`${styles.resLoading} shimmer`}>View history</p>
                ) : (
                  <p
                    className={`${styles.res}`}
                    onClick={() => {
                      setAnimationClass('rightToLeftFadeOutAnimation-4');
                      setTimeout(() => {
                        setTransaction(2);
                      }, 600);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    View history{' '}
                    {pendingTransCount > 0 && (
                      <span className={styles.actionRequiredCount}>{pendingTransCount}</span>
                    )}
                  </p>
                ))}
            </div>
            <div className={`mb-3 ${styles.lineBottom} `}></div>

            <div className={` ${styles.fromBridgeSelectBox}`}>
              <div className={`${styles.selectTokenWrapper} align-items-center`}>
                <div className={`${styles.selectBridgeIcon}`}>
                  <img
                    className={`${styles.selectBridgeIconSvg}`}
                    src={theme === 'light' ? selectbridge : selectbridgeDark}
                    alt={'select-bridge'}
                  />
                </div>
                <div className={` ${styles.fromLabelTop}`}>Select bridge: </div>
              </div>
              <div className={`${styles.dividerSelectBridge}`}></div>
              <div
                className={clsx(
                  'd-flex align-items-center justify-content-between',
                  styles.selectBridgeTop,
                )}
                onClick={handleBridgeSelect}
                style={{ boxShadow: isBridgeSelected && 'none', cursor: 'pointer' }}
              >
                <div className={`${styles.tokenimageWrapper}`}>
                  <img src={fromBridge.image} className={styles.buttonLogo} />
                  <span>{titleCase(fromBridge.name)} </span>
                </div>
                <div>
                  <img
                    className={`${styles.arrowBridgeSvg}`}
                    src={theme === 'light' ? arrowbridge : arrowbridgeDark}
                    alt={'arrow-bridge'}
                  />
                </div>
                <div className={`${styles.tokenimageWrapper}`}>
                  <img src={toBridge.image} className={styles.buttonLogo} />
                  <span>{titleCase(toBridge.name)} </span>
                </div>
                <div className={`${styles.expandMoreWrapper}`}>
                  <span
                    className={`span-themed material-icons-round ${styles.expandMoreSelectBridge}`}
                    style={{ fontSize: '20px' }}
                  >
                    expand_more
                  </span>
                </div>
              </div>
            </div>
            <div className={`my-3 ${styles.lineMid} `}></div>
            <p className={styles.midLabel}>Choose your token and enter the amount</p>
            <div
              className={`mt-2 ${styles.tokenSelectBox} ${
                isTokenInSelected && styles.tokenInSelected
              } ${styles.inputSelectBox} ${isError && styles.inputError}`}
            >
              <div
                className={clsx(styles.selector, styles.toTokenSelector)}
                onClick={handleTokenSelect}
                style={{ boxShadow: isTokenSelected && 'none' }}
              >
                <img src={tokenIn.image} className="button-logo" />
                <span>{tokenIn.name} </span>
                <span className="span-themed material-icons-round" style={{ fontSize: '18px' }}>
                  expand_more
                </span>
              </div>
              <div className={clsx(styles.inputWrapper)}>
                <input
                  type="text"
                  className={`text-right ${styles.tokenUserInput}`}
                  placeholder="0.0"
                  value={firstTokenAmount}
                  onChange={(e) => handleFromTokenInput(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={() => setIsTokenInSelected(false)}
                />
              </div>
            </div>
            <div
              className="flex justify-between"
              style={{ flex: '0 0 100%', marginBottom: '2vh', height: '24px' }}
            >
              <p className={clsx(styles.errorText)}>{isError ? errorMessage : ' '}</p>
              <p className={clsx('wallet-token-balance', styles.balanceText)}>
                {userBalances[tokenIn.name] >= 0 && userBalances[tokenIn.name] !== null && (
                  <>
                    Balance:{' '}
                    <span className={styles.balanceValue} onClick={onClickAmount}>
                      {fromExponential(userBalances[tokenIn.name])}
                    </span>
                  </>
                )}
                {userBalances[tokenIn.name] === null && (
                  <>
                    Balance: <span className="shimmer">0.0000</span>
                  </>
                )}
              </p>
            </div>
            <OverlayTrigger
              overlay={(props) => (
                <Tooltip id={styles.switchTooltip} className="switchTooltip" {...props}>
                  Switch
                </Tooltip>
              )}
              placement="right"
            >
              <div
                className={`mx-auto flex justify-content-center align-items-center ${styles.arrowSwap}`}
                onClick={switchHandler}
              >
                <img src={theme === 'light' ? switchImg : switchImgDark} alt={'switch-image'} />
              </div>
            </OverlayTrigger>

            {/* <div className={`mt-2 ${styles.to}`}>To</div> */}
            <div
              className={`mt-3 ${styles.toBridgeSelectBox} ${styles.inputSelectBox} ${
                isTokenInSelected ? styles.toBridgeSelected : null
              }`}
            >
              <div className={clsx(styles.toBridgeWrapper)}>
                <div className={styles.toBridgeSelector}>
                  <img src={toBridge.image} className="button-logo" />
                  <span>{titleCase(toBridge.name)}</span>
                </div>
                <div className={clsx(styles.lineVertical, 'mx-2')}></div>
                <div className={clsx(styles.inputWrapper)}>
                  <p className={styles.toLabel}>You will receive</p>
                  <OverlayTrigger
                    overlay={
                      secondTokenAmount === '' || secondTokenAmount <= 0 ? (
                        <span></span>
                      ) : (
                        (props) => (
                          <Tooltip className="switchTooltip token-output-tooltip" {...props}>
                            {fromExponential(secondTokenAmount)}
                          </Tooltip>
                        )
                      )
                    }
                    placement="top"
                  >
                    <input
                      type="text"
                      className={`text-left ${styles.toTokenOutput}`}
                      placeholder="0.0"
                      value={fromExponential(secondTokenAmount)}
                      disabled
                    />
                  </OverlayTrigger>
                </div>
              </div>
              <span
                className={`flex justify-content-center align-items-center ml-2 ${styles.toTokenLabel}`}
              >
                {tokenOut.name}
              </span>
            </div>
            <p className={clsx('mt-2', styles.feeEstimateText)}>
              Bridge fee:{' '}
              <span style={{ fontWeight: '700' }}>
                {Number(fee) > 0 ? fromExponential(Number(Number(fee).toFixed(16))) : 0}
                {` ${operation === 'BRIDGE' ? tokenOut.name : tokenIn.name}`}
              </span>
            </p>

            {metamaskAddress === null ? (
              <OverlayTrigger
                overlay={(props) => (
                  <Tooltip className="connect-wallet-tooltip metamask-wallet-tooltip" {...props}>
                    Connect wallet
                  </Tooltip>
                )}
                placement="top"
                show={showMetamaskTooltip}
              >
                <Button
                  className={clsx('px-md-3', 'mt-3', 'w-100', 'connect-wallet-btn', 'button-bg')}
                  onClick={connectWalletHandler}
                >
                  <div className={clsx('connect-wallet-btn')}>
                    <div className="flex flex-row align-items-center">
                      <connectBridgeWallet.buttonImage />
                      <span className="ml-2">
                        Connect to {titleCase(connectBridgeWallet.name)} wallet
                      </span>
                    </div>
                  </div>
                </Button>
              </OverlayTrigger>
            ) : (
              <>
                <Button
                  className={clsx(
                    'px-md-3',
                    'mt-3',
                    'w-100',
                    'connect-wallet-btn',
                    'button-bg',
                    firstTokenAmount === '' ? styles.disabledProceedButton : '',
                  )}
                  onClick={handelClickWithMetaAddedBtn}
                  loading={isLoading}
                >
                  <div className={clsx('connect-wallet-btn')}>
                    <div className="flex flex-row align-items-center">
                      <span className="ml-2">Proceed</span>
                    </div>
                  </div>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <SelectorModal
        show={show}
        onHide={handleClose}
        selectToken={selectToken}
        tokens={[...tokenList].sort((a, b) => a.name.localeCompare(b.name))}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title={'Select a token'}
        selector={selector.current}
      />
      <SelectorModalBridge
        show={showChain}
        onHide={handleClose}
        selectBridge={selectBridge}
        tokens={bridgesList}
        title={'Select a bridge'}
        selector={selector.current}
      />
    </div>
  );
};

BridgeModal.propTypes = {
  transaction: PropTypes.any,
  setTransaction: PropTypes.any,
  walletAddress: PropTypes.any,
  fromBridge: PropTypes.any,
  toBridge: PropTypes.any,
  tokenIn: PropTypes.any,
  tokenOut: PropTypes.any,
  firstTokenAmount: PropTypes.any,
  secondTokenAmount: PropTypes.any,
  fee: PropTypes.any,
  operation: PropTypes.any,
  setFromBridge: PropTypes.any,
  setToBridge: PropTypes.any,
  setTokenIn: PropTypes.any,
  setTokenOut: PropTypes.any,
  setFirstTokenAmount: PropTypes.any,
  setSecondTokenAmount: PropTypes.any,
  setFee: PropTypes.any,
  setOperation: PropTypes.any,
  tokenList: PropTypes.any,
  loadedTokensList: PropTypes.any,
  theme: PropTypes.any,
  setOpeningFromHistory: PropTypes.any,
  metamaskAddress: PropTypes.any,
  currentChain: PropTypes.any,
  metamaskChain: PropTypes.any,
  displayMessage: PropTypes.any,
  setSwitchButtonPressed: PropTypes.any,
  connectWalletHandler: PropTypes.any,
  setIsApproved: PropTypes.any,
  setTransactionTime: PropTypes.any,
};

export default BridgeModal;
