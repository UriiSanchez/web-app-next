import React from 'react';
import { formatId } from '../../helpers';

export const PropertySkeleton = () => {
   return (
      <div className='h-auto px-8 mb-12'>
         <div className='grid grid-cols-2 grid-flow-row auto-rows-max flex-none w-[22rem] max-h-[26rem] gap-x-2 gap-y-4 p-4 box-border border border-black-500 rounded-md relative fadeIn'>
            <div className='flex items-end col-span-2 gap-2 mt-2 select-none'>
               <span className='flex-none text-gray material-symbols-outlined icon-size-24'>home</span>
               <p>
                  Propiedad&nbsp;
                  {formatId(1, 2)}
               </p>
               <div className='flex items-center justify-end flex-auto gap-2 text-xs text-gray'>
                  <p>verificación</p>
                  <span className='material-symbols-outlined icon-size-20'>open_in_new</span>
               </div>
            </div>
            <div className='flex flex-col gap-2'>
               <p className='text-xs select-none'>Folio del formulario</p>
               <div className='w-full h-8 px-2 py-1 text-sm text-right border rounded outline-none border-black-500 box'></div>
            </div>
            <div className='flex flex-col gap-2'>
               <p className='text-xs select-none'>Valor s/cliente (MXP)</p>
               <div className='w-full h-8 px-2 py-1 text-sm text-right border rounded outline-none border-black-500 box'></div>
            </div>
            <div className='flex flex-col gap-2'>
               <p className='text-xs select-none'>Unidad de terreno</p>
               <div className='w-full h-8 px-2 py-1 text-sm text-right border rounded outline-none border-black-500 box'></div>
            </div>
            <div className='flex flex-col gap-2'>
               <p className='text-xs select-none'>Tipo de inmbueble</p>
               <div className='w-full h-8 px-2 py-1 text-sm text-right border rounded outline-none border-black-500 box'></div>
            </div>
            <div className='flex flex-col gap-2'>
               <p className='text-xs select-none'>
                  m<sup>2</sup> de construcción
               </p>
               <div className='w-full h-8 px-2 py-1 text-sm text-right border rounded outline-none border-black-500 box'></div>
            </div>
            <div className='flex flex-col gap-2'>
               <p className='text-xs select-none'>Dimensiones de terreno</p>
               <div className='w-full h-8 px-2 py-1 text-sm text-right border rounded outline-none border-black-500 box'></div>
            </div>
            <div className='flex flex-col col-span-2 gap-2'>
               <p className='text-xs select-none'>Ubicación</p>
               <div className='w-full h-24 px-2 py-1 text-sm text-right border rounded outline-none border-black-500 box'></div>
            </div>
         </div>
         <div className='flex px-4 py-2 my-4 text-xs bg-black rounded-md text-black-light'>
            <div className='flex-none w-20'>Total</div>
            <div className='flex-1 w-80'>
               Dimensiones de terreno en m<sup>2</sup>:&nbsp;-
            </div>
            <div className='flex-1 w-80'>
               m<sup>2</sup> de construcción:&nbsp;-
            </div>
            <div className='flex-1 w-80'>Valor s/cliente:&nbsp;-</div>
         </div>
         <div className='flex flex-col' data-element='table'>
            <div className='flex justify-between items-center py-2 px-[15px] text-center bg-black text-xs text-white rounded-t-lg'>
               <span className='px-2'>Resumen individual</span>
               <span className='px-2'>Inmueble(s) del solicitante</span>
               <span className='px-2'>Libres de gravamen</span>
               <span className='px-2'>Gravados</span>
               <span className='px-2'>Embargados</span>
               <span className='px-2'>Co-propiedad</span>
               <span className='px-2'>Pendientes por verificar</span>
               <span className='px-2'>En escrituración</span>
            </div>
            <div className='h-16 border rounded-b-lg box'></div>
         </div>
      </div>
   );
};
