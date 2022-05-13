/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import styles from './Transfer.module.scss';
import Button from '../Ui/Buttons/Button';

import { ReactComponent as Link } from '../../assets/images/linkIcon.svg';
import GasIcon from '../../assets/images/bridge/gas_fee_icon.svg';
import GasIconDark from '../../assets/images/bridge/gas_fee_icon_dark.svg';
import { useState } from 'react';
import { wrap, unwrap, approveToken } from '../../apis/bridge/bridgeAPI';
import CONFIG from '../../config/config';
import { FLASH_MESSAGE_DURATION } from '../../constants/global';

const BridgeUnbridgeModal = (props) => {
  const [isButtonLoading, SetIsButtonLoading] = useState(false);
  const {
    description,
    gasFees,
    currentProgress,
    getTransactionListLength,
    operation,
    fromBridge,
    toBridge,
    tokenIn,
    tokenOut,
    firstTokenAmount,
    secondTokenAmount,
    setTransactionData,
    selectedId,
    SetCurrentProgress,
    walletAddress,
    setMintUnmintOpHash,
    setSelectedId,
    approveHash,
    theme,
    displayMessage,
    setBack,
    setApproveHash,
    resetToDefaultStates,
    isApproveLoading,
    setIsApproveLoading,
    isApproved,
    setIsApproved,
  } = props;

  const bridgeButtonClick = async () => {
    SetIsButtonLoading(true);
    if (operation === 'BRIDGE') {
      const bridgeUnbridgeResult = await wrap(
        tokenIn,
        fromBridge.name,
        firstTokenAmount,
        walletAddress,
      );
      console.log(operation + ' Results: ');
      console.log(bridgeUnbridgeResult);
      if (bridgeUnbridgeResult.success) {
        setMintUnmintOpHash(bridgeUnbridgeResult.transactionHash);
        displayMessage({
          type: 'success',
          duration: FLASH_MESSAGE_DURATION,
          title: 'Lock call Successful',
          content: `${Number(firstTokenAmount).toFixed(3)} ${tokenIn.name} locked successfully.`,
          isFlashMessageALink: false,
          flashMessageLink: '#',
        });
        SetIsButtonLoading(false);
        SetCurrentProgress(currentProgress + 1);
      } else {
        console.log(bridgeUnbridgeResult.error);
        displayMessage({
          type: 'error',
          duration: FLASH_MESSAGE_DURATION,
          title: 'Lock Failed',
          content: 'Failed to lock tokens. Please try again.',
          isFlashMessageALink: false,
          flashMessageLink: '#',
        });
        SetIsButtonLoading(false);
      }
    } else {
      const bridgeUnbridgeResult = await unwrap(toBridge.name, firstTokenAmount, tokenIn);
      console.log(operation + ' Results: ');
      console.log(bridgeUnbridgeResult);
      if (bridgeUnbridgeResult.success) {
        setMintUnmintOpHash(bridgeUnbridgeResult.txHash);
        displayMessage({
          type: 'success',
          duration: FLASH_MESSAGE_DURATION,
          title: 'Unwrap Successful',
          content: `${Number(firstTokenAmount).toFixed(3)} ${tokenIn.name} unwrapped successfully.`,
          isFlashMessageALink: false,
          flashMessageLink: '#',
        });
        SetIsButtonLoading(false);
        SetCurrentProgress(currentProgress + 1);
      } else {
        console.log(bridgeUnbridgeResult.error);
        displayMessage({
          type: 'error',
          duration: FLASH_MESSAGE_DURATION,
          title: 'Unwrap Failed',
          content: 'Failed to unwrap tokens. Please try again.',
          isFlashMessageALink: false,
          flashMessageLink: '#',
        });
        SetIsButtonLoading(false);
      }
    }
  };

  const approveButtonClick = async () => {
    setIsApproveLoading(true);
    const approveResult = await approveToken(tokenIn, fromBridge.name, firstTokenAmount);
    console.log('Approve Results: ');
    console.log(approveResult);
    if (approveResult.success) {
      setApproveHash(approveResult.transactionHash);
      displayMessage({
        type: 'success',
        duration: FLASH_MESSAGE_DURATION,
        title: 'Transaction Approved',
        content: `${Number(firstTokenAmount).toFixed(3)} ${
          tokenIn.name
        } are approved to the bridge.`,
        isFlashMessageALink: false,
        flashMessageLink: '#',
      });
      setIsApproveLoading(false);
      setIsApproved(true);
      //SetCurrentProgress(currentProgress + 1);
    } else {
      console.log(approveResult.error);
      displayMessage({
        type: 'error',
        duration: FLASH_MESSAGE_DURATION,
        title: 'Approval Failed',
        content: 'Failed to approve transaction. Please try again.',
        isFlashMessageALink: false,
        flashMessageLink: '#',
      });
      setIsApproveLoading(false);
      setIsApproved(false);
    }
  };

  return (
    <>
      <p className={styles.contentLabel}>{operation === 'BRIDGE' ? 'Locking' : 'Unbridging'}</p>
      <p className={styles.contentDes}>{description}</p>
      <div className={`mt-4 mb-3 ${styles.lineBottom} `}></div>
      {operation === 'BRIDGE' && (<div className={`${styles.topInfo} my-2`}>
        Grant permission to allow the bridge to interact with the token you want to bridge.{' '}
      </div>)}
      <div className={styles.resultsHeader}>
        {operation === 'UNBRIDGE' && (
          <>
            <div style={{ width: '50%' }}></div>
            <div style={{ width: '50%' }}>
              <Button
                color={'primary'}
                className={`xplenty-btn mt-2  flex align-items-center justify-content-center ${styles.progressButtons}`}
                onClick={bridgeButtonClick}
                loading={isButtonLoading}
              >
                Unbridge
              </Button>
            </div>
          </>
        )}
        {operation === 'BRIDGE' &&
          (!isApproved ? (
            <>
              <div style={{ width: '50%' }}>
                <Button
                  color={'primary'}
                  className={`xplenty-btn mt-2 flex align-items-center justify-content-center ${styles.progressButtons}`}
                  onClick={approveButtonClick}
                  loading={isApproveLoading}
                >
                  Approve
                </Button>
              </div>
              <div style={{ width: '50%' }}>
                <Button
                  color={'primary'}
                  className={`xplenty-btn mt-2 flex align-items-center justify-content-center ${styles.progressButtons}`}
                  style={{ cursor: 'not-allowed' }}
                  disabled={true}
                >
                  Lock
                </Button>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: '50%' }}>
                <Button
                  color={'default'}
                  className={`xplenty-btn mt-2 flex align-items-center justify-content-center ${styles.progressButtons} ${styles.approvedButton}`}
                  style={{ cursor: 'not-allowed' }}
                  disabled={true}
                >
                  <div className='flex'>
                    <span>Approve</span>
                    <span
                      className={`material-icons-round ${styles.checkMark}`}
                      style={{ display: 'inline-block', marginLeft: '10px', fontSize: '20px' }}
                    >
                      check_circle
                    </span>
                  </div>
                </Button>
              </div>
              <div style={{ width: '50%' }}>
                <Button
                  color={'primary'}
                  className={`xplenty-btn mt-2 flex align-items-center justify-content-center ${styles.progressButtons}`}
                  onClick={bridgeButtonClick}
                  loading={isButtonLoading}
                >
                  Lock
                </Button>
              </div>
            </>
          ))}
      </div>

      <div className={`mt-4 mb-3 ${styles.lineBottom} `}></div>
      <div className={styles.feeInfoWrapper}>
        {/* <img
          src={theme === 'light' ? GasIcon : GasIconDark}
          alt="GasIcon"
          style={{ height: '20px' }}
        ></img> */}
        {/* <p className={styles.bottomInfo}>Review your gas fee in your wallet</p> */}
        {/* <p className={`${styles.bottomInfo} ${styles.feeValue}`}>~{Number(gasFees).toFixed(6)}</p> */}
      </div>
    </>
  );
};

BridgeUnbridgeModal.propTypes = {
  description: PropTypes.any,
  gasFees: PropTypes.any,
  currentProgress: PropTypes.any,
  getTransactionListLength: PropTypes.any,
  operation: PropTypes.any,
  fromBridge: PropTypes.any,
  toBridge: PropTypes.any,
  tokenIn: PropTypes.any,
  tokenOut: PropTypes.any,
  firstTokenAmount: PropTypes.any,
  secondTokenAmount: PropTypes.any,
  setTransactionData: PropTypes.any,
  selectedId: PropTypes.any,
  SetCurrentProgress: PropTypes.any,
  walletAddress: PropTypes.any,
  setMintUnmintOpHash: PropTypes.any,
  setSelectedId: PropTypes.any,
  approveHash: PropTypes.any,
  theme: PropTypes.any,
  displayMessage: PropTypes.any,
  setBack: PropTypes.any,
  setApproveHash: PropTypes.any,
  resetToDefaultStates: PropTypes.any,
  isApproveLoading: PropTypes.any,
  setIsApproveLoading: PropTypes.any,
  isApproved: PropTypes.any,
  setIsApproved: PropTypes.any,
};

export default BridgeUnbridgeModal;
