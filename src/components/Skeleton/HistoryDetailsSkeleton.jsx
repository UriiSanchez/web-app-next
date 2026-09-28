export const HistoryDetailsSkeleton = () => (
   <div className='flex flex-col gap-4 px-8 py-2 text-sm'>
      <div className='grid h-48 grid-cols-3 py-2 text-left border rounded px-11 border-gray box'></div>
      <div className='flex flex-col justify-center w-auto h-auto'>
         <div className='flex flex-row items-center w-full h-10 px-4 text-white bg-black rounded-t'>
            <p>Solicitantes de grupo económico</p>
         </div>
         <div className='flex flex-col w-full border rounded-b border-gray box h-36'></div>
      </div>
   </div>
);
