import SimpleModal from "./SimpleModal";
import PropTypes from "prop-types";
import Button from "../Buttons/Button";

import styles from './modal.module.scss'
import clsx from "clsx";
import { useMemo, useState } from "react";
import { Collapse } from "react-bootstrap";

const BUTTON_TEXT = {
  SELECT: 'Select stake',
  CONFIRM: 'Confirm unstake',
}

const SELECT_LABEL_TEXT = {
  SELECT: 'Select stake',
  UNSTAKE_AMT: 'Unstake amount',
}

const UnstakeModal = props => {

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  const buttonText = useMemo(() => {
    if (selected.length > 0) {
      return BUTTON_TEXT.CONFIRM
    }

    return BUTTON_TEXT.SELECT
  }, [selected.length])


  const userStakes = useMemo(() => {
    return props.userStakes?.[props.unstakeModalContractAddress]?.singularStakes ?? [];
  }, [props.unstakeModalContractAddress, props.userStakes])

  const selectLabelText = useMemo(() => {
    if (selected.length > 0 && !open) {
      return (
        <div className="d-flex justify-content-between w-100 mr-4">
          <span>{SELECT_LABEL_TEXT.UNSTAKE_AMT}</span>
          <span>{selected.reduce((acc, cur) => acc + cur.amount, 0)}</span>
        </div>
      )
    }

    return <span>{SELECT_LABEL_TEXT.SELECT}</span>
  }, [selected, open])


  const calculateFee = (difference ,obj) => {
    let feeObj = {mapId : obj.mapId}
    let fee = -1;
      for (let i = 0; i < props.unstakeModalwithdrawalFeeStructure.length; i++) {
        if (difference < props.unstakeModalwithdrawalFeeStructure[i].block) {
          fee = ((obj.amount * props.unstakeModalwithdrawalFeeStructure[i].rate) / 100).toFixed(10);
          fee = parseFloat(fee);
          feeObj['rate'] = props.unstakeModalwithdrawalFeeStructure[i].rate;
          feeObj['fee'] = fee;
          feeObj['amount']=obj.amount
          break;
        }
      }
      if (fee === -1) {
        fee = (
          (obj.amount * props.unstakeModalwithdrawalFeeStructure[props.unstakeModalwithdrawalFeeStructure.length - 1].rate) /
          100
        ).toFixed(10);
        fee = parseFloat(fee);
        feeObj['rate'] = props.unstakeModalwithdrawalFeeStructure[props.unstakeModalwithdrawalFeeStructure.length - 1].rate;
        feeObj['fee'] = fee;
        feeObj['amount']=obj.amount
      }
      return feeObj;
  }

  const onStakeSelect = (obj) => {
    if(selected.findIndex(sel => sel.mapId === obj.mapId) === -1) {
      let difference = props.currentBlock - parseInt(obj.block);
      let calculatedFee = calculateFee(difference,obj);
      setSelected([ ...selected, calculatedFee ])
    } else {
      setSelected(selected.filter(x => x.mapId !== obj.mapId));
    }
  }

  const onUnstake = () => {
    props.unstakeOnFarm(
      selected,
      props.unstakeModalIdentifier,
      props.isActiveOpen,
      props.unstakeModalFarmPosition
    )
  }

  return (
    <SimpleModal
      open={props.open}
      onClose={props.onClose}
      title={`Unstake ${props.unstakeModalTitle} tokens`}
    >
      <div className={styles.unStakeModal}>

        <div className={styles.unstakeSelectWrapper}>
          <div
            className={clsx(
              styles.unstakeSelect,
              "d-flex justify-content-between",
              {
                [styles.active]: open,
                [styles.selectedStakes]: !open && selected.length > 0
              })}
          >
            {selectLabelText}
            <Button
              className={(clsx(styles.collapseBtn, { [styles.active]: open }))}
              isIconBtn={true}
              color="secondary"
              startIcon="expand_more"
              onClick={() => setOpen(!open)}
            />
          </div>

          <Collapse in={open}>
              
            <div className={styles.collapsedContent}>
              {
                userStakes.map((x) => (
                  <label key={x.mapId} className={styles.stakedItem}>
                    <div className="d-flex justify-content-between flex-grow-1">
                      <span>{'Stake ' + x.mapId}</span>
                      <span>{x.amount}</span>
                    </div>
                    <input
                      type="checkbox"
                      className="ml-2"
                      checked={selected.findIndex(sel => sel.mapId === x.mapId) >= 0}
                      onChange={() => onStakeSelect(x, props)}
                    />
                  </label>
                ))
              }
            </div>
          </Collapse>

        </div>

        <div className="d-flex justify-content-end mr-2 mb-2">
          <div>Total staked balance: {props.userStakes?.[props.unstakeModalContractAddress]?.stakedAmount}</div>
        </div>

        {
          selected.length > 0 && (
            <>
              <div className="mb-2">Fee Breakdown</div>

              <div className={styles.feeBreakdownWrapper}>
                <div className={clsx(styles.feeBreakdownTable, "pb-2")}>
                  {
                    selected.map(x => (
                      <div>
                        <div>{'Stake ' + x.mapId}</div>
                        <div>{x.rate+'%'}</div>
                        <div>{x.fee}</div>
                      </div>
                    ))
                  }
                </div>
                <div className={clsx(styles.totalRow, "pt-2")}>
                  <div>Total</div>
                  <div />
                  <div>{Number(selected.reduce((acc, cur) => acc + cur.fee, 0).toFixed(12))}</div>
                </div>
              </div>
            </>
          )
        }

        <Button
          onClick={onUnstake}
          color="primary"
          className="w-100 mt-4"
          loading={props.unstakeOperation?.isLoading}
          disabled={buttonText !== BUTTON_TEXT.CONFIRM}
        >{buttonText}</Button>
      </div>
    </SimpleModal>
  )
}


UnstakeModal.propTypes = {
  unstakeOperation: PropTypes.shape({
    isLoading : PropTypes.bool,
    processing: PropTypes.bool,
    completed : PropTypes.bool,
    failed : PropTypes.bool,
    operationHash : PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])])
  }),
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default UnstakeModal;