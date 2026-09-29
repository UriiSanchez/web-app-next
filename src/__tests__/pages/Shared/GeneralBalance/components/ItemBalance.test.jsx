import { screen } from '@testing-library/react';

import ItemBalance from '../../../../../pages/Shared/GeneralBalance/components/ItemBalance';
import { tooltipGB } from '../../../../../helpers';
import { renderComponent } from '../../../../utils/render';

const concept = (idItem, idItemChild, description, extra = {}) => ({
   idItem,
   idItemChild,
   description,
   value: '',
   percentage: 0,
   automatic: false,
   toolTip: false,
   ...extra,
});

const baseConcepts = [
   concept(26, 30, 'Inventarios', { value: '1000.5', percentage: 10 }),
   concept(26, 999, 'Concepto con ayuda', { toolTip: true }),
   concept(83, 85, 'Capital social', { value: '500', percentage: 5, toolTip: true, automatic: true }),
   concept(83, 97, 'Pasivo financiero', { value: '250.75' }),
   concept(83, 100, 'Pasivo buró', { value: '300' }),
   concept(83, 101, 'Diferencia', { value: '10' }),
   concept(117, 118, 'Otro'),
];

// overrides: { [idItemChild]: { ...campos del concepto } }
const buildPeriod = (year, overrides = {}) => ({
   year,
   periodType: 'ANNUAL',
   concepts: baseConcepts.map((base) => ({ ...base, ...overrides[base.idItemChild] })),
});

const renderBalance = (props = {}) => {
   const fnSet = jest.fn();
   const info = { periods: [buildPeriod(2023), buildPeriod(2024)] };
   return { fnSet, ...renderComponent(<ItemBalance info={info} fnSet={fnSet} {...props} />) };
};

const valueInput = (container, period, idItemChild) => container.querySelector(`#period${period}-value-${idItemChild}`);

