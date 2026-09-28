import _ from 'lodash';

import { constSR, constConceptsSR, getError, dateToString } from '../helpers';
import { genericFetch } from '../hooks';
import dayjs from 'dayjs';

export const getStateResults = async (idRequest, idClient) => {
   try {
      localStorage.removeItem('SR_Page');
      const result = await genericFetch({
         url: `/financial/getResultState/${idRequest}/${idClient}?dataOriginEnum=MANUAL`,
         method: 'get',
      });

      if (result.status !== 200) {
         return getError(result);
      }

      let newData = mapData(result?.data);
      localStorage.setItem('SR_Page', JSON.stringify(newData));
      return { ...result, data: newData };
   } catch (error) {
      return getError({ status: 500, error });
   }
};

export const saveStateResults = async (data) => {
   try {
      const result = await genericFetch({
         url: '/financial/saveResultState',
         method: 'put',
         data: JSON.stringify(data),
      });

      if (result.status !== 204) {
         return getError(result);
      }
      localStorage.setItem('SR_Page', JSON.stringify(data));
      return result;
   } catch (error) {
      return getError({ status: 500, error });
   }
};

/**
 * Valida que todos los campos requeridos en Estado de Resultados tengan un valor diferente de 0.0.
 * @param {Object[]} periods list de periodos a validar.
 * @returns {boolean} verdadero si todos los campos requeridos tienen un valor, si no falso.
 */
export const statusStateResults = (periods) => {
   const disabledInputs = [constConceptsSR.UTILIDAD_BRUTA, constConceptsSR.UTILIDAD_DE_OPERACION];

   const hasAllRequiredValues = periods.reduce((prevPeriodsHaveValue, period) => {
      const conceptsHaveValue = period.concepts.reduce((prevConceptsHaveValue, concept) => {
         return !disabledInputs.includes(concept.id)
            ? prevConceptsHaveValue && isFinite(concept.amount) && concept.amount !== null
            : prevConceptsHaveValue;
      }, true);

      const depreciationHaveValue = period.depreciationSchedule.reduce((haveValue, item) => {
         return haveValue && isFinite(item.amount) && item.amount !== null;
      }, true);

      return prevPeriodsHaveValue && conceptsHaveValue && depreciationHaveValue;
   }, true);

   return hasAllRequiredValues;
};

const mapData = (data) => ({
   rfc: data?.rfc,
   idRequest: data?.idRequest,
   idClient: data?.idClient,
   userModify: data?.userModify,
   status: data?.status,
   fullName: data?.fullName,
   idCatTypePerson: data?.idCatTypePerson,
   dateElaboration: dateToString(data?.dateElaboration) || dayjs().format('DD-MM-YYYY'),
   periods:
      data?.periods?.map((period) => ({
         periodType: period?.periodType,
         year: period?.year || 0,
         month: _.isEmpty(period?.month) ? '' : period?.month,
         sourceInformation: period?.sourceInformation,
         officeOrAccountant: period?.officeOrAccountant,
         monthIncludes: parseInt(period?.monthIncludes) || 0,
         concepts: mapList(period?.concepts),
         depreciationSchedule: mapList(period?.depreciationSchedule),
         analyseOperating: mapList(period?.analyseOperating),
      })) ?? [],
});

const mapList = (list) =>
   list?.map((item) => ({
      description: item?.description,
      id: item?.id,
      amount: item?.amount || null,
      percentage: _.isEmpty(item?.amount) ? '0' : item?.percentage,
      automatic: constSR.automatic.includes(item.id),
      toolTip: constSR.toolTip.includes(item.id),
   })) ?? [];
