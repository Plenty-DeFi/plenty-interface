import PropTypes from 'prop-types';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import FooterWA from '../../assets/images/footerWA.svg';
import '../../assets/scss/animation.scss';
import SwapWA from './SwapWA';
import cubeLight from '../../assets/images/WrappedAssets/cube-light.png';
import cubeDark from '../../assets/images/WrappedAssets/cube-dark.png';

const WrappedAssets = (props) => {
  const lightBG = {
    backgroundImage: `url(${cubeLight})`,
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
  };

  const darkBG = {
    backgroundImage: `url(${cubeDark})`,
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <Container fluid style={props.theme === 'light' ? lightBG : darkBG}>
      <Row>
        <Col sm={8} md={6} className="swap-content-section wrapped-assets-margin-top">
          <SwapWA {...props} />

          <div className="bottom-footer mt-2 flex flex-row">
            <div>
              <img src={props.theme === 'light' ? FooterWA : FooterWA} alt="graph"></img>
            </div>
            <div className="ml-3">
              <span className="bottom-label">Swap Wrapped Assets </span>
              <p className="bottom-desc">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>

              <>
                <span className="bottom-last">
                  <a
                    href="https://medium.com/plenty-defi/introducing-stable-swaps-on-plenty-trade-similarly-priced-assets-with-low-slippage-518efc56ca40"
                    className="text-decoration-none"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="learn-more" style={{ cursor: 'pointer' }}>
                      Learn More
                    </span>
                  </a>
                </span>
              </>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default WrappedAssets;

WrappedAssets.propTypes = {
  connecthWallet: PropTypes.any,
  walletAddress: PropTypes.any,
  theme: PropTypes.any,
};
