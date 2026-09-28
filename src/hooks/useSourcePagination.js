import { useCallback, useEffect } from 'react';
import { useGlobalContext } from './useGlobalContext';

export const useSourcePagination = () => {
   const {
      actions: { setPagination },
      pagination: { sourcePage, sourceTotalPages },
   } = useGlobalContext();

   useEffect(() => {
      return () => setPagination({ sourcePage: 0, sourceTotalPages: 0 });
   }, []);

   const setTotalPages = useCallback((totalPages = 0) => setPagination({ sourceTotalPages: totalPages }), []);
   const loadMore = useCallback(() => setPagination({ sourcePage: sourcePage + 1 }), [sourcePage]);

   return { sourcePage, sourceTotalPages, setTotalPages, loadMore, setPagination };
};
