import _ from 'lodash';
import { genericFetch } from '../hooks';
import {
   getError,
   getFirstTwoLetters,
   getQueryOneGroup,
   getRandomColor,
   queryGetRequest,
   queryNewStatusRequest,
   queryStatusRequest,
} from '../helpers';
import { constTypePerson as TypePerson, catStatus, EnumStatus as Status } from '../helpers/config';

export const getRequestStatus = async (filter, page, user = '') => {
   try {
      let query = queryStatusRequest(filter, user, page);
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

      let newData = parseRequest(result.data.data.getGroupWithFilters);
      return { status: 200, data: newData };
   } catch (error) {
      return { status: 500, error };
   }
};

export const getQueryGraph = async (params) => {
   try {
      let query = queryNewStatusRequest;
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
         return { status: result.status, data: result?.error };
      } else if (result.error) {
         return result;
      }

      let newData = parseRequest(result.data.data.getGroupWithFilters);
      return { status: 200, data: newData };
   } catch (error) {
      return { status: 500, error };
   }
};

export const getOneRequest = async (idGroup, setColor = false) => {
   try {
      let query = queryGetRequest(idGroup);
      const result = await genericFetch({
         url: '/credit/genericQL',
         method: 'post',
         data: JSON.stringify({
            query,
            variables: {},
         }),
      });

      //* Control de errores GraphQL
      if (result.status !== 200) {
         return { status: result.status, data: result?.error };
      } else if (result?.error) {
         return result;
      }
      let newData = parseRequest(result?.data.data.getGroup, setColor);

      return { status: 200, data: newData };
   } catch (error) {
      return { status: 500, error };
   }
};

export const graphGetGroup = async (queryMethod, idGroup) => {
   try {
      let query = getQueryOneGroup(queryMethod);
      const result = await genericFetch({
         url: '/credit/genericQL',
         method: 'post',
         data: JSON.stringify({
            query,
            variables: { idGroup },
         }),
      });

      //* Control de errores.
      if (result.status !== 200) {
         return { status: result.status, data: result?.error };
      } else if (result.error) {
         return result;
      }

      let newData = parseRequest(result.data.data.getGroup);
      return { status: 200, data: newData };
   } catch (error) {
      return { status: 500, error };
   }
};

export const onChangeRequestStatusOrAssignUser = async (body, reassignment = false) => {
   if (reassignment) {
      return genericFetch({
         url: `/credit/reassignUser?idGroup=${body.idGroupRequest}&profilesEnum=${body.nextProfile}`,
         method: 'PATCH',
         data: JSON.stringify({ userAD: body.userAD }),
      }).catch((error) => ({ status: 500, error }));
   }

   return genericFetch({
      url: '/credit/Global/sendGroup',
      method: 'patch',
      data: JSON.stringify(body),
   }).catch((error) => ({ status: 500, error }));
};

export const postCreateRequest = async (data, userCreate, group = '-') => {
   try {
      let upApply = data.map((aply) => ({ ...aply, userCreate }));
      let groupName = upApply.length > 1 ? group : upApply[0].fullName;
      const result = await genericFetch({
         url: `/credit/generateRequest`,
         method: 'post',
         data: JSON.stringify({ groupName, applicantsRequest: upApply }),
      });

      if (result.status !== 200) {
         return getError(result);
      }

      return result;
   } catch (error) {
      console.log(error);
      return getError({ status: 500, error });
   }
};

export const postSavePersons = async (applicants, userAD) => {
   try {
      let items = [].concat(
         ...applicants.map((u) => u.relatedPersonResponseList.filter((i) => i.idCatTypePerson != TypePerson.APPLICANT))
      );

      if (!_.isEmpty(items)) {
         let relatedPersonList = items.map((u) => ({ ...u, userModify: userAD }));
         const result = await genericFetch({
            url: '/credit/Related/savePerson',
            method: 'post',
            data: JSON.stringify({ relatedPersonList }),
         });

         if (result.status != 204) {
            return result;
         }
      }

      let newApp = applicants.map(({ relatedPersonResponseList, ...others }) => {
         let obly = relatedPersonResponseList.filter((o) => o?.delete == undefined);
         return { ...others, obligators: obly };
      });
      return { status: 200, info: [...newApp] };
   } catch (error) {
      return { status: 500, error };
   }
};

export const patchUpdateRequest = async (data, entityEnum = 'GROUP') => {
   return genericFetch({
      url: '/credit/Global/updateEntity?entityEnum=' + entityEnum,
      method: 'patch',
      data: JSON.stringify(data),
   }).catch((error) => ({ status: 500, info: error }));
};

export const updateFinancialFlag = (idGroup) => {
   return genericFetch({
      url: `/credit/Related/updateFlagFinancialInfo?idGroup=${idGroup}`,
      method: 'patch',
   }).catch((error) => ({ status: 500, message: 'Ocurrió un error al actualizar la información', error }));
};

const parseRequest = (data, setColor = false) => {
   try {
      let transformArray = _.isArray(data);
      let initData = structuredClone(transformArray ? data : [data]);
      initData.forEach((item) => {
         item.isGroup = item.requestResponseList.length > 1;
         item.isVisible = true;
         //* Indica el número de aplicantes de la solicitud.
         item.numApplicants = item.requestResponseList.length;
         item.status = ![Status.EN_ESPECIALISTA_FINANCIAMIENTO].includes(item.idCatStatus)
            ? catStatus[item.idCatStatus]
            : '-';
         //* Se añade de forma estatica para facultados.
         item.instanceEmpowered = 'FM';
         //* Se añade un atributo virtual para poder hacer el sort por tipo de trámite.
         item.kindGroupProcedure = item.isGroup ? 'Grupal' : _.head(item.requestResponseList)?.kindProcedure;
         if (setColor) {
            item.requestResponseList.forEach((rrl) => {
               rrl.relatedPersonResponseList.forEach((person) => {
                  if (person.idCatTypePerson === TypePerson.APPLICANT) {
                     person.color = getRandomColor();
                     person.firstTwoLetters = getFirstTwoLetters(person.fullName);
                  }
               });
            });
         }
      });

      return transformArray ? initData : initData[0];
   } catch (error) {
      throw Error('Error al realizar el parseo de la información');
   }
};
