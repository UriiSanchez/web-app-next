'use client';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { FilterBranchOffice } from './FilterBranchOffice';
import { FilterSearchByName } from './FilterSearchByName';
import { FilterRangeDates } from './FilterRangeDates';
import { FilterTypeProcedure } from './FilterTypeProcedure';
import { useDebounce } from '../../hooks/useDebounce';
import { useGlobalContext } from '../../hooks';
import { dateToString, queryForUserInHistory, removeEmptyAttributes } from '../../helpers';
import { constProfiles as Profile } from '../../helpers/config';

export const FilterContainer = ({ onApplyFilters }) => {
   const { user } = useGlobalContext();
   const [localFilters, setFilters] = useState({
      searchByName: '',
      byApplicationTypes: [],
      byDateRange: [
         {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
         },
      ],
      byBranches: [],
   });

   const debounceFilters = useDebounce(localFilters, 1500);

   useEffect(() => {
      if (!_.isEmpty(user)) {
         let onlyFillFilters = setOnlyUsesFilters(debounceFilters);
         if ([Profile.EMG, Profile.ADC].includes(user?.idProfile)) {
            let options = queryForUserInHistory[user?.idProfile]();
            onlyFillFilters[options.key] = user?.userAD;
         }
         onApplyFilters(onlyFillFilters);
      }
   }, [debounceFilters, user?.userAD, onApplyFilters]);

   const onChangeFilters = (type, value) => setFilters((prevState) => ({ ...prevState, [type]: value }));

   const setOnlyUsesFilters = (filters) => {
      let newObject = removeEmptyAttributes(structuredClone(filters));
      let setOnlyAttributes = {};
      for (const [key, value] of Object.entries(newObject)) {
         if (key === 'byDateRange') {
            let start = dateToString(value[0].startDate, '');
            let end = dateToString(value[0].endDate, '');
            setOnlyAttributes[key] = `${start}, ${end}`;
         } else {
            let newValue = _.isArray(value) ? value.join(',') : value;
            setOnlyAttributes[key] = newValue;
         }
      }
      return setOnlyAttributes;
   };

   return (
      <>
         <FilterSearchByName id="searchByName" value={localFilters.searchByName} onSetValue={onChangeFilters} sxForm="w-2/6 2xl:mr-3"/>
         <FilterTypeProcedure data={localFilters.byApplicationTypes} onSet={onChangeFilters} />
         <FilterRangeDates data={localFilters.byDateRange} onSet={onChangeFilters} />
         <FilterBranchOffice data={localFilters.byBranches} onSet={onChangeFilters} />
      </>
   );
};

FilterContainer.propTypes = {
   onApplyFilters: PropTypes.func.isRequired,
};
