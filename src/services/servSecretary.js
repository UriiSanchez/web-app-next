import { genericFetch } from '../hooks';
import { queryRequestSecretary, setOnlyIsToSave } from '../helpers';

const onlySave = [
   'idRequest',
   'authorizationAmount',
   'idCatStatus',
   'authorizationNotional',
   'authorizationDate',
   'finalizeDate',
];

export const getRequestSecretary = async (filter) => {
   try {
      let query = queryRequestSecretary(filter);
      const result = await genericFetch({
         url: '/credit/genericQL',
         method: 'post',
         data: JSON.stringify({
            query,
            variables: {},
         }),
      });

      //* Control de errores.
      if (result.status !== 200) {
         return { status: result.status, data: result?.error };
      } else if (result.error) {
         return result;
      }

      let newData = result.data?.data?.getGroupWithFilters.map(({ requestResponseList, ...dt }) => {
         return {
            ...dt,
            isVisible: true,
            numApplicants: requestResponseList.length,
            isGroup: requestResponseList.length > 1,
            requestResponseList,
         };
      });

      return { status: 200, data: newData };
   } catch (error) {
      return { status: 500, error };
   }
};

export const postSaveSecretary = (data, group) => {
   data.idGroup = group?.idGroup;
   data.authorizationAmount = group?.authorizationAmount;
   data.idCatStatus = 12;
   data.requests = data?.requests?.map((rh) => setOnlyIsToSave(onlySave, rh));
   return genericFetch({
      url: `/credit/Global/updateSecretaryData`,
      method: 'patch',
      data: JSON.stringify(data),
   }).catch((error) => {
      console.log('secretariado sev: ' + error);
      return { status: 500, error };
   });
};

export const postStampedCover = (idRequest, userAD) => {
   return genericFetch({
      url: `/credit/sealRequest`,
      method: 'POST',
      data: JSON.stringify({
         idRequest,
         userAD,
      }),
   }).catch((error) => {
      console.log('secretariado sev: ' + error);
      return { status: 500, error };
   });
};
