import PropTypes from 'prop-types';
import clsx from 'clsx';
import { MdChevronRight } from 'react-icons/all';
import { Image, OverlayTrigger, Tooltip } from 'react-bootstrap';
import React, { useMemo, useState } from 'react';
import { tokens } from '../constants/swapPage';

const SwapDetails = (props) => {
  const [isOpen, setOpen] = useState(false);

  const swapRoute = useMemo(() => {
    if (props.routePath?.length > 2) {
      return props.routePath.map((tokenName) => tokens.find((token) => token.name === tokenName));
    }

    return null;
  }, [props.routePath]);

  if (!props.firstTokenAmount && !swapRoute) {
    return null;
  }

  return (
    <div className={clsx('swap-detail-wrapper', isOpen ? 'bg-themed-light' : 'closedbg')}>
      <div className="space-between" onClick={() => setOpen(!isOpen)} style={{ cursor: 'pointer' }}>
        <div className="flex">
          <p className="price-formula whitespace-prewrap  flex flex-row">
            1 {props.tokenIn.name} ={' '}
            <OverlayTrigger
              placement="auto"
              overlay={
                <Tooltip id="swap-token-out-tooltip" {...props}>
                  {props.isStableSwap
                    ? props.computedOutDetails.data.exchangeRate.toFixed(6)
                    : props.routeData.bestRouteUntilNoInput.tokenOutPerTokenIn}
                </Tooltip>
              }
            >
              <div>
                {props.isStableSwap
                  ? props.computedOutDetails.data.exchangeRate.toFixed(3)
                  : props.routeData.bestRouteUntilNoInput.tokenOutPerTokenIn
                  ? props.routeData.bestRouteUntilNoInput.tokenOutPerTokenIn.toFixed(3)
                  : 0}{' '}
                {props.tokenOut.name}
              </div>
            </OverlayTrigger>
          </p>
        </div>
        {isOpen ? (
          <span className="material-icons-round flex open">keyboard_arrow_up</span>
        ) : (
          <span className="material-icons-round flex open">keyboard_arrow_down</span>
        )}
      </div>

      {props.firstTokenAmount &&
        (isOpen ? (
          <>
            <div className="flex flex-row mt-3 align-items-center">
              <p className="swap-detail-amt-details">Minimum received </p>
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip
                    id={'minimum-received-tooltip'}
                    arrowProps={{ styles: { display: 'none' } }}
                  >
                    Your transaction will revert if there is a large, unfavorable price movement
                    before it is confirmed.
                  </Tooltip>
                }
              >
                <span
                  style={{ cursor: 'pointer' }}
                  className="material-icons-round ml-1 swap-detail-amt-details"
                >
                  help_outline
                </span>
              </OverlayTrigger>
              <p className="swap-detail-amt-details ml-auto">
                {props.computedOutDetails.data.finalMinimumOut
                  ? props.computedOutDetails.data.finalMinimumOut
                  : '0.00'}{' '}
                {props.tokenOut.name}
              </p>
            </div>
            <div className="flex flex-row align-items-center">
              <p className="swap-detail-amt-details">Price Impact </p>
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={'price-impact-tooltip'} arrowProps={{ styles: { display: 'none' } }}>
                    The difference between the market price and estimated price due to trade size.
                  </Tooltip>
                }
              >
                <span
                  style={{ cursor: 'pointer' }}
                  className="material-icons-round ml-1 swap-detail-amt-details"
                >
                  help_outline
                </span>
              </OverlayTrigger>
              <p className="swap-detail-amt-details ml-auto">
                {props.computedOutDetails.data.priceImpact
                  ? props.computedOutDetails.data.priceImpact
                  : '0.00'}{' '}
                %
              </p>
            </div>
            <div className="flex flex-row align-items-center">
              <p className="swap-detail-amt-details">Fee </p>
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={'fee-tooltip'} arrowProps={{ styles: { display: 'none' } }}>
                    A portion of each trade (0.10%) goes to liquidity providers as a protocol
                    incentive.
                  </Tooltip>
                }
              >
                <span
                  style={{ cursor: 'pointer' }}
                  className="material-icons-round ml-1 swap-detail-amt-details"
                >
                  help_outline
                </span>
              </OverlayTrigger>
              <p className="swap-detail-amt-details ml-auto">
                {props.isStableSwap
                  ? props.computedOutDetails.data.fees.toFixed(6)
                  : props.firstTokenAmount / 400}{' '}
                {props.isStableSwap ? props.tokenOut.name : props.tokenIn.name}
              </p>
            </div>
            {props.isConfirmSwap && !props.isStableSwap && (
              <div className="flex flex-row align-items-center">
                <p className="swap-detail-amt-details">xPlenty Fee </p>
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip
                      id={'xplenty-fee-tooltip'}
                      arrowProps={{ styles: { display: 'none' } }}
                    >
                      A portion of each trade (0.09%) goes to xPLENTY holders as a protocol
                      incentive.
                    </Tooltip>
                  }
                >
                  <span
                    style={{ cursor: 'pointer' }}
                    className="material-icons-round ml-1 swap-detail-amt-details"
                  >
                    help_outline
                  </span>
                </OverlayTrigger>
                <p className="swap-detail-amt-details ml-auto">
                  {props.firstTokenAmount / 1000} {props.tokenIn.name}
                </p>
              </div>
            )}
            {props.isConfirmSwap ? (
              <div className="flex flex-row align-items-center">
                <p className="swap-detail-amt-details">Slippage tolerance </p>
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip
                      id={'slippage-tolerance-tooltip'}
                      arrowProps={{ styles: { display: 'none' } }}
                    >
                      Change the slippage tolerance in the transaction settings.
                    </Tooltip>
                  }
                >
                  <span
                    style={{ cursor: 'pointer' }}
                    className="material-icons-round ml-1 swap-detail-amt-details"
                  >
                    help_outline
                  </span>
                </OverlayTrigger>
                <p className="swap-detail-amt-details ml-auto">{props.slippage} %</p>
              </div>
            ) : null}
          </>
        ) : null)}

      {isOpen && props.firstTokenAmount && swapRoute && <hr />}
      {isOpen && swapRoute && (
        <>
          <div className="flex flex-row">
            <p className="swap-detail-amt-details">Route </p>
            <OverlayTrigger
              key="top"
              placement="top"
              overlay={
                <Tooltip id={'route-tooltip'} arrowProps={{ styles: { display: 'none' } }}>
                  Routing through these tokens results in the best price for your trade
                </Tooltip>
              }
            >
              <span
                style={{ cursor: 'pointer' }}
                className="material-icons-round ml-1 swap-detail-amt-details"
              >
                help_outline
              </span>
            </OverlayTrigger>
          </div>

          <div className="swap-detail-route-container mt-3">
            {swapRoute.map((token, idx) => (
              <div key={token.name} className="d-flex my-2">
                <Image src={token.image} height={20} width={20} alt={''} />
                <span className="ml-1 my-auto">{token.name}</span>
                {swapRoute[idx + 1] && <MdChevronRight className="" fontSize={20} />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

SwapDetails.propTypes = {
  computedOutDetails: PropTypes.any,
  firstTokenAmount: PropTypes.any,
  routeData: PropTypes.any,
  // midTokens: PropTypes.any,
  tokenIn: PropTypes.any,
  tokenOut: PropTypes.any,
  routePath: PropTypes.any,
  isStableSwap: PropTypes.any,
  slippage: PropTypes.any,
  isConfirmSwap: PropTypes.any,
};

export default SwapDetails;