describe('ItemBalance', () => {
   describe('layout', () => {
      test('renders the section titles and subtitles', () => {
         renderBalance();

         expect(screen.getByText('Activos')).toBeInTheDocument();
         expect(screen.getByText('Activos circulantes')).toBeInTheDocument();
         expect(screen.getByText('Pasivos')).toBeInTheDocument();
         expect(screen.getByText('Pasivos largo plazo')).toBeInTheDocument();
         expect(screen.getByText('Capital contable')).toBeInTheDocument();
      });

      test('renders each concept description once, from the first period', () => {
         renderBalance();

         baseConcepts.forEach(({ description }) => {
            expect(screen.getAllByText(description)).toHaveLength(1);
         });
      });

      test('renders only the section headings when there are no periods', () => {
         const { container } = renderBalance({ info: { periods: [] } });

         expect(screen.getByText('Activos')).toBeInTheDocument();
         expect(container.querySelectorAll('input')).toHaveLength(0);
         expect(screen.queryByText('Inventarios')).not.toBeInTheDocument();
      });

      test('renders only the section headings without info', () => {
         const { container } = renderBalance({ info: undefined });

         expect(screen.getByText('Capital contable')).toBeInTheDocument();
         expect(container.querySelectorAll('input')).toHaveLength(0);
      });
   });

   describe('editable values', () => {
      test('renders one value input per period and concept', () => {
         const { container } = renderBalance();

         expect(valueInput(container, 0, 30)).toHaveValue('1,000');
         expect(valueInput(container, 1, 30)).toHaveValue('1,000');
         expect(valueInput(container, 1, 85)).toHaveValue('500');
      });

      test('reports the typed value with the period index and the concept id', async () => {
         const { container, fnSet, user } = renderBalance();

         await user.type(valueInput(container, 0, 118), '7');

         expect(fnSet).toHaveBeenLastCalledWith(7, 0, 118);
      });

      test('reports null and the period of the edited input when it is cleared', async () => {
         const { container, fnSet, user } = renderBalance();

         await user.clear(valueInput(container, 1, 30));

         expect(fnSet).toHaveBeenCalledWith(null, 1, 30);
      });

      test('shows decimals only for the financial liability concept', () => {
         const { container } = renderBalance();

         expect(valueInput(container, 0, 97)).toHaveValue('250.75');
         expect(valueInput(container, 0, 30)).toHaveValue('1,000');
      });

      test('shows decimals in every concept when the balance is disabled', () => {
         const { container } = renderBalance({ disabled: true });

         expect(valueInput(container, 0, 30)).toHaveValue('1,000.5');
      });

      test('disables every input when the balance is disabled', () => {
         const { container } = renderBalance({ disabled: true });

         container.querySelectorAll('input').forEach((input) => expect(input).toBeDisabled());
      });

      test('disables only the automatic concepts when the balance is enabled', () => {
         const { container } = renderBalance();

         expect(valueInput(container, 0, 85)).toBeDisabled();
         expect(valueInput(container, 0, 30)).toBeEnabled();
      });
   });

   describe('percentages', () => {
      test('shows a read-only percentage next to each value', () => {
         const { container } = renderBalance();
         const percentage = container.querySelector('#period0-percentage-30');

         expect(percentage).toBeDisabled();
         expect(percentage).toHaveValue('10.00');
         expect(container.querySelector('#period0-percentage-85')).toHaveValue('5.00');
      });

      test('does not show percentages in the last section', () => {
         const { container } = renderBalance();

         expect(container.querySelector('#period0-percentage-118')).not.toBeInTheDocument();
         expect(valueInput(container, 0, 118)).toBeInTheDocument();
      });
   });

   describe('tooltips', () => {
      test('renders a tooltip for each concept that asks for one, with the message of its id', () => {
         const { container } = renderBalance();
         const messages = [...container.querySelectorAll('pre')].map((pre) => pre.textContent);

         expect(screen.getAllByRole('button', { name: 'info' })).toHaveLength(2);
         expect(messages).toEqual(['', tooltipGB[85]]);
      });

      test('does not render tooltips for concepts that do not ask for one', () => {
         const { container } = renderBalance({
            info: { periods: [buildPeriod(2023, { 999: { toolTip: false }, 85: { toolTip: false } })] },
         });

         expect(container.querySelectorAll('pre')).toHaveLength(0);
      });
   });

   describe('credit bureau liability and difference', () => {
      test('shows the bureau liability and the difference as formatted read-only text', () => {
         const { container } = renderBalance({
            info: {
               periods: [
                  buildPeriod(2023, { 100: { value: '1500.5' }, 101: { value: '20' } }),
                  buildPeriod(2024),
               ],
            },
         });

         expect(screen.getByText('1,500.5')).toBeInTheDocument();
         expect(screen.getByText('20')).toBeInTheDocument();
         expect(valueInput(container, 0, 100)).not.toBeInTheDocument();
         expect(valueInput(container, 0, 101)).not.toBeInTheDocument();
      });

      test('shows "null" for an empty bureau liability and "N/A" for an empty difference', () => {
         renderBalance({
            info: { periods: [buildPeriod(2023, { 100: { value: '' }, 101: { value: '' } })] },
         });

         expect(screen.getByText('null')).toBeInTheDocument();
         expect(screen.getByText('N/A')).toBeInTheDocument();
      });

      test('marks the difference in red only when it exceeds 5% of the financial liability of its period', () => {
         renderBalance({
            info: {
               periods: [
                  buildPeriod(2023, { 97: { value: '100' }, 101: { value: '10' } }),
                  buildPeriod(2024, { 97: { value: '100' }, 101: { value: '3' } }),
               ],
            },
         });

         expect(screen.getByText('10')).toHaveClass('text-red-500');
         expect(screen.getByText('3')).toHaveClass('text-black');
         expect(screen.getByText('3')).not.toHaveClass('text-red-500');
      });

      test('does not mark the difference in red when the financial liability is missing', () => {
         const withoutFinancialLiability = {
            year: 2023,
            periodType: 'ANNUAL',
            concepts: baseConcepts.filter(({ idItemChild }) => idItemChild !== 97),
         };
         renderBalance({ info: { periods: [withoutFinancialLiability] } });

         expect(screen.getByText('10')).toHaveClass('text-black');
      });
   });
});
