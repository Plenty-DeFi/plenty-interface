export const currencyOptionsWithSymbol = {
  justification: 'L',
  locales: 'en-AU',
  currency: true,
  currencyIndicator: 'AUD',
  percentage: false,
  precision: 0,
  wholenumber: null,
  commafy: true,
  shortFormat: false,
  shortFormatMinValue: 100000,
  shortFormatPrecision: 1,
  title: false,
};

export const currencyOptions = {
  justification: 'L',
  locales: 'en-AU',
  currency: false,
  currencyIndicator: 'AUD',
  percentage: false,
  precision: 0,
  wholenumber: null,
  commafy: true,
  shortFormat: false,
  shortFormatMinValue: 100000,
  shortFormatPrecision: 1,
  title: false,
};

/**
 * balance for these type1MapIds will be present in `response.data.args[0].args[1].int`
 */
export const type1MapIds = [3956, 4353];

/**
 * balance for these type2MapIds will be present in `response.data.args[1].int`
 */
export const type2MapIds = [3943];

/**
 * balance for these type3MapIds will be present in `response.data.args[0].int`
 */
export const type3MapIds = [199, 36, 6901, 44140];

/**
 * balance for these type4MapIds will be present in `response.data.int`
 */
export const type4MapIds = [
  1777, 1772, 515, 4178, 18153, 10978, 7706, 7715, 7654, 20920, 2809, 7250, 13802, 4666, 21182,
  134335, 175082, 198031
];

/**
 * balance for these type5MapIds will be present in `response.data.args[0][0].args[1].int`
 */
export const type5MapIds = [12043];

// Flash message display duration.
export const FLASH_MESSAGE_DURATION = 5000;

//error message for new tokens
export const ERRORMESSAGESWAP =
  'Oops! There is no route for the selected pair. agEUR.e can only be swapped with EURL.';
