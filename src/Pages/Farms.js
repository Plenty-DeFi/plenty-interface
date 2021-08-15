import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';

import FarmCard from '../Components/FarmCard/FarmCard';

import plentyXtz from '../assets/images/farms/plenty-xtz.png';
import plentyToken from '../assets/images/logo_small.png';
import { connect } from 'react-redux';
import * as farmsActions from '../redux/actions/farms/farms.actions'
import * as userActions from '../redux/actions/user/user.action'
import CONFIG from '../config/config';
import PropTypes from "prop-types";
import * as walletActions from '../redux/actions/wallet/wallet.action';
<<<<<<< HEAD
=======
import Switch from "../Components/Ui/Switch/Switch";

>>>>>>> 25ba828f8c5ef439d495ea0f94d149bc1c8fbf34
const Farms = (props) => {
  const [showActiveToken, setShowActiveToken] = useState(false)

  // TODO add redux state prop here
  useEffect(() => {
    renderFarms();
    console.log(props.userAddress);
    props.getFarmsData(props.isActiveOpen)
    
  },[])

  useEffect(() => {
    
      props.getUserStakes(props.userAddress,'FARMS',props.isActiveOpen)
      props.getHarvestValues(props.userAddress,'FARMS',props.isActiveOpen)
    
  },[props.userAddress])


  const farmsCardTypeList = {
    'PLENTY / XTZ LP' :{
      image: plentyXtz,
      harvestImg: plentyToken,
      multi: '100',
      title: 'PLENTY / XTZ LP',
      apr: 0,
      apy: '2621',
      earn: 'PLENTY',
      fee: '0%',
      earned: 0,
      deposit: 'PLENTY - XTZ LP',
      liquidity: '100000',
      withdrawalFee: '0%',
      balance: 0,
      userBalance: 0,
      URL: '',
      active: true,
      source: 'Quipuswap LP',
      rewards: '1000 PLENTY / DAY',
    },
    'KALAM / XTZ LP' :{
      image: plentyXtz,
      harvestImg: plentyToken,
      multi: '100',
      title: 'KALAM / XTZ LP',
      apr: 3,
      apy: '1111',
      earn: 'PLENTY',
      fee: '0%',
      earned: 0,
      deposit: 'KALAM - XTZ LP',
      liquidity: '100000',
      withdrawalFee: '0%',
      balance: 0,
      userBalance: 0,
      URL: '',
      active: true,
      source: 'Quipuswap LP',
      rewards: '1000 KALAM / DAY',
    },
    'hDAO / PLENTY LP' : {
      image: plentyXtz,
      multi: '100',
      title: 'hDAO / PLENTY LP',
      apr: 0,
      apy: '2621',
      earn: 'PLENTY',
      fee: '0%',
      earned: 0,
      deposit: 'PLENTY - XTZ LP',
      liquidity: '1000',
      withdrawalFee: '0%',
      balance: 0,
      userBalance: 0,
      URL: '',
      active: true,
      source: 'Plenty',
      rewards: '1000 PLENTY / DAY',
    },
    'KALAM / PLENTY LP' : {
      image: plentyXtz,
      harvestImg: plentyToken,
      multi: '100',
      title: 'KALAM / PLENTY LP',
      apr: 0,
      apy: '2621',
      earn: 'PLENTY',
      fee: '0%',
      earned: 0,
      deposit: 'PLENTY - XTZ LP',
      liquidity: '5000',
      withdrawalFee: '0%',
      balance: 0,
      userBalance: 0,
      URL: '',
      active: true,
      source: 'Plenty',
      rewards: '1000 PLENTY / DAY',
    },
  };

  const renderFarms = () => {
    let farmsToBeRendered = []
    for(let key in CONFIG.FARMS[CONFIG.NETWORK])
    {
      for(let farms in CONFIG.FARMS[CONFIG.NETWORK][key][props.isActiveOpen === true ? 'active' : 'inactive'])
      {
        farmsToBeRendered.push({
          farmData : CONFIG.FARMS[CONFIG.NETWORK][key][props.isActiveOpen === true ? 'active' : 'inactive'][farms],
          properties : farmsCardTypeList[CONFIG.FARMS[CONFIG.NETWORK][key][props.isActiveOpen === true ? 'active' : 'inactive'][farms].CARD_TYPE],
          identifier : key,
          location : farms,
          withdrawalFeeStructure : CONFIG.withdrawalFeeDistribution[CONFIG.FARMS[CONFIG.NETWORK][key][props.isActiveOpen === true ? 'active' : 'inactive'][farms].withdrawalFeeType],
          title : CONFIG.FARMS[CONFIG.NETWORK][key][props.isActiveOpen === true ? 'active' : 'inactive'][farms].CARD_TYPE
        })
      }
    }
    props.setFarmsToRender(farmsToBeRendered)
    //setFarmsToRender(farmsToBeRendered)
  }

  return (
    <>
    <div>
    <Container fluid className="page-layout-container">
      <Row className="mb-4 justify-content-center">
        <Switch
          value={showActiveToken}
          onChange={() => setShowActiveToken(!showActiveToken)}
          trueLabel={'Active'}
          falseLabel={'Inactive'}
          inverted={true}
        />
      </Row>
      <Row>
        {
          props.farmsToRender.map((farm, index) => {
            return <FarmCard 
              handleStakeOfFarmInputValue = {props.handleStakeOfFarmInputValue}
              harvestOnFarm = {props.harvestOnFarm}
              stakeInputValues={props.stakeInputValues} 
              stakeOnFarm = {props.stakeOnFarm}
              openFarmsStakeModal = {props.openFarmsStakeModal}
              closeFarmsStakeModal={props.closeFarmsStakeModal}
              openFarmsUnstakeModal={props.openFarmsUnstakeModal}
              closeFarmsUnstakeModal={props.closeFarmsUnstakeModal}
              connectWallet={props.connectWallet}

              isActiveOpen = {props.isActiveOpen}
              activeFarmData = {props.activeFarmData}
              userStakes = {props.userStakes}
              harvestValueOnFarms = {props.harvestValueOnFarms}
              isStakeModalOpen={props.isStakeModalOpen}
              userAddress={props.userAddress}
              isUnstakeModalOpen={props.isUnstakeModalOpen}
              currentBlock={props.currentBlock}
              
              key={index} 
              {...farm.properties} 
              {...farm.farmData} 
              identifier={farm.identifier} 
              position={farm.location} 
              {...props}
            />;
        })}
      </Row>
    </Container>
    </div>
    
    </>
  );
};


