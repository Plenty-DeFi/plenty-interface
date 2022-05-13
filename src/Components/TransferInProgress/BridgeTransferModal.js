/* eslint-disable no-unused-vars */
import PropTypes, { number } from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import styles from './Transfer.module.scss';
import Button from '../Ui/Buttons/Button';
import { ReactComponent as Tick } from '../../assets/images/bridge/green_tick.svg';
import { ReactComponent as Link } from '../../assets/images/linkIcon.svg';
import { ReactComponent as FeeIcon } from '../../assets/images/bridge/fee_icon.svg';
import dummyApiCall from '../../apis/dummyApiCall';
import LoadingRing from '../Ui/LoadingRing/loadingRing';
import './bridge.modules.scss';
import '../../assets/scss/animation.scss';
import { bridgesList } from '../../constants/bridges';
import { ReactComponent as FeeBigIcon } from '../../assets/images/bridge/fee_big_icon.svg';
import { ReactComponent as ProcessSuccess } from '../../assets/images/bridge/process_success.svg';
import HistoryIcon from '../../assets/images/bridge/history_icon.svg';
import HomeIcon from '../../assets/images/bridge/home_icon.svg';
import HistoryIconDark from '../../assets/images/bridge/history_icon_dark.svg';
import HomeIconDark from '../../assets/images/bridge/home_icon_dark.svg';
import ApproveModal from './ApproveModal';
import BridgeUnbridgeModal from './BridgeUnbridgeModal';
import MintReleaseModal from './MintReleaseModal';
import DoneModal from './DoneModal';
import {
  approveToken,
  wrap,
  getMintStatus,
  mintTokens,
  getBalanceTez,
  unwrap,
  getReleaseStatus,
  releaseTokens,
  getHistory,
  getApproveTxCost,
  getCurrentNetwork,
} from '../../apis/bridge/bridgeAPI';
const BridgeTransferModal = (props) => {
  const [animationClass, setAnimationClass] = useState('rightToLeftFadeInAnimation-4');
  //const [currentProgress,SetCurrentProgress]=useState(4);
  const [isButtonLoading, SetIsButtonLoading] = useState(false);
  const [isApproveLoading, setIsApproveLoading] = useState(false);
  const approveHash = useRef(null);
  //const [mintUnmintOpHash, setMintUnmintOpHash] = useState(null);
  //const mintUnmintOpHash = useRef(null);
  //const finalOpHash = useRef(null);
  //const [wrappedUnwrappedData, setWrapUnwrapData] = useState(null);
  const wrappedUnwrappedData = useRef(null);

  const setWrapUnwrapData = (data) => {
    wrappedUnwrappedData.current = data;
  };

  const setApproveHash = (hash) => {
    approveHash.current = hash;
  };

  useEffect(() => {
    console.log('Bridge transfer component rendered');
  }, []);

  // const setMintUnmintOpHash = (hash) => {
  //   mintUnmintOpHash.current = hash;
  // };

  // const setFinalOpHash = (hash) => {
  //   finalOpHash.current = hash;
  // };

  const isCurrentProgressCompleted = (currentProgres) => {
    return currentProgres > currentProgres;
  };

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
    currentProgress,
    operation,
    selectedId,
    setFromBridge,
    setToBridge,
    setTokenIn,
    setTokenOut,
    setFirstTokenAmount,
    setSecondTokenAmount,
    setFee,
    SetCurrentProgress,
    setOperation,
    resetToDefaultStates,
    setTransactionData,
    getTransactionListLength,
    setSelectedId,
    theme,
    mintUnmintOpHash,
    setMintUnmintOpHash,
    finalOpHash,
    setFinalOpHash,
    openingFromHistory,
    displayMessage,
    setOpeningFromHistory,
    isApproved,
    setIsApproved,
    setOpeningFromTransaction,
  } = props;

  const setBack = (value) => {
    setAnimationClass('leftToRightFadeOutAnimation-4');
    setTimeout(() => {
      if (value) {
        setTransaction(1);
      }
    }, 600);
  };

  const bridgeButtonClick = async () => {
    SetIsButtonLoading(true);
    //getApproveTxCost
    /*     getApproveTxCost(tokenIn, fromBridge.name, firstTokenAmount).then((res) => {
      console.log('fee:', res);
      approveToken(tokenIn, fromBridge.name, firstTokenAmount).then((data) => {
        console.log(data);
        SetIsButtonLoading(false);
      });
    }); */
    //getHistory
    /*     const data = await getHistory({
      tzAddress: 'tz1hA9rHfejN9qYup2abtPs8LPFHZEiP8TAX',
      ethereumAddress: '0xb41f25a011B1d84d66eA1f8E803cb8d42ed3Ef26',
    });
    console.log(data.history);
    SetIsButtonLoading(false); */

    //getReleaseStatus
    /*     getReleaseStatus('ooWF1KUxzQRWn8TcnRMBpViuZkGWUvKZDK3uCiy4obnAgSYhxc9', toBridge.name).then(
      async (data) => {
        console.log(data);
        //release token Call
        const result = await releaseTokens(data.data, toBridge.name);
        console.log(result);
        SetIsButtonLoading(false);
      },
    ); */

    //unwrap call
    /*     const result = await unwrap(toBridge.name, firstTokenAmount, tokenIn);
    console.log(result); */

    //get Balance tez
    /*    const balance = await getBalanceTez(
      'KT1JCrNtQCS1taDngHfaLUnnMi5EJYMy4jEC',
      0,
      walletAddress,
      18,
    );
    console.log(balance.balance); */

    //Approve call
    /*        approveToken(tokenIn, fromBridge.name, firstTokenAmount).then((data) => {
      console.log(data);
      SetIsButtonLoading(false);
    });  */

    //Wrap call
    /*     wrap(tokenIn, fromBridge.name, firstTokenAmount, walletAddress).then((data) => {
      console.log(data);
      SetIsButtonLoading(false);
    }); */

    //Check Mint Status
    /*     getMintStatus(
      '0x952fadffdfb333e14eeee98ab22a9adcbd92c456a14b13eb193f2ae81eb906e0',
      fromBridge.name,
    ).then((data) => {
      console.log(data);
      SetIsButtonLoading(false);
    }); */

    //mint call
    /*     mintTokens(data.data, fromBridge.name).then((data) => {
      console.log(data);
      SetIsButtonLoading(false);
    }); */

    
  };
  //const numberOfSteps = ['Approve', 'Bridge', 'Mint', 'Done'];
  const numberOfSteps = [
    // { BRIDGE: 'Approve', UNBRIDGE: '' },
    { BRIDGE: 'Lock', UNBRIDGE: 'Unbridge' },
    { BRIDGE: 'Mint', UNBRIDGE: 'Release' },
    { BRIDGE: 'Complete', UNBRIDGE: 'Complete' },
  ];
  const defaultTile = (buttonText, index) => {
    return (
      <p className={styles.progressLabel + ' leftToRightFadeInAnimation-4-bridge'} key={index}>
        <div className="flex flex-row">
          <span className={styles.defaultRadioButton}></span>
          <span>{buttonText}</span>
        </div>
        <p className={styles.defaultProgressLine}></p>
      </p>
    );
  };
  const completedTile = (buttonText, index) => {
    return (
      <p
        className={`${styles.completedLabel} ${styles.progressLabel} leftToRightFadeInAnimation-4-bridge`}
        key={index}
      >
        <div className="flex flex-row">
          {/* <span className={styles.defaultRadioButton}></span> */}
          <span className={styles.greenTick}>
            <Tick />
          </span>
          <span>{buttonText}</span>
        </div>
        <p className={styles.completedProgress}></p>
      </p>
    );
  };
  const currentTile = (buttonText, index) => {
    return (
      <p className={styles.progressLabel + ' leftToRightFadeInAnimation-4-bridge'} key={index}>
        <div className="flex flex-row">
          <span className={styles.radioButton}></span>
          <span className={styles.activeLabel}>{buttonText}</span>
        </div>
        <p className={styles.progressLine}></p>
      </p>
    );
  };

  return (
    <div
      className={`row justify-content-center mx-auto col-24 col-md-10 col-lg-10 col-xl-10 ${styles.gov} ${animationClass}`}
    >
      <div className={styles.border}>
        <div
          className={` ${styles.bridgeModal}`}
        >
          <div>
          <div className="flex flex-row justify-content-between mb-3">
            <div className={`flex ${styles.headingWrapper}`}>
              {(currentProgress === 0 ||
                (currentProgress === 1 && openingFromHistory)) && (
                <p
                  className={styles.arrowback}
                  onClick={
                    currentProgress === 1 && openingFromHistory
                      ? () => {
                          setAnimationClass('leftToRightFadeOutAnimation-4');
                          setOpeningFromTransaction(true);
                          setTimeout(() => {
                            resetToDefaultStates();
                            setTransaction(2);
                          }, 600);
                          
                        }
                      : isApproveLoading
                      ? null
                      : () => {
                          setBack(1);
                        }
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <span className="mr-3 material-icons-round ">arrow_back</span>
                </p>
              )}
              {currentProgress === numberOfSteps.length ? (
                <div className="flex flex-column">
                  <p className={styles.TransferInProgress}>Transaction Details</p>
                  <p className={styles.reviewText}>Review you transaction</p>
                </div>
              ) : currentProgress === numberOfSteps.length - 1 ? (
                <p className={styles.TransferInProgress}>
                  {operation === 'BRIDGE' ? 'Minting' : 'Release'} in progress
                </p>
              ) : (
                <p className={styles.TransferInProgress}>Transfer in progress</p>
              )}
            </div>
            {(currentProgress === numberOfSteps.length || currentProgress === 1) && (
              <div>
                {currentProgress === numberOfSteps.length && (
                  <img
                    src={theme === 'light' ? HistoryIcon : HistoryIconDark}
                    alt="History"
                    className={`${styles.historyIcon} ${styles.transactionIcons}`}
                    onClick={() => {
                      setAnimationClass('leftToRightFadeOutAnimation-4');
                      setOpeningFromTransaction(true);
                      setTimeout(() => {
                        resetToDefaultStates();
                        setTransaction(2);
                      }, 600);
                    }}
                  ></img>
                )}
                <img
                  src={theme === 'light' ? HomeIcon : HomeIconDark}
                  alt="Home"
                  className={styles.transactionIcons}
                  onClick={() => {
                    setAnimationClass('leftToRightFadeOutAnimation-4');
                    setTimeout(() => {
                      resetToDefaultStates();
                      setTransaction(1);
                    }, 600);
                  }}
                ></img>
              </div>
            )}
          </div>
          <div className={`mb-4 mt-2 ${styles.lineBottom} `}></div>
          <div className={`${styles.resultsHeader} rightToLeftFadeInAnimation-4`}>
            {
              numberOfSteps.map((currentStep, index) => {
                if (currentProgress > index) {
                  return completedTile(currentStep[operation], index);
                } else if (currentProgress === index) {
                  return currentTile(currentStep[operation], index);
                } else {
                  return defaultTile(currentStep[operation], index);
                }
              })
            /* {operation === 'BRIDGE'
              ? numberOfSteps.map((currentStep, index) => {
                  if (currentProgress > index) {
                    return completedTile(currentStep[operation]);
                  } else if (currentProgress === index) {
                    return currentTile(currentStep[operation]);
                  } else {
                    return defaultTile(currentStep[operation]);
                  }
                })
              : numberOfSteps.slice(-3).map((currentStep, index) => {
                  if (currentProgress - 1 > index) {
                    return completedTile(currentStep[operation]);
                  } else if (currentProgress - 1 === index) {
                    return currentTile(currentStep[operation]);
                  } else {
                    return defaultTile(currentStep[operation]);
                  }
                })} */}
          </div>
          <div className={`mb-4 ${styles.lineBottom} `}></div>
          {/* {currentProgress === 0 && (
            <ApproveModal
              description={`${fromBridge.name} transactions can take  longer time to complete based upon the network congestion.`}
              gasFees={fee}
              setBack={setBack}
              currentProgress={currentProgress}
              getTransactionListLength={getTransactionListLength}
              operation={operation}
              fromBridge={fromBridge}
              toBridge={toBridge}
              tokenIn={tokenIn}
              tokenOut={tokenOut}
              firstTokenAmount={firstTokenAmount}
              secondTokenAmount={secondTokenAmount}
              setTransactionData={setTransactionData}
              SetCurrentProgress={SetCurrentProgress}
              setSelectedId={setSelectedId}
              setApproveHash={setApproveHash}
              theme={theme}
              displayMessage={displayMessage}
              resetToDefaultStates={resetToDefaultStates}
              isApproveLoading={isApproveLoading}
              setIsApproveLoading={setIsApproveLoading}
            />
          )} */}
          {currentProgress === 0 && (
            <BridgeUnbridgeModal
              description={`${fromBridge.name} transactions can take  longer time to complete based upon the network congestion.`}
              gasFees={fee}
              currentProgress={currentProgress}
              getTransactionListLength={getTransactionListLength}
              operation={operation}
              fromBridge={fromBridge}
              toBridge={toBridge}
              tokenIn={tokenIn}
              tokenOut={tokenOut}
              firstTokenAmount={firstTokenAmount}
              secondTokenAmount={secondTokenAmount}
              setTransactionData={setTransactionData}
              selectedId={selectedId}
              SetCurrentProgress={SetCurrentProgress}
              walletAddress={walletAddress}
              setMintUnmintOpHash={setMintUnmintOpHash}
              setSelectedId={setSelectedId}
              approveHash={approveHash.current}
              theme={theme}
              displayMessage={displayMessage}
              setBack={setBack}
              setApproveHash={setApproveHash}
              resetToDefaultStates={resetToDefaultStates}
              isApproveLoading={isApproveLoading}
              setIsApproveLoading={setIsApproveLoading}
              isApproved={isApproved}
              setIsApproved={setIsApproved}
            />
          )}
          {currentProgress === 1 && (
            <MintReleaseModal
              description={`${fromBridge.name} transactions can take  longer time to complete based upon the network congestion.`}
              gasFees={fee}
              currentProgress={currentProgress}
              operation={operation}
              setTransactionData={setTransactionData}
              selectedId={selectedId}
              SetCurrentProgress={SetCurrentProgress}
              mintUnmintOpHash={mintUnmintOpHash}
              fromBridge={fromBridge}
              setWrapUnwrapData={setWrapUnwrapData}
              toBridge={toBridge}
              theme={theme}
              displayMessage={displayMessage}
            />
          )}
          {currentProgress > 1 && (
            <DoneModal
              transactionFees={fee}
              currentProgress={currentProgress}
              numberOfSteps={numberOfSteps}
              tokenOut={tokenOut}
              secondTokenAmount={secondTokenAmount}
              fromBridge={fromBridge}
              toBridge={toBridge}
              operation={operation}
              SetCurrentProgress={SetCurrentProgress}
              wrappedUnwrappedData={wrappedUnwrappedData.current}
              selectedId={selectedId}
              setTransactionData={setTransactionData}
              finalOpHash={finalOpHash}
              setFinalOpHash={setFinalOpHash}
              openingFromHistory={openingFromHistory}
              displayMessage={displayMessage}
              tokenIn={tokenIn}
              setOpeningFromHistory={setOpeningFromHistory}
            />
          )}
          {/* code will go here */}
          {/* <InSideElement
            label={
              numberOfSteps < numberOfSteps.length
                ? numberOfSteps[currentProgress][operation]
                : 'Done'
            }
            description={`${fromBridge.name}  transactions can take  longer time to complete based upon the network congestion.`}
            transactionFees={fee}
          /> */}
          {/*  */}
          </div>
        </div>
      </div>
    </div>
  );
};

BridgeTransferModal.propTypes = {
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
  currentProgress: PropTypes.any,
  operation: PropTypes.any,
  setFromBridge: PropTypes.any,
  setToBridge: PropTypes.any,
  setTokenIn: PropTypes.any,
  setTokenOut: PropTypes.any,
  setFirstTokenAmount: PropTypes.any,
  setSecondTokenAmount: PropTypes.any,
  setFee: PropTypes.any,
  SetCurrentProgress: PropTypes.any,
  setOperation: PropTypes.any,
  resetToDefaultStates: PropTypes.any,
  setTransactionData: PropTypes.any,
  getTransactionListLength: PropTypes.any,
  selectedId: PropTypes.any,
  setSelectedId: PropTypes.any,
  theme: PropTypes.any,
  mintUnmintOpHash: PropTypes.any,
  setMintUnmintOpHash: PropTypes.any,
  finalOpHash: PropTypes.any,
  setFinalOpHash: PropTypes.any,
  openingFromHistory: PropTypes.any,
  displayMessage: PropTypes.any,
  setOpeningFromHistory: PropTypes.any,
  isApproved: PropTypes.any,
  setIsApproved: PropTypes.any,
  setOpeningFromTransaction: PropTypes.any,
};

export default BridgeTransferModal;
