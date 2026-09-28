import React from 'react';

export const ExchangeSkeleton = () => {
   return (
      <div className='flex flex-col px-8 mb-4 gap-y-4 2xl:w-10/12 2xl:m-auto'>
         <div className='flex flex-wrap gap-y-1 gap-x-4'>
            <h2 className='flex-auto text-xl font-semibold text-black-light'>Calculadora de Parámetros de Operación</h2>
            <h4 className='w-full text-sm text-gray'>Calcula según el tipo de subyacente ya seleccionado </h4>
            <div className='w-3/12 mt-6'>
               <p className='text-black-500'>Cifras </p>
               <div className='w-full h-9 px-4 flex items-center justify-start border border-gray rounded bg-[#EDEDED] text-[#848484] box' />
            </div>
            <div className='w-3/12 mt-6'>
               <p className=' text-black-500'>Tipo de cambio</p>
               <div className='w-full h-9 flex items-center justify-center border border-gray rounded bg-[#EDEDED] text-[#848484] box' />
            </div>
         </div>
         <h2 className='mt-3 font-bold'>Estimación de cobertura anual</h2>
         <div className='flex flex-wrap w-[97%] gap-4 m-auto'>
            <div className='flex flex-col flex-none w-3/12'>
               <p className='text-sm'>Posición del cliente</p>
               <div className='w-full h-9 py-0.5 flex items-center justify-center border border-gray rounded bg-[#EDEDED] text-[#848484] box'></div>
            </div>
            <div className='flex flex-col flex-none w-3/12'>
               <p className='text-sm'>-</p>
               <div className='w-full h-9 flex items-center justify-center border border-gray rounded text-[#848484] focus:outline-none box' />
            </div>
            <div className='flex flex-col flex-none '>
               <p className='text-sm'>% en moneda extranjera</p>
               <div className='w-full h-9 flex items-center justify-center border border-gray bg-[#EDEDED] rounded text-[#848484] box' />
            </div>
            <div className='flex flex-col flex-none '>
               <p className='text-sm'>Flujo de moneda extranjera*</p>
               <div className='w-full h-9 flex items-center justify-center border border-gray bg-[#EDEDED] rounded text-[#848484] box' />
            </div>
            <div className='flex flex-col flex-none'>
               <p className='text-sm'>Politica de cobertura</p>
               <div className='w-full h-9 flex items-center justify-center border border-gray bg-[#EDEDED] rounded text-[#848484] box' />
            </div>
            <div className='flex flex-col flex-none'>
               <p className='text-sm'>Posición acumulada estimada*</p>
               <div className='w-full h-9 flex items-center justify-center border border-gray bg-[#EDEDED] rounded text-[#848484] box' />
            </div>
            <div className='flex flex-col flex-none '>
               <p className='text-sm'>Índice de cobertura</p>
               <div className='w-full h-9 flex items-center justify-center border border-gray bg-[#EDEDED] rounded text-[#848484] box' />
            </div>
            <div className='flex items-end flex-none text-sm text-gray'>*Todos los datos mostrados son anuales</div>
         </div>
         <h2 className='mt-3 font-bold'>Parámetros de operación</h2>
         <div className='flex flex-col w-[97%] gap-4 m-auto'>
            <div className='flex items-center flex-none w-1/2 gap-4'>
               <p className='flex-initial text-sm'>¿Cuál es el monto promedio por operación?</p>
               <div className='flex-none w-2/6 h-9 flex items-center justify-center border border-gray rounded text-[#848484] focus:outline-none box' />
            </div>
            <div className='flex items-center flex-none w-1/2 gap-4'>
               <p className='flex-initial text-sm'>Revolvencia estimada</p>
               <div className='flex-none w-2/6 h-9 flex items-center justify-center border border-gray rounded text-[#848484] focus:outline-none box' />
            </div>
            <div className='flex items-center flex-none w-1/2 gap-4'>
               <p className='flex-initial text-sm'>Plazo máximo de cobertura en meses</p>
               <div className='flex-none w-28 h-9 flex items-center justify-center border border-gray rounded text-[#848484] focus:outline-none box' />
            </div>
            <div className='flex items-center flex-none w-1/2 gap-4'>
               <p className='flex-initial text-sm'>MPA (máxima posición abierta)</p>
               <div className='flex-none w-5/12 h-9 flex items-center justify-center border border-gray bg-[#EDEDED] rounded text-[#848484] box' />
            </div>
         </div>
         <div className='w-full h-8 m-auto my-4 text-center rounded bg-gray box' />
         <h2 className='mt-2 font-bold'>Congruencia de la línea</h2>
         <div className='flex flex-wrap w-1/3 gap-4 mb-6'>
            <div className='flex flex-col flex-none w-1/3'>
               <p className='text-sm'>Spread</p>
               <div className='w-full h-9 flex items-center justify-center border border-gray rounded text-[#848484] focus:outline-none box'></div>
            </div>
            <div className='flex flex-col flex-1'>
               <p className='text-sm'>Línea estimada</p>
               <div className='w-full h-9 flex items-center justify-center border border-gray bg-[#EDEDED] rounded text-[#848484] box'></div>
            </div>
         </div>
      </div>
   );
};
