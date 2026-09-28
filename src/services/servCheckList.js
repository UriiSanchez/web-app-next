import _ from 'lodash';
import { genericFetch } from '../hooks';
import * as helps from '../helpers';
import {
   constProfiles as Profile,
   catStatus,
   constTypePerson as TypePerson,
   EnumStatus,
   mapRoutePages,
} from '../helpers/config';

export const getDocumentation = async (info, user) => {
   let newDocs = [];
   try {
      const csDocs = new helps.DocumentsClass(info, user);
      const { status, data, error } = await genericFetch({
         url: `/credit/checkListAsync`,
         method: 'post',
         data: JSON.stringify({
            idClient: info?.idClient,
            idRequest: info?.idRequest,
            modifyUser: user.userAD,
            typePerson: csDocs.typePerson,
            applicantType: csDocs.enumPerson,
            representatives: csDocs.legals,
            typeCheckList: csDocs.checklistByProfile,
         }),
      });

      if (status !== 200 || _.isEmpty(data.documents)) {
         return { status: status, data: { ...info, documentation: csDocs.docs }, error };
      }

      newDocs = csDocs.docs.map((doc) => {
         let isFoundDocument = data.documents.find((al) => al.documentType.toLowerCase() == doc.documentType);
         const cusDoc = {
            ...doc,
            folio: isFoundDocument?.folio ?? null,
            mandatory: isFoundDocument.mandatory ?? false,
         };
         const documentType = doc._id;

         if (documentType in documentTypeMapping && !_.isEmpty(isFoundDocument)) {
            documentTypeMapping[documentType](cusDoc, isFoundDocument, { user, info, csDocs, data });
         } else {
            cusDoc.folio = isFoundDocument?.folio || cusDoc.folio;
            cusDoc.status = isFoundDocument?.status || cusDoc.status;
            cusDoc.toAction[0].enable = isFoundDocument?.status === 'Finalizado';
         }

         return cusDoc;
      });
      //* Se filtran solo los documentos visibles
      let documentation = newDocs.filter((nd) => nd.isVisible);
      return { status: 200, data: { ...info, documentation, retrieveBureau: data.retrieveBureau } };
   } catch (error) {
      console.log(error);
      return { status: 500, data: { ...info, documentation: newDocs }, error: error.message };
   }
};

export const getLegalRepresent = async (data, userSession) => {
   const { legalRepresentatives, idClient, idRequest } = data;
   let templateLegal = {
      idRequest,
      idCatTypePerson: TypePerson.LEGAL_REPRESENTATIVE,
      userCreate: userSession?.userAD,
      userModify: userSession?.userAD,
      idClientRelated: idClient,
      isSelected: false,
      deleted: false,
   };

   try {
      const result = await genericFetch({
         url: `/credit/getLegalRepresentative/${idClient}?representativeEnum=ATTORNEY`,
         method: 'get',
      });

      if (result.status !== 200) {
         return helps.getError(result);
      }

      let thirdRepresentatives = result.data?.thirdRepresentatives
         ?.filter((dt) => dt.relationType.includes('Apoderado'))
         .map((la) => {
            let newRL = {
               ...templateLegal,
               idClient: la.idThird,
               idClientManual: '',
               personType: la.personType,
               fullName: la?.name + ' ' + la?.paternalSurname + ' ' + la?.maternalSurname,
               rfc: la.rfc,
            };

            if (!_.isEmpty(legalRepresentatives)) {
               let findLR = legalRepresentatives.find(
                  (o) =>
                     o.idClient == la.idThird &&
                     o.fullName == la?.name + ' ' + la?.paternalSurname + ' ' + la?.maternalSurname
               );
               if (!_.isUndefined(findLR)) {
                  newRL.isSelected = true;
                  newRL['idRelatedPerson'] = findLR.idRelatedPerson;
                  newRL.idClientManual = findLR.idClientManual;
               }
            }
            return newRL;
         });

      return { ...result, data: { ...result.data, thirdRepresentatives } };
   } catch (error) {
      console.log('Obtener LR: ', error);
      return helps.getError({ status: 500, error });
   }
};

export const saveRepresent = (selectRepresent) => {
   return genericFetch({
      url: '/credit/Related/savePerson',
      method: 'post',
      data: JSON.stringify({ relatedPersonList: selectRepresent }),
   }).catch((error) => ({ status: 500, message: 'Ocurrió un error al guardar los representantes', error }));
};

