import _ from 'lodash';

import { genericFetch } from '../hooks';
import { getError, queryStatusTracking } from '../helpers';
import { constTypePerson } from '../helpers/config';

export const getTrackingGraph = async (params) => {
   try {
      let query = queryStatusTracking;
      const result = await genericFetch({
         url: '/credit/genericQL',
         method: 'post',
         data: JSON.stringify({
            query,
            variables: { ...params },
         }),
      });

      //* Control de errores.
      if (result.status !== 200) {
         getError(result);
         return { status: result.status };
      }

      let newData = parseRequest(result.data.data.getTrackingWithFilters);
      return { status: 200, data: newData };
   } catch (error) {
      return { status: 500, error };
   }
};

export const getDetailsTrackingForIdRequest = async (idRequest) => {
   return genericFetch({
      url: '/credit/Tracking/'+idRequest,
      method: 'GET'
   }).catch((error) => ({ status: 500, error }));
};

const parseRequest = (data) => {
   try {
      let initData = structuredClone(data);
      initData.forEach((item) => {
         let listApplicants = [];
         item.isGroup = item.requestPerGroup > 1;
         //* Se añade un atributo virtual para poder hacer el sort por tipo de trámite.
         item.kindGroupProcedure = item.isGroup ? 'Grupal' : _.head(item.requestResponseList)?.kindProcedure;
         if (item.isGroup) {
            for (const req of item.requestResponseList) {
               let client = req.relatedPersonResponseList.find(
                  (person) => person.idCatTypePerson === constTypePerson.APPLICANT
               );
               listApplicants.push({ ...client, idCatStatus: req.idCatStatus });
            }
            item.listApplicants = listApplicants;
         }
      });

      return initData;
   } catch (error) {
      throw Error('Error al realizar el parseo de la información');
   }
};
