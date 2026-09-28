import React from 'react';

export const BalanceSkeleton = () => {
   return (
      <section className='flex flex-col gap-4 px-8 pb-10 text-sm'>
         <div className='flex items-center justify-between w-full'>
            <div className='flex-col flex-auto gap-2'>
               <div className='text-xl'>Balance General</div>
               <div className='text-gray'>Cifras en miles de pesos </div>
            </div>
            <div className='flex items-center justify-end text-sm basis-1/3'>
               <p className='mr-2 font-semibold text-right basis-2/3'>Fecha elaboración</p>
               <div className='w-28 h-6 py-0.5 text-center box border border-[#848484] rounded bg-[#EDEDED] text-[#848484]'></div>
            </div>
         </div>
         <div className='grid items-center grid-flow-col grid-cols-4 px-4 text-sm gap-y-4 gap-x-8'>
            <div className='row-span-4 '></div>
            <h1 className='text-lg'>Anual</h1>
            <div className='flex flex-col'>
               <p className='text-xs'>Fecha</p>
               <div className='w-full border rounded pointer-events-none h-9 border-gray undefined box'></div>
            </div>
            <div className='flex flex-col'>
               <p className='text-xs'>Fuente de información</p>
               <div className='w-full border rounded pointer-events-none h-9 border-gray undefined box'></div>
            </div>
            <div className='flex flex-col'>
               <p className='text-xs'>Despacho, contador o interno</p>
               <div className='w-full rounded pointer-events-none bor der h-9 border-gray undefined box'></div>
            </div>

            <h1 className='text-lg'>Anual</h1>
            <div className='flex flex-col'>
               <p className='text-xs'>Fecha</p>
               <div className='w-full border rounded pointer-events-none h-9 border-gray undefined box'></div>
            </div>
            <div className='flex flex-col'>
               <p className='text-xs'>Fuente de información</p>
               <div className='w-full border rounded pointer-events-none h-9 border-gray undefined box'></div>
            </div>
            <div className='flex flex-col'>
               <p className='text-xs'>Despacho, contador o interno</p>
               <div className='w-full rounded pointer-events-none bor der h-9 border-gray undefined box'></div>
            </div>
            <h1 className='text-lg'>Parcial</h1>
            <div className='flex flex-col'>
               <p className='text-xs'>Fecha</p>
               <div className='w-full border rounded pointer-events-none h-9 border-gray undefined box'></div>
            </div>
            <div className='flex flex-col'>
               <p className='text-xs'>Fuente de información</p>
               <div className='w-full border rounded pointer-events-none h-9 border-gray undefined box'></div>
            </div>
            <div className='flex flex-col'>
               <p className='text-xs'>Despacho, contador o interno</p>
               <div className='w-full rounded pointer-events-none bor der h-9 border-gray undefined box'></div>
            </div>
         </div>
         <div className='px-4 text-lg xl:text-2xl'>Activos</div>
         <div className='w-full px-4 py-2 text-white bg-black rounded-md rounded-b-none'>Activos circulantes</div>
         <div className='pl-8 pr-8 space-y-2'>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className='px-4 text-lg xl:text-2xl'>Pasivos</div>
         <div className='w-full px-4 py-2 text-white bg-black rounded-md rounded-b-none'>Pasivos circulantes</div>
         <div className='pl-8 pr-8 space-y-2'>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className='w-full px-4 py-2 text-white bg-black rounded-md rounded-b-none'>Pasivos largo plazo</div>
         <div className='pl-8 pr-8 space-y-2'>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div className='px-4 text-lg xl:text-2xl'>Capital contable</div>
         <div className='w-full px-4 py-2 text-white bg-black rounded-md rounded-b-none'>Pasivos circulantes</div>
         <div className='pl-8 pr-8 space-y-2'>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                     <div className='flex border border-black-500 max-w-[5rem] rounded-md box-border'>
                        <div className='flex-auto w-12 h-8 text-sm text-center box'></div>
                        <span className='px-2 pt-1.5 pb-1.5 text-gray-600 border-l max-h-8 border-x-black-500'>%</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                  </div>
               </div>
            </div>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                  </div>
               </div>
            </div>
            <div className='grid grid-cols-4 gap-12'>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end w-full h-5 col-span-1 gap-2 box'></div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                  </div>
               </div>
               <div className='grid items-center grid-cols-1 gap-2'>
                  <div className='flex items-center justify-end col-span-1 gap-2'>
                     <div className='flex-auto w-full text-sm text-center border rounded-md outline-none border-black-500 box h-9'></div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};
