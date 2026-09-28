export const TooltipControl = ({ text, sx }) => {
   return (
      <div
         className={`absolute z-50 hidden group-hover:block fadeIn duration-300 transition-all ease-in-out ${
            sx || ''
         }`}>
         {text}
      </div>
   );
};
