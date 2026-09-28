import React from 'react';

export const CoverageSkeleton = () => {
   return (
      <div className='mt-8 ml-6'>
         <div className='flex flex-col gap-2 mb-6'>
            <p className='w-full'>
               <span className='font-semibold text-black-900'>Pregunta 1.</span>
               &nbsp;¿Cuál es el tipo de subyacente a cubrir?
            </p>
            <div className='flex flex-col w-3/12 h-32 gap-2 my-4 ml-5 rounded box'></div>
         </div>
         <div className='flex flex-col gap-2 mb-6'>
            <p className='w-full'>
               <span className='font-semibold text-black-900'>Pregunta 2.</span>
               &nbsp;¿El cliente realiza importaciones?
            </p>
            <div className='flex flex-col w-3/12 h-32 gap-2 my-4 ml-5 rounded box'></div>
         </div>
         <div className='flex flex-col gap-2 mb-6'>
            <p className='w-full'>
               <span className='font-semibold text-black-900'>Pregunta 3.</span>
               &nbsp;¿El cliente realiza exportaciones?
            </p>
            <div className='flex flex-col w-3/12 h-32 gap-2 my-4 ml-5 rounded box'></div>
         </div>
         <div className='flex flex-col gap-2 mb-6'>
            <p className='w-full'>
               <span className='font-semibold text-black-900'>Pregunta 4.</span>
               &nbsp;Descripción de la estrategia de cobertura
            </p>
            <div className='flex flex-col w-6/12 h-32 gap-2 my-4 ml-5 rounded box'></div>
         </div>
         <div className='flex flex-col gap-2 mb-6'>
            <p className='w-full'>
               <span className='font-semibold text-black-900'>Pregunta 5.</span>
               &nbsp;¿El cliente tiene experiencia con derivados?
            </p>
            <div className='flex flex-col w-3/12 h-32 gap-2 my-4 ml-5 rounded box'></div>
         </div>
      </div>
   );
};
