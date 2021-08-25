import { createSlice } from "@reduxjs/toolkit";
import { FARM_PAGE_MODAL } from "../../../constants/farmsPage";
import {
  activeFarmsActions,
  harvestFarmsAction,
  inactiveFarmsActions,
  otherFarmsActions,
  stakingFarmsActions,
  unstakingFarmsAction
} from "./farms.action";

const initialState = {
  data: {
    active: [],
    inactive: [],
  },
  active: {
    isPresent: false,
    loading: false,
  },
  inactive: {
    isPresent: false,
    loading: false,
  },
  stakeOperation: {
    isLoading: false,
    processing: false,
    completed: false,
    failed: false,
    operationHash: null
  },
  unstakeOperation: {
    isLoading: false,
    processing: false,
    completed: false,
    failed: false,
    operationHash: null
  },
  harvestOperation: {
    isLoading: false,
    completed: false,
    failed: false,
    operationHash: null,
    tokenPair: null
  },
  modals: {
    open: FARM_PAGE_MODAL.NULL,
    contractAddress: null,
    transactionId: '',
    snackbar: false,
  },
  isActiveOpen: true,
  stakeInputValue: 0,
  farmsToRender: [],
  isStakeModalOpen: false,
  stakeModalIdentifier: '',
  stakeModalTitle: '',
  stakeModalFarmPosition: -1,
  stakeModalContractAddress: '',
  isUnstakeModalOpen: false,
  unstakeModalIdentifier: '',
  unstakeModalContractAddress: '',
  unstakeModalFarmPosition: -1,
  unstakeModalTitle: '',
  unstakeModalwithdrawalFeeStructure: []
}

export const farmsSlice = createSlice({
  name: 'farms',
  initialState,
  reducers: {
    ...activeFarmsActions,
    ...inactiveFarmsActions,
    ...stakingFarmsActions,
    ...unstakingFarmsAction,
    ...harvestFarmsAction,
    ...otherFarmsActions,
  }
})

export const {
  // * Active Farms
  startActiveFarmDataFetching,
  activeFarmDataFetchingSuccesfull,
  activeFarmDataFetchingFailed,
  clearActiveFarmsData,

  // * Inactive Farms
  startInactiveFarmDataFetching,
  inactiveFarmDataFetchingSuccesfull,
  inactiveFarmDataFetchingFailed,
  clearInactiveFarmsData,

  // * Stake Farms
  initiateStakingOperationOnFarm,
  stakingOnFarmProcessing,
  stakingOnFarmSuccessFull,
  stakingOnFarmFailed,
  clearStakeFarmResponse,

  // * Unstaking Farms
  initiateUnstakingOperationOnFarm,
  unstakingOnFarmProcessing,
  unstakingOnFarmSuccessFull,
  unstakingOnFarmFailed,
  clearUntakeFarmResponse,

  // * Harvest Farms
  initiateHarvestingOperationOnFarm,
  harvestingOnFarmSuccessFull,
  harvestingOnFarmFailed,
  clearHarvestFarmResponse,

  // * Other Farms
  toggleFarmsType,
  setFarmsToRender,
  openFarmsStakeModal,
  closeFarmsStakeModal,
  openFarmsUnstakeModal,
  closeFarmsUnstakeModal,
  openCloseFarmsModal,
  dismissSnackbar,
} = farmsSlice.actions

export default farmsSlice.reducer;
