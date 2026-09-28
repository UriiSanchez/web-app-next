import dayjs from 'dayjs';

const today = dayjs();

export const getCurrentYear = () => {
   return today.year();
};

export const getCurrentHour = () => {
   return today.hour();
};

export const getCurrentDate = (format = 'DD-MM-YYYY') => today.format(format);

export const dateToString = (date, valueDefault = '-') => {
   return date ? dayjs(date).format('DD-MM-YYYY') : valueDefault;
};

export const datetimeToString = (date) => {
   return date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss A') : '-';
};
