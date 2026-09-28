import React from 'react';
import Image from 'next/image';

import { MainModal } from '../Modal';
import { useGlobalContext } from '../../hooks';

import icoFlag from '../../../public/icons/ico_flag.svg';

/**
 * Componente que sirve para mostrar las alertas dentro del Modelo y se alimenta desde el Context
 */
export const AlertsModel = () => {
   const { general, actions } = useGlobalContext();
   return (
      <MainModal isOpened={true} xs='max-w-xl mt-[-1%] 2xl:mt-[5%] fadeIn'>
         <div className='flex items-center justify-center gap-2'>
            <Image src={icoFlag} alt='Icono de bandera para alertas modal' width={20} />
            <h1 className='flex-auto text-2xl'>Alertas</h1>
         </div>
         <ol className='flex flex-col gap-2 pl-8 my-4 text-sm list-disc max-h-60 2xl:max-h-80 container-overflow'>
            {general.alertsModel?.alerts?.map((item) => (
               <li key={item?.id}>{item?.descripcion || ''}.</li>
            ))}
         </ol>
         <div className='flex justify-end w-full'>
            <button
               type='button'
               onClick={() => actions?.setConfig({ alertsModel: { show: false, alerts: [] } })}
               className='flex items-center justify-center px-4 py-1 text-sm text-white border select-none w-36 rounded-3xl bg-black-900'>
               Cerrar
            </button>
         </div>
      </MainModal>
   );
};
