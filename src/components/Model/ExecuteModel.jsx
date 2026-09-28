import _ from 'lodash';
import React, { useState } from 'react';

import { getValidateModel, postExecutionModel } from '../../services';
import { Loader } from '../UI';
import { useGlobalContext } from '../../hooks';
import { isValidJSON, sweetConfirmation } from '../../helpers';

let initialMessages = {
   one: `
      <h2 class='text-base font-bold mb-2 text-neutral-400'> Revisando documentación Solicitantes...</h2>
      <p class='text-sm'>Este proceso tomará unos segundos.</p>`,
   two: `
      <h2 class='text-base font-bold mb-2 text-neutral-400'> Procesando modelo...</h2>
      <p class='text-sm'>Este proceso tomará unos segundos.</p>`,
   error: (obj) => {
      let msj =
         !_.isEmpty(obj?.response?.message) && isValidJSON(obj?.response?.message)
            ? JSON.parse(obj?.response?.message)
            : obj?.response?.message;
      return `
      <div class='flex flex-col justify-center items-center gap-4 h-64'>
         <img src='/icons/ico_error.svg' alt='Proceso éxitoso' width='68' />
         <h2 class='text-lg font-bold'>Error en la información</h2>
        ${
         typeof msj != 'object'
            ? `<p class='text-center select-none text-sm'>${msj}</p>`
            : ` <p class='text-center select-none text-sm'> ${
               msj?.message || 'Revisa los datos e intenta ejecutar el modelo nuevamente'
            } por favor reporta este error al correo cisti@ejemplo.com</p>
                <hr/>
               <div class='w-3/4 text-xs flex flex-col gap-2'>
               <p class='text-xs'>${msj?.fullName || '-'}</p>
               ${msj?.errors || 'No definido'}
               </div>`
      }
         <p class='text-xs text-gray-300'>Trace ID: ${obj?.traceId || ''}</p>
      </div>`;
   },
   success: `
      <div class='flex flex-col justify-center items-center gap-4 h-64 mx-auto'>
         <img src='/icons/ico_success.svg' alt='Proceso éxitoso' width='68' />
         <h2 class='text-lg font-bold mb-2 text-neutral-400'> Ejecución en proceso</h2>
         <p>La ejecución del proceso puede demorar de 3 a 10 minutos.</p>
      </div>
   `,
};

export function ExecuteModel({ isDisabled = false, idGroup }) {
   const { user } = useGlobalContext();
   const [isShow, setIsShow] = useState(false);
   const [msg, setMsg] = useState(initialMessages.one);

   const onExecuteModelAsync = async () => {
      try {
         setIsShow(true);
         let resultValidate = await getValidateModel(idGroup, user.userAD);
         if (resultValidate?.status != 200) {
            setIsShow(false);
            sweetConfirmation({
               html: initialMessages.error(resultValidate?.error),
               timer: 8000,
               width: 500,
            });
            return;
         }

         setMsg(initialMessages.two);
         let resultExecution = await postExecutionModel(idGroup, user.userAD);
         if (resultExecution.status != 200) {
            setIsShow(false);
            sweetConfirmation({
               html: initialMessages.error(resultExecution?.error),
               timer: 8000,
               width: 500,
            });
            return;
         }

         sweetConfirmation({
            html: initialMessages.success,
            timer: 5000,
         });

         setIsShow(false);
         setMsg(initialMessages.one);
      } catch (error) {
         console.log(error);
      }
   };

   return (
      <>
         {isShow && <Loader msg={msg} sx='h-auto w-80' />}
         <button
            disabled={isDisabled}
            type='button'
            onClick={onExecuteModelAsync}
            className='px-4 py-1 text-xs text-white bg-black border select-none rounded-3xl'>
            Ejecutar modelo
         </button>
      </>
   );
}
