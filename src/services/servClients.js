import _ from 'lodash';
import { genericFetch } from '../hooks';
import { getError, queryClientByName } from '../helpers';
import { constRequestLifeStatus as RequestStatus, constTypePerson as TypePerson, EnumStatus } from '../helpers/config';

export const getRequestsByParam = async (type, params) => {
   try {
      let requestsOther = [];
      if (type === 'forNumber') {
         const resultId = await getClientsById(params);
         if (resultId.status !== 200) {
            return getError(resultId);
         }

         //* Se filtra que no sea Persona Fisica
         if (resultId.data.personType === 'PF') {
            return { status: resultId.status, requests: 'PF' };
         }

         //* Validamos si NO tiene Solicitudes se regresa Sin Solicitud
         if (_.isEmpty(resultId.data?.requests)) {
            let requestsId = [{ ...resultId.data, statusRequest: 'Sin Solicitud', isVisible: true }];
            return { status: resultId.status, requests: requestsId };
         }

         //* Se extraen las solicitudes del cliente
         const { requests, ...info } = resultId.data;
         requests.forEach(({ status, idRequest, group, createUser, idCatTypeProcedure, idStatus }) => {
            requestsOther.push({
               ...info,
               catStatus: status,
               createUser,
               idCatStatus: idStatus,
               idGroup: group,
               idRequest,
               isVisible: true,
               idCatTypeProcedure,
               statusRequest: status,
            });
         });

         let requestsInProcess = requests.filter((r) => !RequestStatus.finish.includes(r.idStatus));

         if (_.isEmpty(requestsInProcess)) {
            requestsOther.push({ ...info, statusRequest: 'Sin Solicitud', isVisible: true });
         }

         return { status: resultId.status, requests: requestsOther };
      }

      //* Validamos que método debemos ejecutar entre EG o Name
      let resultOther =
         type == 'forGroup'
            ? await genericFetch({
                 url: `/credit/getClientByEconomicGroup?groupName=${params}`,
                 method: 'get',
              })
            : await getClientsByName(params);

      //* Se retorna si el estatus el diferente a Ok
      if (resultOther?.status !== 200) {
         return getError(resultOther);
      }

      //* Filtramos la data de las PF
      let filterPF = resultOther.data.filter((u) => u.personType != 'PF');
      filterPF?.forEach(({ requests, ...item }) => {
         let fullName = item.businessName || item.name;
         if (_.isEmpty(requests)) {
            requestsOther.push({
               ...item,
               statusRequest: 'Sin Solicitud',
               fullName,
               isVisible: true,
               idClient: parseInt(item.idClient),
            });
         } else {
            //* Proceso todas las solicitudes que traiga el cliente
            requests?.forEach(({ status, idCatTypeProcedure, idRequest, group, createUser, idStatus }) => {
               requestsOther.push({
                  ...item,
                  isVisible: true,
                  catStatus: status,
                  createUser,
                  fullName,
                  idCatStatus: idStatus,
                  idGroup: group,
                  idRequest,
                  idCatTypeProcedure,
                  statusRequest: status,
               });
            });

            let requestsInProcess = requests.filter((r) => !RequestStatus.finish.includes(r.idStatus));

            if (_.isEmpty(requestsInProcess)) {
               requestsOther.push({
                  ...item,
                  statusRequest: 'Sin Solicitud',
                  fullName,
                  isVisible: true,
                  idClient: parseInt(item.idClient),
               });
            }
         }
      });

      return { status: resultOther.status, requests: requestsOther };
   } catch (error) {
      console.log(error);
      return getError({ status: 500, requests: null, error });
   }
};

export const getClientsById = async (params) => {
   const { status, data, ...other } = await genericFetch({ url: `/credit/getClientById?${params}`, method: 'get' });
   if (status !== 200) {
      return { status, ...other };
   }

   data['fullName'] = data.businessName || data.name;
   return { status, data };
};

export const getClientsByName = async (name, typeQuery = 'ALL') => {
   let query = queryClientByName({ name, typeQuery });
   const result = await genericFetch({
      url: '/credit/genericQL',
      method: 'post',
      data: JSON.stringify({
         query,
         variables: {},
      }),
   });

   //* Se valida si viene el atributo errors.
   if (result.status !== 200) {
      return { status: result.status, data: result?.error };
   }

   return { status: result.status, data: result.data?.data.getClientByNamePaged.responses };
};

export const getInfoClient = async (idClient, userAD, idRequest) => {
   try {
      const result = await genericFetch({
         url: `/credit/Related/getInfo?idClient=${idClient}&user=${userAD}&idRequest=${idRequest}`,
         method: 'get',
      });

      if (result?.status !== 200) {
         return getError(result);
      }

      result.data['fullName'] = result.data?.tradeName || result.data?.name;
      return result;
   } catch (error) {
      console.log(error);
      return { status: 500, info: error };
   }
};

export const getAllEconomicGroup = async (idClientA) => {
   try {
      const { status, data, ...other } = await genericFetch({
         url: `/credit/getAllEconomicGroup/${idClientA}`,
         method: 'get',
      });

      if (status !== 200) {
         return { status, ...other };
      }

      let { idClient, rfc, email, group, civilStatus, personType, birthdate } = data.clientByIdResponse;
      let isInProgress =
         !_.isEmpty(data.clientByIdResponse.requests) &&
         ![
            EnumStatus.SOLICITUD_AUTORIZADA,
            EnumStatus.SOLICITUD_RECHAZADA,
            EnumStatus.SOLICITUD_FINALIZADA,
            EnumStatus.SOLICITUD_CANCELADA,
            EnumStatus.SOLICITUD_CANCELADA_POR_EMBARGO,
         ].includes(data.clientByIdResponse.idStatus);

      let fullName = data?.clientByIdResponse?.businessName || data?.clientByIdResponse?.name;

      let applicant = {
         idCatTypePerson: TypePerson.APPLICANT,
         idClient,
         fullName,
         isInProgress,
         email,
         personType,
         civilStatus,
         birthdate,
         rfc,
         group,
         edit: false,
      };

      let newEconomicGroup = data.clientByIdResponses.map((c) => {
         let { idClient, rfc, email, group, civilStatus, personType, birthdate } = c;
         let isInProgress =
            !_.isEmpty(c.requests) &&
            ![
               EnumStatus.SOLICITUD_AUTORIZADA,
               EnumStatus.SOLICITUD_RECHAZADA,
               EnumStatus.SOLICITUD_FINALIZADA,
               EnumStatus.SOLICITUD_CANCELADA,
               EnumStatus.SOLICITUD_CANCELADA_POR_EMBARGO,
            ].includes(c.idStatus);
         let fullName = c?.businessName || c.name;

         return {
            idClient,
            idCatTypePerson: TypePerson.APPLICANT,
            fullName,
            isInProgress,
            email,
            personType,
            civilStatus,
            birthdate,
            rfc,
            group,
            edit: false,
         };
      });

      return { applicant, newEconomicGroup, status: 200 };
   } catch (error) {
      console.log(error);
      return { status: 500, error };
   }
};
