import _ from 'lodash';
import { sumGeneric } from '../helpOperations';

export const calcPotentialRiskTotal = (data, attribute) => {
   const { modelAuthorization } = data;

   if (attribute === 'amountEm') {
      let riskPotentialAmountEm =
         parseInt(modelAuthorization.riskGroupAmountEm || 0) + parseInt(modelAuthorization.amountEm || 0);
      data.modelAuthorization.riskApplicantAmountEm = modelAuthorization.amountEm;
      data.modelAuthorization.riskPotentialAmountEm = riskPotentialAmountEm;
   }
};

export const calcRiskGroupAmountEm = (dataGroup, user) => {
   if (!_.isEmpty(dataGroup)) {
      let sumAmountEm = sumGeneric(
         dataGroup.map((item) => item.resolutionLinesResponse.modelAuthorization),
         'amountEm'
      );
      let newData = dataGroup.map((r) => {
         return {
            ...r,
            resolutionLinesResponse: {
               ...r.resolutionLinesResponse,
               modelAuthorization: {
                  ...r.resolutionLinesResponse.modelAuthorization,
                  riskGroupAmountEm: sumAmountEm - parseInt(r.resolutionLinesResponse.modelAuthorization.amountEm),
                  riskPotentialAmountEm: sumAmountEm,
               },
            },
            userCreate: user.userAD,
         };
      });
      return newData;
   }
};