Farms.propTypes = {
  walletAddress: PropTypes.string.isRequired
}

const mapStateToProps = state => {
  return {
    userAddress : state.wallet.address,
    isActiveOpen : state.farms.isActiveOpen,
    stakeInputValues : state.farms.stakeInputValues,
    activeFarmData : state.farms.active,
    farmsToRender : state.farms.farmsToRender,
    userStakes : state.user.stakes,
    harvestValueOnFarms : state.user.harvestValueOnFarms,
    isStakeModalOpen : state.farms.isStakeModalOpen,
    isUnstakeModalOpen : state.farms.isUnstakeModalOpen,
    currentBlock : state.user.currentBlock

  }
}

const mapDispatchToProps = dispatch => {
  return {
    connectWallet : () => (dispatch(walletActions.connectWallet())),
    toggleFarmsType : () => (dispatch(farmsActions.toggleFarmsType)),
    stakeOnFarm : (amount, farmIdentifier , isActive, position) => dispatch(farmsActions.stakeOnFarm(amount, farmIdentifier , isActive, position)),
    harvestOnFarm : (farmIdentifier, isActive, position) => dispatch(farmsActions.harvestOnFarm(farmIdentifier, isActive, position)),
    handleStakeOfFarmInputValue : (address,value) => dispatch(farmsActions.handleStakeOfFarmInputValue(address,value)),
    getFarmsData : (isActive) => (dispatch(farmsActions.getFarmsData(isActive))),
    setFarmsToRender  : (farmsToBeRender) => (dispatch(farmsActions.setFarmsToRender(farmsToBeRender))),
    getUserStakes : (address , type , isActive) => (dispatch(userActions.getUserStakes(address , type , isActive))),
    getHarvestValues : (address , type , isActive) => (dispatch(userActions.getHarvestValues(address , type , isActive))),
    openFarmsStakeModal : () => (dispatch(farmsActions.openFarmsStakeModal())),
    closeFarmsStakeModal : () => (dispatch(farmsActions.closeFarmsStakeModal())),
    openFarmsUnstakeModal : () => (dispatch(farmsActions.openFarmsUnstakeModal())),
    closeFarmsUnstakeModal : () => (dispatch(farmsActions.closeFarmsUnstakeModal()))
  }
}


export default connect(mapStateToProps,mapDispatchToProps)(Farms);

