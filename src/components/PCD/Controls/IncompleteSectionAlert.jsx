import Image from 'next/image';

import ico_info from '../../../../public/icons/ico_info.svg';

export const IncompleteSectionAlert = () => {
   return (
      <div className='flex flex-auto m-5'>
         <div className='flex flex-row w-full p-2 bg-[#F6B03E] bg-opacity-20 rounded-lg'>
            <Image className='w-5 ml-2' src={ico_info} alt='Información del completado de los campos de la sección' />
            <p className='pl-2 '>
               Tienes <b>campos obligatorios</b> por responder en esta sección
            </p>
         </div>
      </div>
   );
};
