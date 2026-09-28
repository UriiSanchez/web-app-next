import { useState } from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import Swal from 'sweetalert2';

import { CardGenericContainer } from '../../../../components/PCD/Controls/CardGenericContainer';
import { renderComponent } from '../../../utils/render';

jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

// El contenedor es controlado: entrega la lista completa y el padre la devuelve como item.
function Harness({ start = [], onSet, ...props }) {
   const [item, setItem] = useState(start);
   const handleSet = (next, attribute) => {
      onSet(next, attribute);
      setItem(next);
   };
   return <CardGenericContainer item={item} onSetData={handleSet} {...props} />;
}

function setup(props = {}) {
   const onSet = jest.fn();
   const utils = renderComponent(<Harness onSet={onSet} attribute='visitors' {...props} />, {
      userOptions: { advanceTimers: jest.advanceTimersByTime },
   });
   return { onSet, ...utils };
}

const addButton = () => screen.getByRole('button', { name: 'add_circle' });
const deleteButtons = () => screen.queryAllByTestId('btn-deleted');
const names = () => screen.getAllByLabelText('Nombre');

beforeEach(() => {
   jest.useFakeTimers();
});

describe('CardGenericContainer', () => {
   describe('rendering', () => {
      test('shows one empty card when there are no items', () => {
         setup();

         expect(names()).toHaveLength(1);
         expect(screen.getByRole('heading', { name: /Visitante\s*01/ })).toBeInTheDocument();
      });

      test('shows a card per item', () => {
         setup({ start: [{ visitorName: 'Ana' }, { visitorName: 'Luis' }] });

         expect(names().map((n) => n.value)).toEqual(['Ana', 'Luis']);
      });

      test.each([
         ['visitors', 'Visitante'],
         ['experience', 'Institución Financiera'],
         ['rate', 'Tasa'],
         ['typechange', 'Cruce'],
      ])('renders the card component of the %s section', (attribute, title) => {
         setup({ attribute });

         expect(screen.getByRole('heading', { name: new RegExp(title) })).toBeInTheDocument();
      });

      test('renders the creditors with the rules of the extra type', () => {
         setup({ attribute: 'creditors', extra: 'base' });

         expect(screen.getByText('Acreedor 1')).toBeInTheDocument();
      });

      test('passes the locked and saved state down to the cards', () => {
         setup({ disabled: true, isSave: true, start: [{ visitorName: 'Ana' }] });

         expect(names()[0]).toBeDisabled();
      });
   });

   describe('editing', () => {
      test('creates the first item with the typed value under the attribute of the section', async () => {
         const { onSet, user } = setup();

         await user.type(names()[0], 'A');

         expect(onSet).toHaveBeenCalledWith([{ visitorName: 'A' }], 'whoMadeTheVisit');
      });

      test('updates only the edited item', async () => {
         const { onSet, user } = setup({ start: [{ visitorName: 'Ana' }, { visitorName: 'Luis' }] });

         await user.type(names()[1], 's');

         expect(onSet).toHaveBeenLastCalledWith(
            [{ visitorName: 'Ana' }, { visitorName: 'Luiss' }],
            'whoMadeTheVisit'
         );
      });

      test('appends a new item when the card has no data yet', async () => {
         const { onSet, user } = setup({ start: [{ visitorName: 'Ana' }] });
         await user.click(addButton());

         await user.type(names()[1], 'L');

         expect(onSet).toHaveBeenLastCalledWith([{ visitorName: 'Ana' }, { visitorName: 'L' }], 'whoMadeTheVisit');
      });

      test('removes the money symbol and separators from the values', () => {
         const { onSet } = setup({ attribute: 'creditors', extra: 'base' });

         fireEvent.change(screen.getByLabelText('Monto autorizado'), { target: { value: '$1,500' } });

         expect(onSet).toHaveBeenCalledWith([{ lineAmount: '1500' }], 'creditors');
      });
   });

   describe('percentages', () => {
      const rates = [{ rateType: 'fixedRate', porcentage: '60' }, { rateType: 'variableRate', porcentage: '20' }];
      const percentageInput = (idx) => screen.getAllByPlaceholderText('0')[idx];

      test('accepts a percentage while the total does not exceed one hundred', () => {
         const { onSet } = setup({ attribute: 'rate', start: rates });

         fireEvent.change(percentageInput(1), { target: { value: '40' } });

         expect(onSet).toHaveBeenCalledWith(
            [rates[0], { rateType: 'variableRate', porcentage: '40' }],
            'calculatorType'
         );
         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('warns and keeps the data when the total exceeds one hundred', () => {
         const { onSet } = setup({ attribute: 'rate', start: rates });

         fireEvent.change(percentageInput(1), { target: { value: '50' } });

         expect(onSet).not.toHaveBeenCalled();
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({
               title: 'Recuerda que...',
               html: 'La sumatoria de tus tasas no puede sobrepasar el 100%',
            })
         );
      });

      test.each([['150'], ['1000']])('ignores the percentage "%s" out of range', (value) => {
         const { onSet } = setup({ attribute: 'rate', start: rates });

         fireEvent.change(percentageInput(1), { target: { value } });

         expect(onSet).not.toHaveBeenCalled();
         expect(Swal.fire).not.toHaveBeenCalled();
      });
   });

   describe('adding', () => {
      test('blocks adding a card while the last one is empty', () => {
         setup();

         expect(addButton()).toBeDisabled();
      });

      test('adds an empty card and scrolls to it', async () => {
         const { user } = setup({ start: [{ visitorName: 'Ana' }] });

         await user.click(addButton());

         expect(names()).toHaveLength(2);
         expect(window.HTMLElement.prototype.scrollTo).not.toHaveBeenCalled();
         act(() => jest.advanceTimersByTime(500));
         expect(window.HTMLElement.prototype.scrollTo).toHaveBeenCalledWith({ left: 0, behavior: 'smooth' });
      });

      test('keeps the add button only in the last card', async () => {
         const { user } = setup({ start: [{ visitorName: 'Ana' }] });

         await user.click(addButton());

         expect(screen.getAllByRole('button', { name: 'add_circle' })).toHaveLength(1);
      });

      test('stops adding cards at the limit of the section', () => {
         const start = Array.from({ length: 5 }, (_v, i) => ({ visitorName: `V${i}` }));
         setup({ start });

         expect(names()).toHaveLength(5);
         expect(screen.queryByRole('button', { name: 'add_circle' })).not.toBeInTheDocument();
      });
   });

   describe('deleting', () => {
      test('hides the delete button of the only empty card', () => {
         setup();

         expect(deleteButtons()).toHaveLength(0);
      });

      test('removes an item and notifies the remaining ones', async () => {
         const { onSet, user } = setup({ start: [{ visitorName: 'Ana' }, { visitorName: 'Luis' }] });

         await user.click(deleteButtons()[0]);

         expect(onSet).toHaveBeenCalledWith([{ visitorName: 'Luis' }], 'whoMadeTheVisit');
         expect(names().map((n) => n.value)).toEqual(['Luis']);
      });

      test('keeps an empty card when the only item is removed', async () => {
         const { onSet, user } = setup({ start: [{ visitorName: 'Ana' }] });

         await user.click(deleteButtons()[0]);

         expect(onSet).toHaveBeenCalledWith([], 'whoMadeTheVisit');
         expect(names()).toHaveLength(1);
         expect(names()[0]).toHaveValue('');
      });

      test('removes an empty extra card without notifying the parent', async () => {
         const { onSet, user } = setup({ start: [{ visitorName: 'Ana' }] });
         await user.click(addButton());

         await user.click(deleteButtons()[1]);

         expect(onSet).not.toHaveBeenCalled();
         expect(names()).toHaveLength(1);
      });

      test('hides the add and delete buttons when disabled', () => {
         setup({ disabled: true, start: [{ visitorName: 'Ana' }, { visitorName: 'Luis' }] });

         expect(deleteButtons()).toHaveLength(0);
         expect(screen.queryByRole('button', { name: 'add_circle' })).not.toBeInTheDocument();
      });
   });

   test('recounts the cards when the section changes', () => {
      const onSet = jest.fn();
      const { rerender } = renderComponent(
         <CardGenericContainer item={[{ visitorName: 'Ana' }, { visitorName: 'Luis' }]} onSetData={onSet} attribute='visitors' />
      );
      expect(names()).toHaveLength(2);

      rerender(<CardGenericContainer item={[{ rateType: 'fixedRate' }]} onSetData={onSet} attribute='rate' />);

      expect(screen.getAllByLabelText('Fuente de información')).toHaveLength(1);
   });
});
