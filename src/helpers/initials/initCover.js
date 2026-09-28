export const limitLines = 8;

export const onlySaveCover = [
   'idRequest',
   'idClient',
   'rfc',
   'relationshipCredit',
   'commercialAddress',
   'shareholding',
   'costumerClassification',
   'targetMarket',
   'strategicMarket',
   'specificDescriptionActivity',
   'previousLines',
   'modelAuthorization',
   'solidaryObliged',
   'warranty',
   'precedentCondition',
   'followingCondition',
   'contractCondition',
   'operatingCondition',
   'cumulativeAmount',
   'coverageIndex',
   'notional',
   'userCreate',
   'coverComplete',
];

export const onlyCoverCompletedItems = [
   'relationshipCredit',
   'commercialAddress',
   'shareholding',
   'targetMarket',
   'strategicMarket',
   'specificDescriptionActivity',
   'modelAuthorization',
   'solidaryObliged',
   'warranty',
   'precedentCondition',
   'followingCondition',
   'contractCondition',
   'operatingCondition',
   'cumulativeAmount',
   'coverageIndex',
   'notional',
];

export const initLines = {
   previousLines: {
      riskApplicantAmountIsi: '',
      riskGroupAmountIsi: '',
      riskPotentialAmountIsi: '',
      riskApplicantBalanceIsi: '',
      riskGroupBalanceIsi: '',
      riskPotentialBalanceIsi: '',
   },
   modelAuthorization: {
      amountEm: '',
      currencyEm: '',
      termEm: '',
      warrantyEm: '',
      riskApplicantAmountEm: '',
      riskGroupAmountEm: '',
      riskPotentialAmountEm: '',
   },
};

export const itemLine = {
   type: '',
   authDateIsi: '',
   issueDateIsi: '',
   amountIsi: '',
   currencyIsi: '',
   balanceIsi: '',
   warrantyIsi: '',
   lineNumber: '',
};

export const inputsNum = ['cumulativeAmount', 'coverageIndex', 'notional'];

export const initItemShareholding = {
   id: null,
   name: '',
   rfc: null,
   directParticipation: null,
   indirectParticipation: null,
};
