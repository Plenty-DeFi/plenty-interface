

export const filterData = (originalData, checkBoxesState) => {
    const checkedCount = Object.values(checkBoxesState).filter(
      (checkBoxState) => checkBoxState,
    ).length;
    const dataToFilter = [...originalData];
    const filteredData = [];
    if (checkedCount === 0 || checkedCount === 3) {
      return dataToFilter;
    } else {
      if (checkBoxesState['TO_TEZOS']) {
        dataToFilter.forEach((transaction) => {
          if(transaction.operation === 'BRIDGE' && transaction.currentProgress === 3) {
            filteredData.push(transaction);
          }
        });
      }
      if (checkBoxesState['FROM_TEZOS']) {
        dataToFilter.forEach((transaction) => {
          if(transaction.operation === 'UNBRIDGE' && transaction.currentProgress === 3) {
            filteredData.push(transaction);
          }
        });
      }
      if (checkBoxesState['ACTION_REQUIRED']) {
        dataToFilter.forEach((transaction) => {
          if(transaction.currentProgress !== 3) {
            filteredData.push(transaction);
          }
        });
      }
      return filteredData;
    } /* else if (checkedCount === 1) {
      return dataToFilter.filter((transaction) => {
        if (checkBoxesState['TO_TEZOS']) {
          return transaction.operation === 'BRIDGE' && transaction.currentProgress === 3;
        } else if (checkBoxesState['FROM_TEZOS']) {
          return transaction.operation === 'UNBRIDGE' && transaction.currentProgress === 3;
        } else if (checkBoxesState['ACTION_REQUIRED']) {
          return transaction.currentProgress !== 3;
        }
        return true;
      });
    } else {
      if (checkBoxesState['TO_TEZOS'] && checkBoxesState['FROM_TEZOS']) {
        return dataToFilter.filter(
          (transaction) =>
            (transaction.operation === 'BRIDGE' || transaction.operation === 'UNBRIDGE') &&
            transaction.currentProgress === 3,
        );
      } else if (checkBoxesState['TO_TEZOS'] && checkBoxesState['ACTION_REQUIRED']) {
        return dataToFilter.filter(
          (transaction) => transaction.operation === 'BRIDGE' || transaction.currentProgress !== 3,
        );
      } else if (checkBoxesState['FROM_TEZOS'] && checkBoxesState['ACTION_REQUIRED']) {
        return dataToFilter.filter(
          (transaction) =>
            transaction.operation === 'UNBRIDGE' || transaction.currentProgress !== 3,
        );
      }
    } */
  };

  export const sortData = (filteredData, radioSelected) => {
    const dataToSort = filteredData;
    return dataToSort.sort((a, b) => {
      if (radioSelected === 'MOST_RECENT') {
        if (new Date(a.timestamp).getTime() > new Date(b.timestamp).getTime()) {
          return -1;
        } else if (new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime()) {
          return 1;
        }
        return 0;
      } else if (radioSelected === 'OLDEST') {
        if (new Date(a.timestamp).getTime() < new Date(b.timestamp).getTime()) {
          return -1;
        } else if (new Date(a.timestamp).getTime() > new Date(b.timestamp).getTime()) {
          return 1;
        }
        return 0;
      } else if (radioSelected === 'INCREASING_VALUE') {
        if (a.secondTokenAmount < b.secondTokenAmount) {
          return -1;
        } else if (a.secondTokenAmount > b.secondTokenAmount) {
          return 1;
        }
        return 0;
      } else if (radioSelected === 'DECREASING_VALUE') {
        if (a.secondTokenAmount > b.secondTokenAmount) {
          return -1;
        } else if (a.secondTokenAmount < b.secondTokenAmount) {
          return 1;
        }
        return 0;
      }
    });
  };

  export const titleCase = (str) => {
    if (typeof str === 'string') {
      return str.toLowerCase().split(' ').map(function(word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
      }).join(' ');
    } else {
      return str;
    }
  };