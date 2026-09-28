import _ from 'lodash';
import { dateToString } from '../helpDates';

//* 1 = Resumen, 2 = Capacidad de Pago, 3 = Buró de crédito, 4 = Razones Financieras, 5 = Razonabilidad de Cobertura, 6 = Tipo Cambio
const initConfigModel = {
   resumeResponse: { title: 'Resumen', page: 1 },
   paymentCapacity: { title: 'Capacidad de pago', page: 2 },
   creditHistoryReport: { title: 'Buró de crédito', page: 3 },
   financialReasons: { title: 'Razones financieras', page: 4 },
   swapRate: { title: 'Razonabilidad de cobertura', page: 5 },
   exchangeRate: { title: 'Tipo de cambio', page: 6 },
};

export const configPaymenCapacity = {
   rows: [
      {
         label: 'Ventas',
         key: 'Ventas',
         sx: 'border-t border-gray',
      },
      {
         label: 'Margen de Operación (%)',
         key: 'Margen de Operación (%)',
         sx: 'border-b border-gray',
         porcentage: true,
      },
      {
         label: 'Utilidad de Operación',
         key: 'Utilidad de Operación',
      },
      {
         label: '(-) Gastos financieros',
         key: '(-) Gastos financieros',
         sx: 'border-b border-gray',
      },
      {
         label: '(=) Monto gravable',
         key: '(=) Monto gravable',
      },
      {
         label: '(-) Impuestos (30%)',
         key: '(-) Impuestos (30%)',
         sx: 'border-b border-gray',
      },
      {
         label: '(=) Utilidad desp. de Fin. e Impts.',
         key: '(=) Utilidad desp. de Fin. e Impts.',
      },
      {
         label: '(+) Depreciación',
         key: '(+) Depreciación',
      },
      {
         label: '(-) Amortización de capital',
         key: '(-) Amortización de capital',
         sx: 'border-b border-gray',
      },
      {
         label: '(=) Remanente (faltante)',
         key: '(=) Remanente (faltante)',
         sx: 'bg-gray-200 border-b border-gray',
      },
      {
         label: 'Saldo insoluto deuda LP',
         key: 'Saldo insoluto deuda LP',
         sx: 'border-y border-gray my-4',
      },
      {
         label: 'Horizonte de deuda',
         key: 'Horizonte de deuda',
         sx: 'bg-gray-200 border-y border-gray',
      },
      {
         label: 'Cobertura de deudas',
         key: 'Cobertura de deudas',
         sx: 'bg-gray-200 border-b border-gray',
      },
      {
         label: 'Cobertura de intereses',
         key: 'Cobertura de intereses',
         sx: 'bg-gray-200 border-b border-gray',
      },
   ],
   stages: [
      { stage: 'Escenario Base', key: 'scenario-base' },
      { stage: 'Escenario 1', key: 'scenario-one' },
      { stage: 'Escenario 2', key: 'scenario-two' },
      { stage: 'Escenario 3', key: 'scenario-three' },
   ],
};

export const termsSwap = {
   months: 'Meses',
   years: 'Años',
   revolvente: 'Revolvente',
   'amortizable lineal': 'Amortizable lineal',
   'amortizaciones especiales': 'Amortizaciones especiales',
   bullet: 'Bullet',
   'variable-fija': 'Variable a fija',
   'fija-variable': 'Fija a variable',
   congruenceValidation: {
      1: { title: 'Congruente', color: 'emerald-600 text-white border-t border-emerald-600' },
      2: { title: 'Incongruente', color: 'red-500 text-white border-t border-red-500' },
      3: { title: 'Revisar', color: 'yellow-500 border-t border-yellow-500' },
   },
   congrounceLine: {
      1: { title: 'Línea suficiente', color: 'emerald-600 text-white border-b border-emerald-600' },
      2: { title: 'Línea excedida', color: 'red-500 text-white border-b border-red-500' },
      3: { title: 'Línea insuficiente', color: 'yellow-500 border-b border-yellow-500' },
   },
};

export class ModelClass {
   constructor() {
      this.newData = [];
   }

   static initialization(data) {
      let setData = [];
      try {
         if (_.isEmpty(data)) {
            return [];
         }
         data?.forEach(({ applicant, obligated, dateElaboration, ...rest }) => {
            let newField = { ...rest };
            newField.applicant = processingByParticipant(applicant, 'Solicitante');
            if (!_.isUndefined(obligated)) {
               newField.obligated = obligated.map((ob) => processingByParticipant(ob, 'Obligado Solidario'));
            }
            newField.dateElaboration = !_.isEmpty(dateElaboration) ? dateToString(dateElaboration) : '';
            setData.push(newField);
         });
         return setData;
      } catch (error) {
         return setData;
      }
   }
}

function processingByParticipant(obj, participantType) {
   let { idClient, typePerson, fullName, ...others } = obj;
   let docs = [],
      pages = [];
   Object.keys(others).forEach((itm) => {
      if (itm in initConfigModel) {
         let cg = initConfigModel[itm];
         docs.push(cg.title);
         pages.push(cg.page);
      }
   });

   return { idClient, typePerson, participantType, fullName, docs, pages: pages.toSorted(), ...others };
}
