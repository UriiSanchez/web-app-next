import _ from 'lodash';
import PropTypes from 'prop-types';

import { useGlobalContext } from '../../hooks';
import { constProfiles as Profile } from '../../helpers/config';

/**
 * Componente genérico para mostrar a los participantes de la solicitud grupal.
 * @param {Array} applycants - Pasar arreglo de aquellos que participan en la solicitud.
 * @param {Function} onSelect - Función para el clic para obtener información de cada participante.
 * @param {Function} [onApplyCIEC] - Función para enviar el correo para pedir el CIEC y solo aplica para el perfil EMG.
 */
export const ParticipantsTable = ({ applycants, onSelect, onApplyCIEC }) => {
   const { user } = useGlobalContext();
   return (
      <div className='w-7/12'>
         <div className='px-4 py-2 text-sm text-white bg-black border-transparent rounded-t'>
            Solicitante(s) & Obligado(s) Solidario(S)
         </div>
         {!_.isEmpty(applycants) ? (
            applycants.map(({ relatedPersonResponseList, idRequest }, idx) => {
               return (
                  <div
                     key={`group_${idRequest}`}
                     className={`flex flex-row border-gray border mb-4 text-sm max-h-32 ${
                        applycants.length === ++idx && 'rounded-b'
                     }`}>
                     <div
                        className={`flex flex-col justify-start w-7/12 min-h-28 max-h-28 px-5 gap-2 py-2 container-overflow`}>
                        {relatedPersonResponseList.map((obli, u) => (
                           <label
                              key={obli.idClient}
                              htmlFor={obli.idClient + idx + u}
                              className='cursor-pointer select-none'>
                              <input
                                 id={obli.idClient + idx + u}
                                 type='radio'
                                 name='radio'
                                 className='option-input'
                                 onClick={() => onSelect(obli.idClient, idRequest)}
                              />
                              {(obli.idCatTypePerson == 1 ? 'Solicitante: ' : 'Obligado Solidario: ') + obli.fullName}
                           </label>
                        ))}
                     </div>
                     {user?.idProfile === Profile.EMG && (
                        <div className='flex flex-col w-5/12 border-l'>
                           <div className='flex items-center justify-between h-full px-5'>
                              <p className='text-gray'>Solicitar CIEC </p>
                              <button disabled type='button' className='clean' onClick={() => onApplyCIEC(0)}>
                                 <span className='material-symbols-outlined filled'>arrow_circle_right</span>
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               );
            })
         ) : (
            <>
               <div className='flex flex-row mb-4 text-sm border border-gray box h-44'></div>
               <div className='flex flex-row h-24 text-sm border rounded-b border-gray box'></div>
            </>
         )}
      </div>
   );
};

ParticipantsTable.propTypes = {
   applycants: PropTypes.array,
   onSelect: PropTypes.func.isRequired,
   onApplyCIEC: PropTypes.func,
};