export const dowloadDocumentFetch = (folio) => {
   return genericFetch({
      url: `/credit/File/downloadFileByDataBuffer?folio=${folio}`,
      method: 'get',
   }).catch((error) => ({ status: 500, message: 'Ocurrió un error al descargar el documento', error }));
};

const documentTypeMapping = {
   PCD: (cusDoc, { folio, status }, { info, user }) => {
      //* Si estatus es igual a "Formato enviado - ID 25" se bloquean los botones y se habilita para mostrar un PDF.
      if (parseInt(status) === EnumStatus.FORMATO_CONGELADO) {
         cusDoc.status = 'Finalizado';
         cusDoc.toAction = [{ enable: folio !== 0, label: 'Visualizar', type: 'btn' }];
         return;
      }

      cusDoc.status = catStatus[parseInt(status)].replace(' Perfil Cliente', '');
      if (user?.idProfile == Profile.EMG) {
         cusDoc.toAction[0].label = statusButtonAction(cusDoc.status);
         cusDoc.toAction[0].enable = user.status.includes(info?.idStatusGroup);
      } else {
         cusDoc.toAction[0].label = 'Visualizar';
         cusDoc.toAction[0].enable = true;
      }
      let path = user?.idProfile == Profile.EMG ? 'EMG' : 'Shared';
      cusDoc.toAction[0].url = mapRoutePages.GO_TO_PCD_PAGE(path, info?.idRequest, info?.idGroup);
   },
   FVI: (cusDoc, { folio, status }, { info, user }) => {
      //* Si estatus es igual a "Formato enviado - ID 25" se bloquean los botones y se habilita para mostrar un PDF.
      if (parseInt(status) === EnumStatus.FORMATO_CONGELADO) {
         cusDoc.status = 'Finalizado';
         cusDoc.toAction = [{ enable: folio > 0, label: 'Visualizar', type: 'btn' }];
         return;
      }

      cusDoc.status = catStatus[parseInt(status)].replace(' Relacion Propiedades', '');
      cusDoc.toAction[0].label = user.idProfile != Profile.EMG ? 'Visualizar' : statusButtonAction(cusDoc.status);
      cusDoc.toAction[0].url = mapRoutePages.GO_TO_PROPERTIES_PAGE(info?.idRequest, info?.idGroup);
      cusDoc.toAction[0].enable = true;

      if ([Profile.ADC, Profile.LDC].includes(user?.idProfile)) {
         cusDoc.toAction[1] = {
            type: 'link',
            label: 'Visualizar',
            enable: true,
            url: mapRoutePages.GO_TO_PROPERTIES_PAGE(info?.idRequest, info?.idGroup),
         };

         //* Si la solicitud no esta en estatus de líder o analista y si no hay una verificación pendiente se deshabilita el botón "Validar"
         cusDoc.toAction[0].enable = user?.status.includes(info?.idStatusGroup) && info?.hasVerification === true;
         cusDoc.toAction[0].label = 'Validar';
      }
   },
   BG: (cusDoc, { folio, status }, { info, user }) => {
      cusDoc.status = folio > 0 ? 'Finalizado' : catStatus[parseInt(status)];
      cusDoc.toAction[0].label = user.idProfile != Profile.ADC ? 'Visualizar' : statusButtonAction(cusDoc.status);
      cusDoc.toAction[0].url = mapRoutePages.GO_TO_GENERAL_BALANCE_PAGE(
         info?.idRequest,
         info?.idGroup,
         info?.rfc,
         info?.idClient
      );
      cusDoc.toAction[0].enable = user.idProfile == Profile.ADC ? user.status.includes(info?.idStatusGroup) : true;
   },
   ER: (cusDoc, { folio, status }, { info, user }) => {
      cusDoc.status = folio > 0 ? 'Finalizado' : catStatus[parseInt(status)];
      cusDoc.toAction[0].label = user.idProfile != Profile.ADC ? 'Visualizar' : statusButtonAction(cusDoc.status);
      cusDoc.toAction[0].url = mapRoutePages.GO_TO_RESULTS_STATES_PAGE(
         info?.idRequest,
         info?.idGroup,
         info?.rfc,
         info?.idClient
      );
      cusDoc.toAction[0].enable = user.idProfile == Profile.ADC ? user.status.includes(info?.idStatusGroup) : true;
   },
   MCBC: (cusDoc, { folio, status, ...otherDC }, { info, user, csDocs, data }) => {
      cusDoc.selectedType = otherDC.selectedType;
      //* Buscamos los documentos para la Validación de Buró
      csDocs.getDocsBureau(data.representatives, data.documents, otherDC.selectedType);
      if (user.idProfile === Profile.MRC) {
         cusDoc.screenBureau = {
            ...csDocs.screenBureau,
            signatureDate: helps.dateToString(otherDC?.controlCreateDate),
         };

         cusDoc.status = info.confirmInfoBureau && folio > 0 ? 'Completado' : 'Pendiente';
         cusDoc.toAction[0] = {
            type: 'link',
            label: 'Validar',
            enable: info?.idStatusGroup === EnumStatus.EN_MESA_RECEPTORA,
            url: mapRoutePages.GO_TO_BURO_VALIDATION_PAGE(info?.idClient, info.idRequest, info?.idGroup),
         };
      }
      //* (selectedType == Carta Nueva) Se revisa que existen Representantes Legales.
      //* Pero solo para PM y se le piden o muestran solo a EMG.
      else if (user.idProfile === Profile.EMG && otherDC.selectedType === helps.TIPO_CARTA_NO_VALIDADA) {
         let isInSpecialits = user.status.includes(info?.idStatusGroup);
         cusDoc.layout = 'CNNV';
         cusDoc.isEnable = isInSpecialits;
         cusDoc.docs = csDocs.screenBureau.docs;

         if (data?.personType != 'PM') {
            cusDoc.status = 'Finalizado';
            cusDoc.toAction[0].enable = true;
            return;
         }
         cusDoc.status = status;
         cusDoc.toAction = [
            { enable: isInSpecialits, label: 'Validar', type: 'func' },
            { enable: folio > 0, label: 'Visualizar', type: 'btn' },
         ];
      } else {
         cusDoc.status = status;
         cusDoc.toAction[0].enable = folio > 0;
      }
   },
   EFCA: (cusDoc, { folio, status, ...otherDC }) => {
      if (!_.isEmpty(otherDC.docs)) {
         cusDoc.status = otherDC.docs?.every((dc) => dc.status.toLowerCase() == 'finalizado')
            ? 'Finalizado'
            : cusDoc.status;
         let getSomeYear = otherDC.docs?.some((dc) => dc.status.toLowerCase() == 'finalizado');
         cusDoc.toAction[0] = { ...cusDoc.toAction[0], data: otherDC.docs.reverse(), enable: getSomeYear };
      } else if (status == 'Finalizado') {
         cusDoc.layout = 'No aplica';
         cusDoc.status = status;
      }
   },
   EFP: (cusDoc, { folio, status, ...otherDC }) => {
      if (!_.isEmpty(otherDC?.docs)) {
         //* Sí el documento mandatory no es obligatorio se valida si se trae folio
         cusDoc.isVisible = otherDC.docs[0].folio > 0 || otherDC.mandatory;
         cusDoc.folio = otherDC.docs[0].folio || 0;
         cusDoc.status = otherDC.docs[0].status || cusDoc.status;
         cusDoc.layout = otherDC.mandatory ? 'Requerido' : 'Opcional';
         cusDoc.toAction[0].enable = otherDC.docs[0].status.toLowerCase() === 'finalizado';
      } else if (status == 'Finalizado') {
         cusDoc.layout = 'No aplica';
         cusDoc.status = status;
      }
   },
   RBC: (cusDoc, { folio, status, ...otherDC }, { info, user, data }) => {
      let showPDF = status === 'Finalizado' && folio > 0;
      const isMesaReceptora = user.idProfile === Profile.MRC && info?.idStatusGroup === EnumStatus.EN_MESA_RECEPTORA;

      if (!isMesaReceptora) {
         cusDoc.folio = folio || 0;
         cusDoc.status = status || cusDoc.status;
         cusDoc.toAction = [{ enable: showPDF, label: 'Visualizar', type: 'btn' }];
         cusDoc.layout = `Último reporte al: ${
            showPDF || otherDC.controlCreateDate ? helps.dateToString(otherDC.controlCreateDate) : '-'
         }`;
         return;
      }

      //* Si [confirmInfoBureau != true] se bloquean los dos botones.
      if (!info.confirmInfoBureau) {
         cusDoc.toAction[0].enable = false;
         cusDoc.toAction[0].label = 'Consultar';
         cusDoc.toAction[1].enable = false;
         return;
      }

      // Procesar el estado de la consulta de Buró
      const htmlIconBureau = processBureauStatus(cusDoc, data, info);

      cusDoc.folio = folio;
      cusDoc.status = status;
      cusDoc.icon = htmlIconBureau;
      //* Si trae folio se habilita el botón Visualizar.
      cusDoc.toAction[1].enable = showPDF;
      cusDoc.layout = getLayoutDate(otherDC.controlCreateDate, showPDF);
   },
   DJ: (cusDoc, { folio, status, ...otherDC }) => {
      cusDoc.folio = folio || cusDoc.folio;
      cusDoc.status = status || cusDoc.status;
      cusDoc.controlCreateDate = otherDC.controlCreateDate || '';
      cusDoc.toAction[0].enable = folio > 0;
   },
};

