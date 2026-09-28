import PropTypes from 'prop-types';

import { ReassignmentAnalystBall } from './ReassignmentAnalystBall';
import { CancelRequestButton } from './CancelRequestButton';

/**
 * Componente genérico que sirve como una barra de navegación, mostrando un título y botones.
 * @param {string} title - Título que se muestra en el lado izquierdo.
 * @param {Array.<Object>} buttons - Arreglo de objetos que define los botones principales.
 * @param {string} buttons.id - Nombre único para el botón.
 * @param {boolean} buttons.isVisible - Determina si se renderiza el botón.
 * @param {boolean} [buttons.isDisable=false] - Define si el botón está deshabilitado o habilitado.
 * @param {Function} buttons.toAction - Función que se ejecuta al hacer clic en el botón.
 * @param {string} [buttons.sx=''] - Clases css adicionales para el botón.
 * @param {string} [buttons.label] - Texto que aparecerá dentro del botón.
 * @param {string} [form] - Nombre del formulario vinculado al método submit.
 * @param {Object} request - Objeto de la solicitud grupal.
 * @param {boolean} [showBall=false] - Indica si se muestra el componente AnalystDropdown.
 * @param {boolean} [showCancel=false] - Indica si se muestra el componente CancelRequestButton.
 */
export function HeaderTitle({ title, buttons, request, showBall = false, showCancel = false }) {
   return (
      <div className='z-50 sticky top-0 bg-white flex border-b-[1.5px] border-black w-full py-4 px-8 mb-4 gap-2'>
         <div className='flex flex-row items-center w-3/4 gap-2'>
            <h1 className='text-xl font-semibold truncate' title={title}>
               {title}
            </h1>
            {request && (
               <>
                  {showBall && <ReassignmentAnalystBall request={request} />}
                  {showCancel && <CancelRequestButton {...request} />}
               </>
            )}
         </div>
         <div className='flex justify-end text-xs gap-x-4 grow font-extralight'>
            {buttons?.map((btn) => {
               return (
                  btn.isVisible && (
                     <button
                        key={btn.id}
                        type='button'
                        onClick={btn.toAction}
                        title={btn.label}
                        className={`flex items-center justify-center w-36 px-4 border rounded-3xl select-none ${
                           btn.sx || ''
                        }`}
                        disabled={btn.isDisable ?? false}
                        {...{ form: btn?.form }}>
                        {btn.label}
                     </button>
                  )
               );
            })}
         </div>
      </div>
   );
}

HeaderTitle.propTypes = {
   tile: PropTypes.string,
   buttons: PropTypes.arrayOf(
      PropTypes.shape({
         id: PropTypes.node.isRequired,
         isVisible: PropTypes.bool,
         isDisable: PropTypes.bool,
         toAction: PropTypes.func,
         sx: PropTypes.string,
         label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
   ),
   request: PropTypes.object,
   showBall: PropTypes.bool,
   showCancel: PropTypes.bool,
};
