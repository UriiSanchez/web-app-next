import React from 'react';

export const BuroSkeleton = () => {
   return (
      <div className='relative grid grid-flow-row grid-cols-3 gap-4 px-16 py-4 auto-rows-max'>
         <div className='flex flex-col col-span-2 gap-4 container-overflow'>
            <h1 className='text-xl font-bold h-9 box'></h1>
            <div className='flex flex-col gap-1.5 w-1/2 pt-5'>
               <div className='text-sm 2xl:text-base'>Fecha de nacimiento</div>
               <div className='h-9 box'></div>
            </div>
            <div className='flex flex-col gap-1.5 w-1/2 pt-2'>
               <p className='pb-3 text-lg'>Persona</p>
               <div className='text-sm 2xl:text-base'>Tipo de persona</div>
               <div className='h-9 box'></div>
            </div>
            <div className='flex flex-col gap-1.5 w-1/2 pt-2'>
               <p className='pb-3 text-lg'>Identificador</p>
               <div className='text-sm 2xl:text-base'>RFC</div>
               <div className='h-9 box'></div>
            </div>
            <p className='w-full pt-4 text-lg'>Dirección</p>
            <div className='grid grid-cols-4 gap-4 text-sm 2xl:text-base'>
               <div className='flex flex-col col-span-2'>
                  <div className='font-bold'>Calle</div>
                  <div className='h-9 box'></div>
               </div>
               <div className='flex flex-col col-span-2'>
                  <div className='font-bold'>Colonia</div>
                  <div className='h-9 box'></div>
               </div>
               <div className='flex flex-col col-span-2'>
                  <div className='font-bold '>Ciudad</div>
                  <div className='h-9 box'></div>
               </div>
               <div className='flex flex-col col-span-2'>
                  <div className='font-bold'>Estado</div>
                  <div className='h-9 box'></div>
               </div>
               <div className='flex flex-col'>
                  <div className='font-bold'>C.P</div>
                  <div className='h-9 box'></div>
               </div>
               <div className='flex flex-col'>
                  <label htmlFor='exteriorNumber' className='font-bold'>
                     Núm. exterior
                  </label>
                  <div className='h-9 box'></div>
               </div>
               <div className='flex flex-col'>
                  <div>
                     Núm. interior <span className='text-xs'>(opcional)</span>
                  </div>
                  <div className='h-9 box'></div>
               </div>
               <div className='flex flex-col'>
                  <div className='font-bold'>País</div>
                  <div className='h-9 box'></div>
               </div>
               <div className='flex flex-col col-span-2'>
                  <div className='font-bold'>Municipio</div>
                  <div className='h-9 box'></div>
               </div>
            </div>
            <p className='w-full pt-2 text-lg'>Adicionales</p>
            <div className='grid grid-cols-3 gap-4 pb-3 text-sm 2xl:text-base'>
               <div className='flex flex-col'>
                  <div>Nacionalidad</div>
                  <div className='h-9 box'></div>
               </div>
               <div className='flex flex-col'>
                  <div>
                     Teléfono <span className='text-xs'>(opcional)</span>
                  </div>
                  <div className='h-9 box'></div>
               </div>
               <div className='flex flex-col'>
                  <div>
                     Rerefencia Crediticia <span className='text-xs'>(opcional)</span>
                  </div>
                  <div className='h-9 box'></div>
               </div>
            </div>
         </div>
         <div className='flex flex-col h-40 p-0.5 text-sm'>
            <div className='px-4 py-2 text-sm text-white bg-black border-white rounded-t'>
               <h4>Método para la consulta de Buró de Crédito</h4>
            </div>
            <div className='border-b rounded-b border-x border-gray box'>
               <div className='grid h-48 grid-cols-3 text-xs border-b last:border-b-0 border-gray lg:text-sm 2xl:text-base'></div>
            </div>
         </div>
         <div className='sticky bottom-0 z-50 flex justify-center w-full col-span-3 gap-4 py-3 text-xs bg-white '>
            <button disabled className='pt-1 pb-1 text-white rounded-full pl-7 pr-7'>
               Actualizar
            </button>
            <button disabled className='pt-1 pb-1 text-white rounded-full pl-7 pr-7'>
               Confirmar
            </button>
         </div>
      </div>
   );
};
