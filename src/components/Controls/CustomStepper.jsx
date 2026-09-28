import { useGlobalContext } from '../../hooks';

/**
 * Permite mostrar un stepper en el footer apartir del context.
 *  @return
 */
export function CustomStepper() {
   const {
      stepper: { step, options, config },
   } = useGlobalContext();
   const classOptActives = config.bgOptionActive + ' ' + config.txtColorActive;
   const classOpt = config.bgOption + ' ' + config.txtOption;

   return (
      <div className={`flex flex-row items-center gap-4 overflow-auto w-full px-14 ${config.bgColorContainer}`}>
         {options?.map((opt, index) => {
            let lastOption = index + 1 === options.length;
            let optActive = opt.step === step;
            return (
               <div className={`flex flex-row ${lastOption ? 'flex-none' : 'flex-auto'} p-2`} key={opt.step}>
                  <div className={`flex items-center w-full p-1 gap-2 ${config.color}`}>
                     <div className='flex-none'>
                        <span
                           className={`rounded-full flex w-7 h-7 items-center justify-center text-sm ${
                              optActive ? classOptActives : classOpt
                           } `}>
                           {opt.step}
                        </span>
                     </div>
                     <p className='text-xs font-medium'>{opt.title}</p>
                     {lastOption === false && (
                        <div className='flex-auto w-max-24'>
                           <div className='w-full border-2 rounded '></div>
                        </div>
                     )}
                  </div>
               </div>
            );
         })}
      </div>
   );
}
