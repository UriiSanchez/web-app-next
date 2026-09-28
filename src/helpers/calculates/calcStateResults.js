import { produce } from 'immer';
import Decimal from 'decimal.js';
import { constConceptsSR } from '../../helpers';

/**
 * Calcula y actualiza los porcentajes de los conceptos y valores de conceptos automáticos.
 * @param {Object[]} concepts - lista de conceptos a actualizar.
 * @param {string} changedConceptId - el id del concept que se modificó.
 * @returns {Object[]} - la lista de conceptos actualizados.
 */
export const onCalculateConcepts = (concepts, changedConceptId) => {
   const {
      VENTAS_NETAS,
      COSTO_DE_VENTAS_Y_O_SERVICIO,
      UTILIDAD_BRUTA,
      GASTOS_DE_OPERACION,
      UTILIDAD_DE_OPERACION
   } = constConceptsSR;

   return produce(concepts, draftConcepts => {
      const ventasNetas = draftConcepts.find(findConceptById(VENTAS_NETAS));
      const costoDeVentas = draftConcepts.find(findConceptById(COSTO_DE_VENTAS_Y_O_SERVICIO))?.amount || 0;
      const gastosDeOperacion = draftConcepts.find(findConceptById(GASTOS_DE_OPERACION))?.amount || 0;

      const ventasNetasAmount = ventasNetas?.amount || 0;

      // Calcula todos los porcentajes excepto el de Ventas Netas.
      draftConcepts.forEach(concept => {
         if (concept.id !== VENTAS_NETAS) {
            const percentageValue = new Decimal(concept.amount || 0).div(ventasNetasAmount).times(100).toNumber();
            concept.percentage = isFinite(percentageValue) ? String(percentageValue) : '0';
         }
      });

      // Calcula valor y porcentajes de campos automáticos.
      if ([VENTAS_NETAS, COSTO_DE_VENTAS_Y_O_SERVICIO, GASTOS_DE_OPERACION].includes(changedConceptId)) {
         const utilidadAmount = new Decimal(ventasNetasAmount).minus(costoDeVentas).toNumber();

         draftConcepts.forEach(concept => {
            if (concept.id === UTILIDAD_BRUTA) {
               const percentageValue = new Decimal(utilidadAmount).div(ventasNetasAmount).times(100).toNumber();

               concept.amount = isFinite(utilidadAmount) ? String(utilidadAmount) : null;
               concept.percentage = isFinite(percentageValue) ? String(percentageValue) : '0';
            }

            if (concept.id === UTILIDAD_DE_OPERACION) {
               const amountValue = new Decimal(utilidadAmount).minus(gastosDeOperacion).toNumber();
               const percentageValue = new Decimal(utilidadAmount).minus(gastosDeOperacion).div(ventasNetasAmount).times(100).toNumber();

               concept.amount = isFinite(amountValue) ? String(amountValue) : null;
               concept.percentage = isFinite(percentageValue) ? String(percentageValue) : '0';
            }
         });
      }

      // Calcula porcentaje de Ventas Netas al final ya que depende de los cálculos anteriores.
      const costoDeVentasPercentage = draftConcepts.find(findConceptById(COSTO_DE_VENTAS_Y_O_SERVICIO))?.percentage || 0;
      const utilidadBrutaPercentage = draftConcepts.find(findConceptById(UTILIDAD_BRUTA))?.percentage || 0;

      if (ventasNetas) {
         const percentageValue = new Decimal(costoDeVentasPercentage).plus(utilidadBrutaPercentage).toNumber();
         ventasNetas.percentage = isFinite(percentageValue) ? String(percentageValue) : '0';
      }
   });
};

const findConceptById = id => concept => concept.id === id;
