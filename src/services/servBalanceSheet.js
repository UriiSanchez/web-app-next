import dayjs from 'dayjs';

import { genericFetch } from '../hooks';
import { constGB, constConceptsGB, getError, dateToString, areAllObjectFilled } from '../helpers';
import { onCalculateGB } from '../helpers/calculates';

export const getBalanceSheet = async (rfc, idRequest, idClient) => {
   const { PASIVO_FINANCIERO, PASIVO_BURO_DE_CRED, DIFF_PASIVO_FIN_VS_BC } = constConceptsGB;
   try {
      localStorage.removeItem('BS_Page');
      const result = await genericFetch({
         url: `/financial/getBalanceSheet/${rfc}/${idRequest}?idClient=${idClient}&dataOriginEnum=MANUAL`,
         method: 'get',
      });

      if (result.status !== 200) {
         return getError(result);
      }

      let newPeriods = result.data.periods.map((p) => {
         let newConcepts = p.concepts.map((c) => {
            let concept = {
               ...c,
               summary: constGB.summary.includes(c.idItemChild),
               automatic: constGB.automatic.includes(c.idItemChild),
               toolTip: constGB.toolTip.includes(c.idItemChild),
            };

            if (![PASIVO_FINANCIERO, PASIVO_BURO_DE_CRED, DIFF_PASIVO_FIN_VS_BC].includes(c.idItemChild)) {
               concept = {
                  ...concept,
                  percentage: c.percentage ? c.percentage : '0',
                  value: c.value ? c.value : null,
               };
            }

            return concept;
         });

         partialTypeBGMapping[p.periodType](p);
         return { ...p, concepts: onCalculateGB(newConcepts) };
      });

      let newData = {
         ...result.data,
         periods: newPeriods,
         dateElaboration: dateToString(result.data?.dateElaboration) || dayjs().format('DD-MM-YYYY'),
      };

      localStorage.setItem('BS_Page', JSON.stringify(newData));

      return {
         ...result,
         data: newData,
      };
   } catch (error) {
      return getError({ status: 500, error });
   }
};

export const saveBalanceSheet = async (data) => {
   return genericFetch({
      url: '/financial/saveBalanceSheet',
      method: 'put',
      data: JSON.stringify(data),
   }).catch((error) => ({ status: 500, message: 'Ocurrió un error al guardar la información', error }));
};

export const statusGeneralBalance = (form) =>
   !form.periods.every((item) => {
      let result = areAllObjectFilled(item);
      return result;
   });

export const partialTypeBGMapping = {
   PARTIAL: (partial) => {
      partial['sourceInformation'] = 'Interno';
      delete partial.officeOrAccountant;
   },
   ANNUAL: (partial) => {
      delete partial.monthIncludes;
   },
};
