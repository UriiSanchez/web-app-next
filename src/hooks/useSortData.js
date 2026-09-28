import { useMemo, useState } from 'react';

export const useSortData = (data = []) => {
   const [sortedBy, setSortedBy] = useState({ column: null, direction: null });

   const sortData = useMemo(() => {
      const { column, direction } = sortedBy;
      if (!direction) return data;

      return [...data].sort((a, b) => {
         if (a[column] < b[column]) return direction === 'asc' ? -1 : 1;
         if (a[column] > b[column]) return direction === 'desc' ? -1 : 1;

         return 0;
      });
   }, [data, sortedBy]);

   const onHandleSort = (column) => {
      const mapOptionSort = {
         asc: 'desc',
         desc: null,
         null: 'asc',
      };

      let currentDirection = sortedBy.column === column ? sortedBy.direction : null;
      setSortedBy({ column, direction: mapOptionSort[currentDirection] });
   };

   return {
      sortData,
      sortedBy,
      onHandleSort,
   };
};
