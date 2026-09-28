import _ from 'lodash';

import { graphGetGroup, patchUpdateRequest } from './servRequests';
import { getCreditHistory } from './servGeneralInfomation';
import { getError, sumGeneric, sweetNormal } from '../helpers';
import { constTypePerson, constPageProcessType as PageProcess } from '../helpers/config';

export const getInfoSolidary = async (idGroup) => {
   try {
      const result = await graphGetGroup('SOLIDARY_PAGE', idGroup);
      if (result.status !== 200) {
         getError(result);
         return result;
      }

      let resultLoans = null;
      if (process.env.NEXT_PUBLIC_ACTIVE_ISILOANS == 'true') {
         const { requestResponseList } = result.data;
         resultLoans = await getCreditHistory(requestResponseList?.[0]?.relatedPersonResponseList?.[0]?.idClient);

         if (resultLoans.status === 500) {
            sweetNormal({
               title: resultLoans?.error?.response?.message || 'Intermitencia en el servicio',
               txt: `<p class='text-sm'>Esto puede ser por alguna intermitencia; sin embargo, es posible continuar con el proceso, puedes intentar más tarde o contacte al equipo de soporte</p>`,
               icon: 'warning',
            });
            resultLoans = null;
            return;
         }
      }

      let initLoans = {
         creditTotalAmount: 0,
         applicant: [],
         economicGroup: [],
      };

      let newData = parseInfoSolidary(result.data, resultLoans?.data || initLoans);
      localStorage.setItem('Solidary_Page', JSON.stringify(newData));
      return { status: 200, data: newData };
   } catch (error) {
      console.log(error);
      return { status: 500, error };
   }
};

export const patchRequestAndApplicants = async (applicants, group, userAD) => {
   try {
      let groupRequest = {
         ...group,
         idCatTypeProcedure: PageProcess.GET_CHECKLIST,
         userModify: userAD,
      };

      //* Actualizamos primero el grupo, en caso de que falle se cancela la actualización
      const result = await patchUpdateRequest({ groupRequest });
      if (result.status != 204) {
         return result;
      }

      //* Procedemos a iterar todos los aplicantes de la solicitud para su actualización
      let allRequests = applicants.map((aply) => {
         const { idRequest, requestAmount, kindProcedure } = aply;
         return {
            idRequest,
            requestAmount,
            kindProcedure,
            userModify: userAD,
            idCatTypeProcedure: PageProcess.GET_CHECKLIST,
            idCatStatus: group.idCatStatus,
         };
      });

      return patchUpdateRequest({ request: allRequests }, 'REQUEST');
   } catch (error) {
      console.log(error);
      return { status: 500, error };
   }
};

const parseInfoSolidary = (group, { applicant, economicGroup }) => {
   try {
      let cloneGroup = structuredClone(group);
      let applicantNotParticipateInRequest = [];
      //? Variable que debe restar sobre el total disponible, revisar el useMemo Limit
      let amountRestar = 0;
      //* Obtenemos solo las lineas LCD
      let lcdApplicant = applicant?.filter((ca) => ca.typeActiveProduct === 'LCD');
      let lcdGroup = economicGroup?.filter((eg) => eg.typeActiveProduct === 'LCD');

      //* Concatenamos las líneas de credito del aplicante con las de su grupo economico
      let allCredits = lcdApplicant.concat(lcdGroup);

      //* Recorremos el arreglo concatenado para asignar los montos a los solicitantes de la solicitud actual
      allCredits.forEach((credit) => {
         let foundClient = cloneGroup.requestResponseList.find((req) => {
            return req.relatedPersonResponseList.some(
               //* Identificamos al solicitante que tiene linea de credito anterior dentro de los clientes que participan en la solicitud
               (rp) => rp.idClient == credit.idClient && rp.idCatTypePerson === constTypePerson.APPLICANT
            );
         });

         if (foundClient) {
            let idx = _.findIndex(cloneGroup.requestResponseList, (rp) => rp.idRequest === foundClient.idRequest);
            //* Identificamos si estamos en el proceso de guardado de los OS
            let isSaveObligated = cloneGroup.idCatTypeProcedure === PageProcess.SAVE_OBLIGED;
            if (isSaveObligated) {
               //* Si estamos en el proceso del guardado de los OS, el monto inicial de la solicitud sera el monto autorizado de su ultima linea de crédito
               cloneGroup.requestResponseList[idx].requestAmount = credit.authorizedAmount;
            }

            cloneGroup.requestResponseList[idx].activeCredit = true;
            cloneGroup.requestResponseList[idx].oldAmount = credit.authorizedAmount;
         }
         //* Cuando la variable inEffect viene [true] significa que la línea se encuentra activa y se añade a la sumatoria
         else if (credit.inEffect) {
            amountRestar += parseInt(credit.authorizedAmount) || 0;
            applicantNotParticipateInRequest.push(credit);
         }
      });

      let totalGlobal = sumGeneric(cloneGroup.requestResponseList, 'requestAmount');
      let newApplicants = cloneGroup.requestResponseList.map((a) => ({
         ...a,
         validate: { valid: true, procedure: a.kindProcedure },
      }));

      return {
         applicants: newApplicants,
         credits: {
            applicantNotParticipateInRequest,
            creditTotalAmount: amountRestar,
         },
         idCatStatus: group.idCatStatus,
         total: totalGlobal,
         idGroup: group.idGroup,
      };
   } catch (error) {
      console.log(error);
      throw Error('Error al realizar el parseo de la información');
   }
};

export const validateAmount = (name, value, type, limit, item) => {
   let amount = name == 'requestAmount' ? value : item?.requestAmount;
   if (amount > limit) {
      return { valid: false, procedure: '' };
   }

   switch (name == 'requestAmount' ? type : value) {
      case 'Incremento':
         return { valid: amount > item?.oldAmount, procedure: 'Incremento' };
      case 'Decremento':
         return { valid: amount < item?.oldAmount, procedure: 'Decremento' };
      default:
         return { valid: amount < limit, procedure: '' };
   }
};
