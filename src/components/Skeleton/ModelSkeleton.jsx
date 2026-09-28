import React from 'react';

export const ModelSkeleton = () => {
   return (
      <section className='flex flex-col h-auto gap-4 px-8'>
         <div className='flex flex-wrap gap-1'>
            <h2 className='flex-none w-3/4 text-xl font-semibold text-black-900'>Análisis de modelo experto</h2>
            <div className='flex items-center justify-end gap-2 text-sm'>
               <p className='text-right'>Fecha elaboración: </p>
               <div className='w-32 h-8 py-0.5 flex items-center justify-center border border-gray rounded bg-gray-200 text-gray-600 box' />
            </div>
            <div className='flex flex-col w-full gap-1'>
               <h4 className='w-1/4 h-5 text-sm text-gray box' />
               <h4 className='w-1/4 h-5 text-sm text-gray box' />
            </div>
         </div>
         <div className='flex items-center justify-center w-full text-white rounded h-9 box' />
         <div className='flex gap-4'>
            <div className='flex flex-col flex-none gap-2 w-96'>
               <h4>Parámetros obligatorios</h4>
               <div className='flex flex-col justify-around p-4 text-sm border rounded-md border-gray 2lg:text-base h-52'>
                  <div className='flex items-center h-5 gap-1 box' />
                  <div className='flex items-center h-5 gap-1 box' />
                  <div className='flex items-center h-5 gap-1 box' />
                  <div className='flex items-center h-5 gap-1 box' />
                  <div className='flex items-center h-5 gap-1 box' />
               </div>
            </div>
            <div className='flex flex-col flex-auto gap-2'>
               <h4>Calificación Global</h4>
               <div className='grid grid-cols-6 grid-rows-5 text-sm border rounded-md border-gray 2lg:text-base h-52'>
                  <div className='grid items-center grid-rows-5 row-span-5 gap-2 p-2 border-r border-gray'>
                     <div />
                     <div>Información financiera</div>
                     <div>Buró de Crédito</div>
                     <div>Razonabilidad de Cobertura</div>
                     <div>Total</div>
                  </div>
                  <div className='grid items-center grid-rows-5 row-span-5 gap-2 p-2 text-center'>
                     <h6 className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                  </div>
                  <div className='grid items-center grid-rows-5 row-span-5 gap-2 p-2 text-center'>
                     <h6 className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                  </div>
                  <div className='grid items-center grid-rows-5 row-span-5 gap-2 p-2 text-center'>
                     <h6 className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                  </div>
                  <div className='grid items-center grid-rows-5 row-span-5 gap-2 p-2 text-center'>
                     <h6 className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                  </div>
                  <div className='row-span-5 grid grid-rows-5 items-center gap-2 p-2 text-center bg-[#EE964533]'>
                     <h6 className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                     <div className='h-5 box' />
                  </div>
               </div>
            </div>
         </div>
         <h4 className='w-full'>Alertas</h4>
         <div className='flex w-1/4 h-8 gap-2 p-2 px-4 mb-2 text-xs rounded box' />
         <h4 className='w-full'>Seguridad</h4>
         <table className='w-full text-sm rounded overflow-clip'>
            <thead>
               <tr className='text-white bg-black'>
                  <td className='py-2 pl-4'>Tipo</td>
                  <td>Otorgante</td>
                  <td>Descripción</td>
                  <td>Valor</td>
                  <td>Créditos a cubir</td>
                  <td>Cobertura Autorizada</td>
                  <td>Cobertura Actual</td>
               </tr>
            </thead>
            <tbody>
               <tr className='h-8'>
                  <td colSpan='7' className='box' />
               </tr>
               <tr className='h-8'>
                  <td colSpan='6' className='py-1 pr-2 text-end'>
                     Total Actual
                  </td>
               </tr>
               <tr className='h-8'>
                  <td colSpan='6' className='py-1 pr-2 text-end'>
                     Cobertura Recomendada
                  </td>
                  <td className='h-5 px-2 box' />
               </tr>
            </tbody>
         </table>
      </section>
   );
};

export const TitleModelSkeleton = () => {
   return <h1 className='w-full h-7 box'></h1>;
};
