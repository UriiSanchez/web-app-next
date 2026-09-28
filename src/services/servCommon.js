import _ from 'lodash';
import { customAxios, genericFetch } from '../hooks';
import { getError, getFirstTwoLetters } from '../helpers';

export const getExchangeValue = async (typeExchange = 'DOLLAR') => {
   try {
      let result = await genericFetch({
         url: `/credit/getExchangeValue?exchange=${typeExchange}`,
         method: 'GET',
      });

      if (result?.status !== 200) {
         return 0;
      }

      return result?.data?.value || 0;
   } catch (error) {
      return {
         status: 500,
         value: 0,
         message: `Ocurrió un error al consultar el valor de ${typeExchange} | error: ${error}`,
      };
   }
};

export const initExchangeValue = async () => {
   try {
      const storageExchange = JSON.parse(localStorage.getItem('exchangeValue'));
      //* Se obtiene el valor de la UDI y el Dollar
      if (_.isEmpty(storageExchange)) {
         let result = await Promise.all(
            ['DOLLAR', 'UDI'].map(async (item) => {
               let result = await getExchangeValue(item);
               return { [item]: result };
            })
         );
         return Object.assign({}, ...result);
      }

      let obj = storageExchange;
      if (_.isEmpty(obj?.DOLLAR) || obj?.DOLLAR == '0' || _.isNaN(parseInt(obj.DOLLAR))) {
         obj.DOLLAR = await getExchangeValue();
      } else if (_.isEmpty(obj?.UDI) || obj?.UDI == '0' || _.isNaN(parseInt(obj.UDI))) {
         obj.UDI = await getExchangeValue('UDI');
      }
      return obj;
   } catch (error) {
      console.log(error);
   }
};

export const getChatsForRequest = async (idRequest) => {
   try {
      const result = await genericFetch({
         url: `/credit/getChat?idRequest=${idRequest}`,
         method: 'GET',
      });

      if (result.status === 404) {
         return [];
      } else if (result.status !== 200) {
         getError(result);
         return [];
      }

      let addLetters = result.data?.chatConversation.map((item) => {
         let messageResponse = item?.messageResponse.map((response) => ({
            ...response,
            firstLetters: getFirstTwoLetters(response.fullName),
         }));
         return {
            ...item,
            firstLetters: getFirstTwoLetters(item.fullName),
            messageResponse,
         };
      });

      return addLetters || [];
   } catch (e) {
      console.log(e);
      return [];
   }
};

export const postChatAndResponse = (body, typeEnumChat = 'SAVE_FATHER') => {
   return genericFetch({
      url: `/credit/chat?chatOperationTypeEnum=${typeEnumChat}`,
      method: 'POST',
      data: body,
   }).catch((error) => ({ status: 500, message: 'Ocurrió un error al guardar los representantes', error }));
};

export const getListAnalyst = async () => {
   try {
      const result = await genericFetch({
         url: '/credit/Related/getAnalyst',
         method: 'GET',
      });

      if (result.status !== 200) {
         return { ...result, data: [] };
      }

      let newList = result?.data.map(({ idUser, name, ...analyst }) => ({
         ...analyst,
         userAD: idUser,
         fullName: name,
         firstLetters: getFirstTwoLetters(name),
      }));

      localStorage.setItem('listAnalyst', JSON.stringify({ list: newList, timeStamp: Date.now() }));

      return { ...result, data: newList };
   } catch (error) {
      console.log(error);
      return { status: 500, ...error, data: [] };
   }
};

export const getListLeader = async (filterProfile = '') => {
   try {
      const result = await genericFetch({
         url: `/v1/users${filterProfile && '?profileId=' + filterProfile}`,
         method: 'GET',
         addToken: true,
      });

      if (result.status !== 200) {
         return { ...result, data: [] };
      }

      let newList = result?.data.map((leader) => ({
         ...leader,
         fullName: `${leader.firstName} ${leader.secondName ?? ''} ${leader.firstSurname} ${leader.secondSurname}`,
      }));

      localStorage.setItem('listLeader', JSON.stringify({ list: newList, timeStamp: Date.now() }));

      return { ...result, data: newList };
   } catch (error) {
      console.log(error);
      return { status: 500, ...error, data: [] };
   }
};

export const getTokenAPI = async () => {
   try {
      const headers = {
         'X-Trace-Id': crypto.randomUUID(),
         'X-Client-Secret': process.env.NEXT_SECRET_CLIENT,
         'X-Client-ID': process.env.NEXT_SECRET_ID,
      };

      console.log('API URL: ' + process.env.NEXT_PUBLIC_API_URL);
      const { status, error, data } = await customAxios('/v1/auth/token', 'POST', headers);
      console.log(`status: ${status}; ${error ? 'Error: ' + error : ''};`);
      if (status === 200) {
         return { status, message: '', token: data?.token || '' };
      }

      return {
         status,
         message: 'La solicitud no pudo ser procesada: ' + error || 'No result',
         token: '',
      };
   } catch (error) {
      console.error('[Get Token ] - Ocurrió un error al obtener el token', error);
      return {
         status: error?.response?.status || 500,
         message: 'Ocurrió el siguiente error al obtener el token:' + error,
      };
   }
};
