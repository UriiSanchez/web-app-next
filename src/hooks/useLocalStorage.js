import { useCallback, useState } from 'react';

export const useLocalStorage = (key, defaultValue) => {
   const [storedValue, setStoredValue] = useState(() => {
      try {
         const value = localStorage.getItem(key);
         if (value) {
            return JSON.parse(value);
         } else {
            let saveVale = defaultValue ? JSON.stringify(defaultValue) : null;
            localStorage.setItem(key, saveVale);
            return defaultValue ?? null;
         }
      } catch (error) {
         return defaultValue ?? null;
      }
   });

   const setValue = useCallback((newValue) => {
      try {
         localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
         console.log('useLocalStore: ', error);
      }
      setStoredValue(newValue);
   }, []);

   const removeValue = useCallback(() => {
      localStorage.removeItem(key);
      setStoredValue(null);
   });

   return [storedValue, setValue, removeValue];
};
