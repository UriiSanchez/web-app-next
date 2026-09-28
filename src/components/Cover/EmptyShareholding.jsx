export function EmptySharedholding() {
   let itemShow = [{ idItem: 'Hold-1' }, { idItem: 'Hold-2' }, { idItem: 'Hold-3' }, { idItem: 'Hold-4' }];
   return (
      <div className='w-7/12 border rounded-md overflow-clip border-gray'>
         <div className='flex items-center h-8 px-4 text-white bg-black '>Tenencia accionario</div>
         <div className='flex flex-col gap-2 p-2 place-items-center '>
            <div className='grid w-full grid-cols-5 text-center'>
               <div className='col-span-2'>Accionistas </div>
               <div className='col-span-1'>RFC </div>
               <div className='col-span-1'>% Part. Directa </div>
               <div className='col-span-1'>% Part. Indirecta</div>
            </div>
            {itemShow.map((item, idx) => {
               return (
                  <div key={item.idItem} className='grid w-full grid-cols-5 gap-2'>
                     <div className='flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-2'>
                        {idx == 0 ? 'N/A' : ''}
                     </div>
                     <div className='flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'>
                        {idx == 0 ? 'N/A' : ''}
                     </div>
                     <div className='flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'>
                        {idx == 0 ? 'N/A' : ''}
                     </div>
                     <div className='flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'>
                        {idx == 0 ? 'N/A' : ''}
                     </div>
                  </div>
               );
            })}
            <div className='grid w-full grid-cols-5 gap-2'>
               <div className='flex items-center border-gray bg-[#bebebe33] border h-8 rounded col-span-2 px-2'>
                  Otros
               </div>
               <div className='flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'>
                  -
               </div>
               <div className='flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
               <div className='flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
            </div>
            <div className='grid w-full grid-cols-5 gap-2'>
               <div className='flex items-center justify-end border-gray bg-[#bebebe33] border h-8 rounded col-span-3 pr-6'>
                  Total
               </div>
               <div className='flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
               <div className='flex items-center justify-center border-gray bg-[#bebebe33] border h-8 rounded col-span-1'></div>
            </div>
         </div>
      </div>
   );
}
