import _ from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { AddButton, DeleteButton } from '../../Controls';
import { CardRateItem } from '../Controls/Cards/CardRateItem';
import { CardExchangeItem } from '../Controls/Cards/CardExchangeItem';
import { CardExperienceItem } from '../Controls/Cards/CardExperienceItem';
import { CardVisitorsItem } from '../Controls/Cards/CardVisitorsItem';
import { CardCreditorItem } from '../Controls/Cards/CardCreditorItem';
import { initDerivatives, sumGeneric, sweetNormal } from '../../../helpers';

export function CardGenericContainer({ item = [], onSetData, attribute, extra = '', disabled, isSave }) {
   const [numItems, setNumItems] = useState(1);
   const divRef = useRef(null);
   const cardSettings = useMemo(() => {
      return initDerivatives.cards[attribute] || {};
   }, [attribute]);

   useEffect(() => {
      setNumItems(item.length || 1);
   }, [attribute]);

   const onAddItem = () => {
      setNumItems(numItems + 1);
      const divElem = divRef.current;
      setTimeout(() => {
         divElem.scrollTo({
            left: divElem.scrollWidth - divElem.clientWidth,
            behavior: 'smooth',
         });
      }, 500);
   };

   const onDeleteItem = (idx) => {
      if (!_.isEmpty(item[idx])) {
         let newData = item.filter((_, index) => index != idx);
         onSetData(newData, cardSettings?.attribute);
      }

      let isOne = item.length === 1 && idx === 0;
      setNumItems(isOne ? 1 : numItems - 1);
   };

   const onChangeVirtual = (event, idx) => {
      const { name, type, value } = event.target;
      let setName = name.split('-')[0];
      let newData = [];

      if (type == 'number') {
         const regex = /^.{0,3}$/;
         if (!regex.test(value) || value > 100) {
            return;
         }
      }

      let parseValue = value.includes('$') ? value.replace(/[$,]/g, '') : value;

      if (_.isEmpty(item)) {
         newData = [{ [setName]: parseValue }];
      } else if (_.isUndefined(item?.[idx])) {
         newData = [...item, { [setName]: parseValue }];
      } else {
         newData = item?.map((it, index) => (index === idx ? { ...it, [setName]: parseValue } : it));
      }

      if (setName.includes('porcentage')) {
         let sum = sumGeneric(newData, 'porcentage');
         if (sum > 100) {
            sweetNormal({
               title: 'Recuerda que...',
               txt: 'La sumatoria de tus tasas no puede sobrepasar el 100%',
            });
            return;
         }
      }

      onSetData(newData, cardSettings?.attribute);
   };

   const renderingComponent = (idx, uuid) => {
      let defaultProps = { idx, data: item, fnVirtual: onChangeVirtual, extra, isDisabled: disabled, isSave };

      const component = {
         CardRateItem: CardRateItem,
         CardExchangeItem: CardExchangeItem,
         CardExperienceItem: CardExperienceItem,
         CardVisitorsItem: CardVisitorsItem,
         CardCreditorItem: CardCreditorItem,
      };

      const Component = component[cardSettings?.component];
      return Component ? (
         <Component key={cardSettings?.attribute + '-' + uuid} {...defaultProps} />
      ) : (
         <div>Sin componente</div>
      );
   };

   return (
      <div className={cardSettings?.sxGeneral?.container || 'flex flex-row gap-4 container-overflow'} ref={divRef}>
         {[...Array(numItems)].map((_numI, idx) => {
            let uuid = cardSettings.index[idx];
            return (
               <div
                  key={attribute + '-' + uuid}
                  className={cardSettings?.sxCard || 'box-border relative flex-none w-80'}>
                  {!disabled && (numItems > 1 || item[idx]) && (
                     <DeleteButton
                        key={'deleted-' + uuid}
                        fn={() => onDeleteItem(idx)}
                        sx={cardSettings?.sxGeneral?.delete}
                     />
                  )}
                  {renderingComponent(idx, uuid)}
                  {!disabled && idx === numItems - 1 && numItems < cardSettings?.limit && (
                     <AddButton
                        key={'add-' + uuid}
                        fn={onAddItem}
                        isDisabled={_.isEmpty(item[idx])}
                        sx={cardSettings?.sxGeneral?.add}
                     />
                  )}
               </div>
            );
         })}
      </div>
   );
}
