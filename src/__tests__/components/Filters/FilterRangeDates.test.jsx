import { screen } from '@testing-library/react';

import { FilterRangeDates } from '../../../components/Filters/FilterRangeDates';
import { renderComponent } from '../../utils/render';

const today = new Date();
const data = [{ startDate: today, endDate: today, key: 'selection' }];

const renderFilter = (onSet = jest.fn()) => ({
   onSet,
   ...renderComponent(<FilterRangeDates data={data} onSet={onSet} />),
});

describe('FilterRangeDates', () => {
   test('keeps the calendar hidden until the button is clicked', async () => {
      const { user, container } = renderFilter();
      expect(container.querySelector('.rdrCalendarWrapper')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Periodo/ }));

      expect(container.querySelector('.rdrCalendarWrapper')).toBeInTheDocument();
      expect(container.querySelectorAll('.rdrMonth')).toHaveLength(2);
   });

   // react-date-range no expone roles ni etiquetas por día: se usan sus clases.
   test('reports the selected range under byDateRange', async () => {
      const { user, onSet, container } = renderFilter();
      await user.click(screen.getByRole('button', { name: /Periodo/ }));

      const day = container.querySelector('.rdrDay:not(.rdrDayPassive):not(.rdrDayDisabled)');
      await user.click(day);

      expect(onSet).toHaveBeenCalledWith(
         'byDateRange',
         expect.arrayContaining([expect.objectContaining({ key: 'selection' })])
      );
   });

   test('resets the range to today with the clear button', async () => {
      const { user, onSet } = renderFilter();
      await user.click(screen.getByRole('button', { name: /Periodo/ }));

      await user.click(screen.getByTitle('Limpiar filtro de fechas'));

      expect(onSet).toHaveBeenCalledTimes(1);
      const [type, ranges] = onSet.mock.calls[0];
      expect(type).toBe('byDateRange');
      expect(ranges).toHaveLength(1);
      expect(ranges[0].key).toBe('selection');
      expect(ranges[0].startDate.toDateString()).toBe(today.toDateString());
      expect(ranges[0].endDate.toDateString()).toBe(today.toDateString());
   });

   test('closes the calendar when clicking outside', async () => {
      const { user, container } = renderFilter();
      await user.click(screen.getByRole('button', { name: /Periodo/ }));

      await user.click(document.body);

      expect(container.querySelector('.rdrCalendarWrapper')).not.toBeInTheDocument();
   });
});
