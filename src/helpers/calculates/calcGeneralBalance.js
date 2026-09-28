import _ from 'lodash';
import { produce } from 'immer';
import Decimal from 'decimal.js';
import { constActivosGB, constPasivosGB, constConceptsGB } from '../initials';

/**
 * Calcula y actualiza valores y porcentajes de los conceptos en la página de balance general.
 * @param {Object[]} concepts lista de conceptos.
 * @param {number} idItem identifica el tipo de concepto que se modificó.
 * @returns {Object[]} una nueva lista de conceptos actualizados.
 */
export const onCalculateGB = (concepts, idItem) => {
   return produce(concepts, draftConcepts => {
      if (constPasivosGB.includes(idItem)) {
         updatePasivos(draftConcepts);
      }

      if (constActivosGB.includes(idItem)) {
         updateActivos(draftConcepts);
      }

      updateCapitalContable(draftConcepts);
   });
};

export function calcDiffPasivoFinVsBuroPercentage(value, pasivoFinanciero) {
   if (_.isEmpty(value) || _.isEmpty(pasivoFinanciero)) {
      return 0;
   }

   return new Decimal(Math.abs(value)).div(Math.abs(pasivoFinanciero)).times(100).toNumber();
}

function findByConceptId(conceptId) {
   return concept => concept.idItemChild === conceptId;
}

/**
 * Actualiza los conceptos de la categoría "pasivos".
 * @param {Object[]} concepts lista de conceptos.
 */
function updatePasivos(concepts) {
   const pasivo = concepts.find(findByConceptId(constConceptsGB.PASIVO))?.value || 0;
   const capitalContable = concepts.find(findByConceptId(constConceptsGB.CAPITAL_CONTABLE))?.value || 0;
   const pasivoFinancieroLP = concepts.find(findByConceptId(constConceptsGB.PASIVO_FINANCIERO_LP))?.value || 0;
   const parteCircDeudaLP = concepts.find(findByConceptId(constConceptsGB.PARTE_CIRC_DEUDA_LP))?.value || 0;
   const prestamoBancaACP = concepts.find(findByConceptId(constConceptsGB.PRESTAMO_BAN_A_CP))?.value || 0;
   const pasivoCirculante = concepts.find(findByConceptId(constConceptsGB.PASIVO_CIRCULANTE))?.value || 0;
   const totalPasivosLargoPlazo = concepts.find(findByConceptId(constConceptsGB.TOTAL_PASIVOS_LARGO_PLAZO))?.value || 0;

   const pasivoYCapital = new Decimal(pasivo).plus(capitalContable).toNumber();
   const pasivoFinanciero = new Decimal(pasivoFinancieroLP).plus(parteCircDeudaLP).plus(prestamoBancaACP).toNumber();

   concepts.forEach(concept => {
      if (constPasivosGB.includes(concept.idItemChild)) {
         let percentageValue;
         if (concept.idItemChild === constConceptsGB.PASIVO) {
            percentageValue = new Decimal(pasivoCirculante).div(pasivoYCapital).times(100).add(
               new Decimal(totalPasivosLargoPlazo).div(pasivoYCapital).times(100)
            ).toNumber();
         } else {
            percentageValue = new Decimal(concept.value || 0).div(pasivoYCapital).times(100).toNumber();
         }

         concept.percentage = isFinite(percentageValue) ? String(percentageValue) : '0';
      }
      if (concept.idItemChild === constConceptsGB.PASIVO_FINANCIERO) {
         concept.value = String(pasivoFinanciero);
      }
   });
}

/**
 * Actualiza los conceptos de la categoría "activos".
 * @param {Object[]} concepts lista de conceptos
 */
function updateActivos(concepts) {
   const activoTotal = concepts.find(findByConceptId(constConceptsGB.ACTIVO_TOTAL))?.value || 0;

   concepts.forEach(concept => {
      if (constActivosGB.includes(concept.idItemChild) && concept.idItemChild !== constConceptsGB.ACTIVO_TOTAL) {
         const percentageValue = new Decimal(concept.value || 0).div(activoTotal).times(100);
         concept.percentage = isFinite(percentageValue) ? String(percentageValue) : '0';
      } else if (concept.idItemChild === constConceptsGB.ACTIVO_TOTAL) {
         // TODO: calcular este valor cuando tengamos todos los campos de activos.
         concept.percentage = isFinite(concept.value) && Number(concept.value) !== 0 ? '100' : '0';
      }
   });
}

/**
 * Actualiza los conceptos de la categoría "capital contable".
 * @param {Object[]} concepts la lista de conceptos.
 */
function updateCapitalContable(concepts) {
   const pasivoFinanciero = concepts.find(findByConceptId(constConceptsGB.PASIVO_FINANCIERO))?.value;
   const pasivoBuroDeCred = concepts.find(findByConceptId(constConceptsGB.PASIVO_BURO_DE_CRED))?.value;
   const diffPasivoFinVsBC = concepts.find(findByConceptId(constConceptsGB.DIFF_PASIVO_FIN_VS_BC));

   if (!_.isEmpty(pasivoFinanciero) && !_.isEmpty(pasivoBuroDeCred)) {
      const value = new Decimal(pasivoFinanciero).minus(pasivoBuroDeCred).toNumber();
      diffPasivoFinVsBC.value = String(value);
   }
}
