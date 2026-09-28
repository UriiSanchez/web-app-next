import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { getLegalRepresent, saveRepresent } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';
import { getError, onKeyNumbers, onPasteOnlyNumbers, sweetConditional, sweetModalRedirect } from '../../../../helpers';

import icoSello from '../../../../../public/icons/ico_sello.png';

/**
 * @param info: Es necesario para poder buscar los Representantes Legales.
 * @param fnSet: Es necesario cerrar el modal.
 **/
export default function LegalRepresentatives({ info, fnSet }) {
   const router = useRouter();
   const { user, actions } = useGlobalContext();
   const [repLegal, setRepLegal] = useState([]);
   const [allowToSave, setAllowTOSave] = useState({ save: false, countItems: 0 });
   const [stateID, setStateID] = useState({ required: [], invalid: [] });

   useEffect(() => {
      const fetchData = async () => {
         actions.toggleLoading('Buscando representantes legales...');
         try {
            const { status, data } = await getLegalRepresent(info, user);
            if (status !== 200) {
               fnSet();
               return;
            }

            setRepLegal(data);
         } catch (error) {
            console.log('Obtener Representantes: ', error);
         } finally {
            actions.toggleLoading();
         }
      };
      fetchData();
   }, []);

   useEffect(() => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflowY = 'hidden';
      if (!_.isEmpty(allowToSave)) {
         let countItems = repLegal?.thirdRepresentatives?.filter((rl) => rl.isSelected)?.length || 0;
         let save =
            _.isEmpty(stateID.invalid) && _.isEmpty(stateID.required) ? countItems > 0 && countItems <= 3 : false;
         setAllowTOSave({ save, countItems });
      }
      return () => {
         document.body.style.overflow = 'auto';
         document.documentElement.style.overflowY = 'auto';
      };
   }, [repLegal]);

   const onHandelChecked = (e, index) => {
      const { checked } = e.target;

      if (!checked) {
         let invalidIds = stateID.invalid.filter((id) => id != index);
         let requiredIds = stateID.required.filter((id) => id != index);
         setStateID({ required: requiredIds, invalid: invalidIds });
      }

      let thirdRepresentatives = repLegal?.thirdRepresentatives.map((rl, i) => {
         if (i == index) {
            if (rl.idClient == 0 && !stateID.required.includes(index) && checked) {
               setStateID({ ...stateID, required: [...stateID.required, index] });
            }
            return {
               ...rl,
               deleted: !_.isUndefined(rl.idRelatedPerson) ? rl.isSelected : false,
               isSelected: checked,
               idClientManual: checked ? rl.idClientManual : '',
            };
         }
         return rl;
      });
      setRepLegal({ ...repLegal, thirdRepresentatives });
   };

   const onChangeIdAlternative = (e, index) => {
      const { value } = e.target;
      let thirdRepresentatives = repLegal?.thirdRepresentatives.map((rl, i) => {
         if (i == index) {
            return { ...rl, idClientManual: parseInt(value) ? parseInt(value) : value };
         }
         return rl;
      });

      //* Hacemos una filtracion para cambiar el estado de cada id alternativo (requerido, formato invalido)
      let invalidIds = stateID.invalid.filter((id) => id != index);
      let requiredIds = stateID.required.filter((id) => id != index);

      if (!Number.isInteger(parseInt(value)) && !_.isEmpty(value)) {
         if (!stateID.invalid.includes(index)) {
            setStateID({ required: requiredIds, invalid: [...stateID.invalid, index] });
         }
      } else if (
         _.isEmpty(value) &&
         repLegal?.thirdRepresentatives[index].idClient == 0 &&
         !stateID.required.includes(index)
      ) {
         setStateID({ required: [...stateID.required, index], invalid: invalidIds });
      } else if (
         !_.isEmpty(value) &&
         repLegal?.thirdRepresentatives[index].idClient == 0 &&
         stateID.required.includes(index)
      ) {
         setStateID({ required: requiredIds, invalid: invalidIds });
      } else {
         setStateID({ ...stateID, invalid: invalidIds });
      }
      setRepLegal({ ...repLegal, thirdRepresentatives });
   };

   const onSaveLegals = async () => {
      try {
         actions.toggleLoading('Guardando Representantes Legales...');
         //* Hacemos un filtro donde los RL estén como isSelected o deleted true
         let filterRL = repLegal.thirdRepresentatives?.filter((tr) => tr.isSelected || tr.deleted);
         const result = await saveRepresent(filterRL);
         if (result.status !== 204) {
            getError(result);
            return;
         }

         sweetModalRedirect({
            title: '¡Se guardo la información correctamente!',
            html: 'Se recargará la información en <b></b> milliseconds.',
         });

         setTimeout(() => {
            router.reload();
         }, 2000);
      } catch (error) {
         console.log('Save Representantes: ', error);
      } finally {
         actions.toggleLoading();
      }
   };

   return (
      !_.isEmpty(repLegal) && (
         <dialog open className='main-modal fadeIn'>
            <div className='relative m-auto max-w-4xl min-h-[10rem] max-h-[30rem] rounded p-6 modal-container'>
               <button
                  type='submit'
                  className='absolute top-1 right-1'
                  title='Cerrar modal'
                  onClick={() =>
                     sweetConditional({
                        title: 'Recuerda que...',
                        text: '<p class="text-sm">Para <b>Carta nueva no validada</b> es necesario añadir al menos un <span style="color:#F7AC20;" class="font-bold">Representante Legal</span> de lo contrario no podrás continuar el proceso.</p>',
                        onFunc: fnSet,
                        accept: 'Salir',
                        cancel: 'Continuar',
                        icon: '',
                     })
                  }>
                  <span className='rounded-full material-symbols-outlined hover:bg-black-900 hover:text-white'>
                     close
                  </span>
               </button>
               <div className='py-2'>
                  <div className='flex items-center space-x-2'>
                     <Image src={icoSello} width='24' height='24' alt='' />
                     <h2 className='text-lg 2xl:text-2xl'>Representantes Legales</h2>
                  </div>
                  <p className='mt-1 text-gray-500'>
                     Selecciona el/los representantes legales que firmaron la carta de autorización de crédito
                  </p>
               </div>
               <div className='pt-2'>
                  <div className='flex flex-col gap-4 py-2 max-h-[18rem] container-overflow'>
                     <table className='w-full text-sm rounded overflow-clip'>
                        <thead>
                           <tr>
                              <td className='pl-4 '></td>
                              <td>Id Cliente</td>
                              <td>Nombre</td>
                              <td>RFC</td>
                              <td>Id Cliente Alternativo</td>
                           </tr>
                        </thead>
                        <tbody>
                           {repLegal?.thirdRepresentatives?.map((legal, index) => (
                              <tr className='h-8' key={`rowLegal-${legal.idClient}-${legal.idRequest}`}>
                                 <td>
                                    <label
                                       htmlFor={'check-' + legal?.idClient}
                                       className='relative text-sm cursor-pointer lg:text-base'>
                                       <input
                                          id={'check-' + legal?.idClient}
                                          name='fieldset'
                                          type='checkbox'
                                          className='option-input'
                                          value={legal?.idClient}
                                          checked={legal?.isSelected}
                                          onChange={(e) => onHandelChecked(e, index)}
                                       />
                                    </label>
                                 </td>
                                 <td>{legal?.idClient}</td>
                                 <td>{legal?.fullName}</td>
                                 <td>{legal?.rfc}</td>
                                 <td>
                                    <div>
                                       <input
                                          type='text'
                                          disabled={!legal?.isSelected}
                                          value={legal?.idClientManual}
                                          maxLength={10}
                                          onKeyDown={onKeyNumbers}
                                          onPaste={onPasteOnlyNumbers}
                                          onChange={(e) => onChangeIdAlternative(e, index)}
                                          className={`w-36 border px-1 py-0.5 rounded-sm outline-none hover:border-blue-800 hover:ring-1 focus:outline-none focus:text-blue-800 ${
                                             stateID.invalid.includes(index) &&
                                             ' border-red-500 focus:text-red-500 text-red-500'
                                          }`}
                                       />
                                    </div>
                                 </td>
                                 {stateID.invalid.includes(index) && (
                                    <td className='w-32 text-center text-red-500'>Formato inválido</td>
                                 )}
                                 {stateID.required.includes(index) && (
                                    <td className='w-32 text-center text-red-500'>Obligatorio</td>
                                 )}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                  {allowToSave.countItems > 3 && (
                     <p className='w-full mt-2 text-xs text-center text-red-500 fadeIn'>
                        Recuerda que solo puedes seleccionar un maximo de 3 Representantes Legales.
                     </p>
                  )}
                  <div className='flex justify-end pt-4'>
                     <button
                        type='button'
                        className={`flex justify-center items-center w-28 px-3 py-1 border rounded-3xl text-white bg-black text-xs`}
                        onClick={() => onSaveLegals()}
                        disabled={!allowToSave.save}>
                        Seleccionar
                     </button>
                  </div>
               </div>
            </div>
         </dialog>
      )
   );
}