const statusButtonAction = (status) => (status == 'Pendiente' ? 'Empezar' : 'Editar');

const processBureauStatus = (cusDoc, data, info) => {
   const status = data?.statusCreditBureau;
   const clientId = info.idClient;

   switch (status) {
      case 'Por Iniciar':
         cusDoc.toAction[0].enable = true;
         cusDoc.toAction[0].label = 'Consultar';
         return '';
      case 'En Proceso':
         localStorage.removeItem(`BureauError_${clientId}`);
         cusDoc.toAction[0].enable = false;
         cusDoc.toAction[0].label = status;
         return '';
      case 'Finalizado':
         localStorage.removeItem(`BureauError_${clientId}`);
         cusDoc.toAction[0].enable = data?.retrieveBureau === true;
         cusDoc.toAction[0].label = data?.retrieveBureau === true ? 'Consultar' : data?.statusCreditBureau;
         return '';
      default:
         return handleBureauError(cusDoc, info);
   }
};

const getLayoutDate = (date, showPDF) => {
   const prefix = 'Último reporte al: ';
   return _.isEmpty(date) || !showPDF ? `${prefix}-` : `${prefix}${helps.dateToString(date)}`;
};

/**
 * Maneja la lógica de errores, alertas y generación de HTML.
 * */
const handleBureauError = (cusDoc, info) => {
   const clientId = info.idClient;
   const errorData = info?.errorBureau;

   // Modal de error único por sesión
   if (!localStorage.getItem(`BureauError_${clientId}`)) {
      localStorage.setItem(`BureauError_${clientId}`, 'true');
      helps.sweetNormal({
         txt: `<h2 class="text-xl font-semibold mb-2">¡Error al realizar la consulta a Buró de Crédito!</h2>
                  <p class="text-sm">No pudimos realizar la consulta, por favor vuelve a intentarlo o si sigues experimentando problemas, no dudes en ponerte en contacto con nuestro equipo de soporte.</p>
                  <p class='text-xs text-neutral-600 mt-3'> ${errorData || 'Error no definido'}</p>`,
         icon: 'warning',
      });
   }

   cusDoc.toAction[0].enable = true;
   cusDoc.toAction[0].label = 'Consultar';

   return generateErrorIconHtml(errorData);
};

/**
 * Genera el string HTML para el icono de error con tooltip
 * */
const generateErrorIconHtml = (errorBureau) => {
   let msj = helps.isValidJSON(errorBureau) ? JSON.parse(errorBureau) : null;
   const description = msj?.description || ' - Error no definido - Recarga la página para ver más detalles.';
   const minWidth = _.isEmpty(msj?.description) ? ' 140px' : '200px';

   return `
      <div class='group relative cursor-pointer flex'>
         <span class='material-symbols-outlined text-red-500 icon-size-20'>error</span>
         <div className='absolute z-10 justify-center hidden w-full group-hover:block top-3 fadeIn' style="right: -25px;">
            <div className='h-auto px-2 py-1 text-xs text-white bg-red-500 rounded-sm' style='min-width:${minWidth};'>
              ${description}
            </div>
         </div>
      </div>`.replace(/\n/g, '');
};
