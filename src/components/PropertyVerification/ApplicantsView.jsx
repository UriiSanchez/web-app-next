import PropertiesView from './Form/PropertiesView';
import PropertiesEdit from './Form/PropertiesEdit';
import IndividualSummary from './Details/IndividualSummary';
import { useDivMeasure } from '../../hooks';
import PropTypes from 'prop-types';

/**
 * Vista de la pantalla Relación de Propiedades, permite al usuario capturar propiedades del solicitante.
 * @param {Object} info - Es la información general de toda la pantalla
 * @param {function} onUpdateData - Función que hereda del componente padre para actualizar el state principal.
 * @param {boolean} isNotEditable - Indica si deben estar habilitados los campos.
 * @return JSX.Element - Vista para el Aplicante.
 * */
export default function ApplicantsView({ info, onUpdateData, isNotEditable }) {
   const [refElement, dimensions] = useDivMeasure();
   return (
      <div className='px-8 mb-6' ref={refElement}>
         {isNotEditable ? (
            <PropertiesView {...{ info, onUpdateData }} />
         ) : (
            <PropertiesEdit {...{ info, onUpdateData, width: `${dimensions.width - 64}px` }} />
         )}
         <IndividualSummary data={info.resumeInd} />
      </div>
   );
}

ApplicantsView.propTypes = {
   info: PropTypes.object,
   onUpdateData: PropTypes.func,
   isNotEditable: PropTypes.bool,
};
