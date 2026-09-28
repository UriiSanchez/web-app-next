import { getAllEconomicGroup } from './servClients';
import { genericFetch } from '../hooks';
import { getError, sweetSnackbar } from '../helpers';

export const getGeneralInfo = async (idClient) => {
   try {
      let requests = [];

      let resultEG = await getAllEconomicGroup(idClient);
      if (resultEG.status !== 200) {
         return getError(resultEG);
      }

      if (process.env.NEXT_PUBLIC_ACTIVE_ISILOANS == "true") {
         const resultIsiloans = await getCreditHistory(idClient);
         if (resultIsiloans.status === 200) {
            requests = resultIsiloans.data;
         } else {
            sweetSnackbar({
               html: `<p class="mt-1 text-sm">${resultIsiloans?.error?.response?.message || 'Error desconocido'}</p>`,
               type: 'error',
               timer: 3000,
            });
         }
      }

      return { status: 200, data: { appli: resultEG.applicant, group: resultEG.newEconomicGroup, requests } };
   } catch (error) {
      console.log(error);
      return { status: 500, error, data: { request: [], appli: {}, group: [] } };
   }
};

export const getCreditHistory = (idClient) => {
   return genericFetch({
      url: `/credit/getHistoryCreditClient/${idClient}?typeCreditEnum=ALL`,
      method: 'get',
   }).catch((error) => {
      console.log(error);
      return { status: 500, error };
   });
};
