import _ from 'lodash';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { MainModal } from '../Modal';
import { useGlobalContext } from '../../hooks';

/**
 * Componente exclusivo para mostrar documentos faltantes cuando el método de consulta es Carta Nueva.
 * @param {Array} docs - Listado de documentos requeridos para Carta Nueva.
 * @param {boolean} showModal - Permite habilitar o deshabilitar el Modal.
 * @param {string} typePerson - Tipo de persona
 * @param {Function} fnClose - Función para cerrar el modal.
 * @returns
 */
export const DetailsNewLetter = ({ docs, showModal, typePerson, fnClose }) => {
   const { actions } = useGlobalContext();
   const newDocs = useMemo(() => {
      return {
         rl: docs.filter((dc) => dc.type == 'RL'),
         allDocs: docs.filter((dc) => dc.type != 'RL'),
      };
   }, [docs]);

   return (
      <MainModal isOpened={showModal} onClose={fnClose} xs='max-w-2xl mt-[5%] fadeIn text-base'>
         <div className='flex flex-col gap-4 px-4 pt-2 pb-6'>
            <h2 className='text-xl'>Requisitos para realizar la Consulta de Buró de Crédito</h2>
            {typePerson == 'PM' && (
               <>
                  <h4 className='flex items-center gap-2'>
                     ID de lo(s) Representante(s) Legale(s)
                     <div className='relative flex items-center group'>
                        <span className='text-blue-800 cursor-pointer material-symbols-outlined icon-size-20 filled'>
                           help
                        </span>
                        <div className='absolute z-10 justify-center hidden w-full group-hover:flex top-5 left-[1rem] fadeIn'>
                           <div className='self-center px-2 py-1 text-xs text-white bg-blue-800 rounded whitespace-nowrap'>
                              Los representantes solo son requeridos para Personas Morales
                           </div>
                        </div>
                     </div>
                  </h4>
                  <div className='flex flex-col flex-none w-11/12 gap-4 mx-auto'>
                     {!_.isEmpty(newDocs?.rl) ? (
                        newDocs?.rl.map((dc) => {
                           let isDisable = dc?.folio == 0 || dc?.folio == null;
                           return (
                              <div key={dc._id} className='flex items-center gap-2'>
                                 <span
                                    className={`material-symbols-outlined filled text-${
                                       isDisable ? 'red-500' : 'emerald-600'
                                    } `}>
                                    {isDisable ? 'check_box_outline_blank' : 'select_check_box'}
                                 </span>
                                 <p className='flex-1 text-sm'>{dc.layout}</p>
                                 <button
                                    disabled={isDisable}
                                    onClick={() =>
                                       actions.togglePDF({ folio: dc.folio, title: dc.title + ' - ' + dc.layout })
                                    }
                                    className='flex items-center justify-center w-24 px-3 py-1 text-xs text-white bg-black border lg:w-28 rounded-3xl'>
                                    Visualizar
                                 </button>
                              </div>
                           );
                        })
                     ) : (
                        <p className='text-sm text-center'>
                           <b className='text-red-500'>¡Representante Legal: No Ingresado!</b> <br />
                           Recuerda que los RL son obligatorios para <b>personas morales</b>. Por favor cierra esta
                           modal y haz clic en el botón de validar
                        </p>
                     )}
                  </div>
                  <hr />
               </>
            )}
            <h4>Documentación</h4>
            <div className='flex flex-col flex-none w-11/12 gap-4 mx-auto'>
               {newDocs?.allDocs.map((dc) => {
                  let isDisable = dc?.folio == 0 || dc?.folio == null;
                  return (
                     <div key={dc._id} className='flex items-center gap-2'>
                        <span
                           className={`material-symbols-outlined filled text-${
                              isDisable ? 'red-500' : 'emerald-600'
                           } `}>
                           {isDisable ? 'check_box_outline_blank' : 'select_check_box'}
                        </span>
                        <p className='flex-1 text-sm'>{dc.title}</p>
                        <button
                           disabled={isDisable}
                           onClick={() => actions.togglePDF({ folio: dc.folio, title: dc.title })}
                           className='flex items-center justify-center w-24 px-3 py-1 text-xs text-white bg-black border lg:w-28 rounded-3xl'>
                           Visualizar
                        </button>
                     </div>
                  );
               })}
            </div>
         </div>
      </MainModal>
   );
};

DetailsNewLetter.propTypes = {
   docs: PropTypes.array.isRequired,
   showModal: PropTypes.bool.isRequired,
   typePerson: PropTypes.string.isRequired,
   fnClose: PropTypes.func.isRequired,
};
