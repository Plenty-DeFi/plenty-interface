import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import './styles/SelectorModal.scss';
import eth from '../../assets/images/bridge/eth.svg';
import tezos from '../../assets/images/bridge/ic_tezos.svg';
import { bridgesList } from '../../constants/bridges';
import matic_normal from '../../assets/images/bridge/tokens/matic_icon.svg';

const SelectorModalBridge = (props) => {
  const chainSelection = [
    {
      name: 'Ethereum to Tezos',
      fromTokenImage: eth,
      fromTokenName: 'RINKEBY',
      toTokenImage: tezos,
      toTokenName: 'TEZOS',
      buttonImage: bridgesList.find((bridge) => bridge.name === 'RINKEBY').buttonImage,
    },
    {
      name: 'Tezos to Ethereum',
      fromTokenImage: tezos,
      fromTokenName: 'TEZOS',
      toTokenImage: eth,
      toTokenName: 'RINKEBY',
      buttonImage: bridgesList.find((bridge) => bridge.name === 'RINKEBY').buttonImage,
    },
    {
      name: 'Polygon to Tezos',
      fromTokenImage: matic_normal,
      fromTokenName: 'MUMBAI',
      toTokenImage: tezos,
      toTokenName: 'TEZOS',
      buttonImage: bridgesList.find((bridge) => bridge.name === 'MUMBAI').buttonImage,
    },
    {
      name: 'Tezos to Polygon',
      fromTokenImage: tezos,
      fromTokenName: 'TEZOS',
      toTokenImage: matic_normal,
      toTokenName: 'MUMBAI',
      buttonImage: bridgesList.find((bridge) => bridge.name === 'MUMBAI').buttonImage,
    },
  ];
  return (
    <Modal show={props.show} onHide={props.onHide} className="selector-modal modal-themed">
      <Modal.Header className="border-bottom-themed flex-column">
        <div className="flex flex-row w-100">
          <Modal.Title className="flex align-items-center">
            <span className="span-themed">{props.title}</span>
          </Modal.Title>
          <Modal.Title className="ml-auto flex align-items-center">
            <span
              onClick={props.onHide}
              style={{ cursor: 'pointer' }}
              className="material-icons-round"
            >
              close
            </span>
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="coin-selection-table">
          <button className="token-select-btn">
            <img src={eth} className="select-token-img-bridge" alt={'etherium'} />
            <span className="chain-topic">Ethereum</span>
          </button>

          <button
            className="token-select-btn"
            onClick={() => props.selectBridge(chainSelection[0])}
          >
            <span className="selectionAlignment">Rinkeby to Tezos</span>
          </button>
          <button
            className="token-select-btn"
            onClick={() => props.selectBridge(chainSelection[1])}
          >
            <span className=" selectionAlignment">Tezos to Rinkeby</span>
          </button>
          <button className="token-select-btn">
            <img src={matic_normal} className="select-token-img-bridge" alt={'matic_normal'} />
            <span className="chain-topic">Polygon</span>
          </button>

          <button
            className="token-select-btn"
            onClick={() => props.selectBridge(chainSelection[2])}
          >
            <span className=" selectionAlignment">Mumbai to Tezos</span>
          </button>
          <button
            className="token-select-btn"
            onClick={() => props.selectBridge(chainSelection[3])}
          >
            <span className="selectionAlignment">Tezos to Mumbai</span>
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

SelectorModalBridge.propTypes = {
  onHide: PropTypes.any,
  searchQuery: PropTypes.any,
  selectBridge: PropTypes.any,
  show: PropTypes.any,
  tokens: PropTypes.any,
  title: PropTypes.string,
  selector: PropTypes.any,
};

export default SelectorModalBridge;
