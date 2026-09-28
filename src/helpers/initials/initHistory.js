import _ from 'lodash';
import { datetimeToString } from '../helpDates';
import { findAttribute } from '../helpUtils';
import { constProfiles } from '../config';

const { ADC, MRC, EMG, LDC } = constProfiles;

const templateBase = {
   Initial: [
      { position: 1, id: 'groupName', display: 'Solicitante o grupo económico' },
      { position: 2, id: 'nameEmg', display: 'Especialista responsable' },
      { position: 3, id: 'arrivedMrDate', display: 'Fecha de inicio', type: 'datetime' },
      { position: 4, id: 'kindProcedure', display: 'Tipo de trámite' },
      { position: 5, id: 'branchOffice', display: 'Sucursal del especialista' },
      { position: 6, id: 'lastDateExecEm', display: 'Última fecha en la que se corrió el modelo', type: 'datetime' },
      { position: 7, id: 'status', display: 'Estatus' },
      { position: 8, id: 'nameAnalyst', display: 'Analista responsable' },
      { position: 9, id: 'arrivedSecDate', display: 'Entrega a secretariado', type: 'datetime' },
   ],
   Details: [
      { position: 1, id: 'branchOffice', display: 'Sucursal' },
      { position: 2, id: 'idClient', display: 'No. de Cliente', type: 'applicant' },
      { position: 3, id: 'authorizationAmount', display: 'Monto otorgado', type: 'money' },
      { position: 4, id: 'authorizationDate', display: 'Fecha de resolución', type: 'datetime' },
      { position: 5, id: 'lastDateExecEm', display: 'Última fecha que se corrio el modelo', type: 'datetime' },
      { position: 6, id: 'component', display: 'Obligado solidario', type: 'obligated' },
      { position: 7, id: 'authorizationNotional', display: 'Nocional autorizado', type: 'money' },
      { position: 8, id: 'finalizeDate', display: 'Plazo de vigencia', type: 'datetime' },
      { position: 9, id: 'arrivedSecDate', display: 'Entrega a secretariado', type: 'datetime' },
      { position: 10, id: 'lastDateBureau', display: 'Fecha de consulta de buró', type: 'datetime' },
      { position: 11, id: 'folioBureau', display: 'Folio de consulta de buró', type: 'applicant' },
   ],
};

const templateContraparte = [
   { position: 12, id: 'alerts', display: 'Alertas', type: 'alerts' },
   { position: 13, id: 'amountSuggestC', display: 'Monto contraparte', type: 'money' },
   { position: 14, id: 'amountSuggestEm', display: 'Monto modelo', type: 'money' },
   {
      position: 15,
      id: 'recommendationAc',
      display: 'Recomendación analista',
      type: 'like',
      comments: true,
      attrComment: 'commentAc',
   },
   {
      position: 16,
      id: 'recommendationLc',
      display: 'Recomendación líder',
      type: 'like',
      comments: true,
      attrComment: 'commentLc',
   },
   { position: 17, id: 'resultExecEm', display: 'Recomendación modelo', type: 'like' },
];

export const templateHistory = {
   details: (profile, data) => {
      let template = structuredClone(templateBase.Initial);
      template.forEach((item) => {
         if ([ADC, LDC].includes(profile) && item.position === 6) {
            item.display = 'Último análisis de la solicitud';
         }

         let foundValue = data.isGroup && ['kindProcedure'].includes(item.id) ? '-' : findAttribute(data, item.id);
         item.value = item.type === 'datetime' && foundValue ? datetimeToString(foundValue) : foundValue;
      });

      return template;
   },
   approved: (profile) => {
      let base = undefined;
      if ([ADC, LDC].includes(profile)) {
         base = _.concat(templateBase.Details, templateContraparte);
      } else if ([EMG, MRC].includes(profile)) {
         base = structuredClone(templateBase.Details);
         base.push({
            position: 12,
            id: 'recommendation',
            display: 'Recomendación contraparte',
            type: 'like',
            config: 'all',
         });
      }

      return base;
   },
   declined: (profile) => {
      const tempBase = [
         { position: 1, id: 'recommendation', display: 'Recomendación contraparte', type: 'like', config: 'all' },
      ];
      if ([ADC, LDC].includes(profile)) {
         tempBase.push({ position: 2, id: 'resultExecEm', display: 'Recomendación modelo', type: 'like' });
      }
      return tempBase;
   },
};

export const statusData = {
   6: { label: 'Pendiente', icon: 'schedule', color: 'text-orange-500' },
   10: { label: 'Aprobada', icon: 'check_circle', color: 'text-emerald-600' },
   11: { label: 'Rechazada', icon: 'cancel', color: 'text-red-500' },
   23: { label: 'Cancelada', icon: 'cancel', color: 'text-red-500' },
   24: { label: 'Cancelada', icon: 'cancel', color: 'text-red-500' },
};

export const queryForUserInHistory = {
   1: () => ({ key: 'idAnalyst' }),
   3: () => ({ key: 'userCreate' }),
};
