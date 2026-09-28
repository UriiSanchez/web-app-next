import { getCurrentHour } from './helpDates';

export const getWelcomeMessage = () => {
   let hours = getCurrentHour();
   if (hours >= 6 && hours < 12) return 'Buenos días, ';
   else if (hours >= 12 && hours < 20) return 'Buenas tardes, ';
   else if (hours >= 20 || hours < 6) return 'Buenas noches, ';
   else return 'Revisar esto, que al parecer no esta funcionando, ';
};
