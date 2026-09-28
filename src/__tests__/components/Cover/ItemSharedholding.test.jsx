import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import Swal from 'sweetalert2';

import { ItemSharedholding } from '../../../components/Cover/ItemSharedholding';
import { renderComponent } from '../../utils/render';

jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const initialData = {
   totalDirect: 60,
   totalIndirect: 0,
   shareholding: [
      { id: 1, name: 'Socio Uno', rfc: 'AAA010101AAA', directParticipation: 60, indirectParticipation: null },
      { id: 2, name: 'Socio Dos', rfc: '', directParticipation: null, indirectParticipation: null },
      { id: 3, name: 'Otros', rfc: null, directParticipation: null, indirectParticipation: 10 },
   ],
};

// El componente es controlado: notifica el objeto completo y el padre lo devuelve como data.
function Harness({ onSet, start = initialData }) {
   const [data, setData] = useState(start);
   const fnSet = (...args) => {
      onSet(...args);
      setData(args[2]);
   };
   return <ItemSharedholding data={data} fnSet={fnSet} />;
}

const setup = (start) => {
   const onSet = jest.fn();
   return { onSet, ...renderComponent(<Harness onSet={onSet} start={start} />) };
};

const field = (name, id) => document.getElementById(`${name}-${id}`);
// user-event no informa keyCode para los dígitos y onKeyNumbers bloquearía el teclado; se simula el cambio.
const setNumber = (el, value) => fireEvent.change(el, { target: { value } });
const lastData = (onSet) => onSet.mock.calls.at(-1)[2];

describe('ItemSharedholding', () => {
   test('lists every shareholder except Otros, which has its own row', () => {
      setup();

      expect(field('name', 1)).toHaveValue('Socio Uno');
      expect(field('rfc', 1)).toHaveValue('AAA010101AAA');
      expect(field('directParticipation', 1)).toHaveValue(60);
      expect(field('name', 2)).toHaveValue('Socio Dos');
      expect(field('name', 3)).not.toBeInTheDocument();
      expect(field('indirectParticipation', 3)).toHaveValue(10);
      expect(screen.getByText('Otros')).toBeInTheDocument();
   });

   test('shows the totals and warns when the direct total is not 100%', () => {
      setup();

      const total = screen.getByTitle('Total Directo: 60%');
      expect(total).toHaveTextContent('60%');
      // JSDOM no aplica estilos; la alerta se expresa mediante clases de color.
      expect(total).toHaveClass('text-red-600');
      expect(screen.getByTitle('Total Directo: 0%')).toHaveTextContent('0%');
   });

   test('does not warn when the direct total is exactly 100%', () => {
      setup({ ...initialData, totalDirect: 100 });

      expect(screen.getByTitle('Total Directo: 100%')).not.toHaveClass('text-red-600');
   });

   test('renders the Otros row with empty fields when the data has no Otros', () => {
      renderComponent(<ItemSharedholding data={{ shareholding: [], totalDirect: 0, totalIndirect: 0 }} fnSet={jest.fn()} />);

      expect(document.getElementById('directParticipation-null')).toHaveValue(null);
      expect(screen.getByText('Otros')).toBeInTheDocument();
   });

   test('reports name and RFC edits inside a copy of the data', async () => {
      const { onSet, user } = setup();

      await user.type(field('name', 2), 'X');
      await user.type(field('rfc', 2), 'RFC1');

      expect(onSet).toHaveBeenCalledWith('infoFinancialResponse', '-', expect.any(Object), 'object');
      const shareholder = lastData(onSet).shareholding.find((sh) => sh.id === 2);
      expect(shareholder).toMatchObject({ name: 'Socio DosX', rfc: 'RFC1' });
      expect(initialData.shareholding[1].name).toBe('Socio Dos');
   });

   test('recalculates the direct total when a direct participation changes', () => {
      const { onSet } = setup();

      setNumber(field('directParticipation', 2), '25');

      expect(lastData(onSet).totalDirect).toBe(85);
      expect(screen.getByTitle('Total Directo: 85%')).toBeInTheDocument();
   });

   test('recalculates the indirect total including the Otros row', () => {
      const { onSet } = setup();

      setNumber(field('indirectParticipation', 1), '5');

      expect(lastData(onSet).totalIndirect).toBe(15);
   });

   test('warns and ignores a change that makes the total exceed 100%', () => {
      const { onSet } = setup();

      setNumber(field('directParticipation', 2), '5');
      setNumber(field('directParticipation', 2), '50');

      // El 5 suma 65 y se acepta; el 50 suma 110 y se rechaza.
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: 'Recuerda que...' }));
      expect(onSet).toHaveBeenCalledTimes(1);
      expect(lastData(onSet).totalDirect).toBe(65);
      expect(field('directParticipation', 2)).toHaveValue(5);
   });

   test.each(['101', '1234', '-5'])('ignores the invalid percentage %p', (value) => {
      const { onSet } = setup();

      fireEvent.change(field('directParticipation', 2), { target: { value } });

      expect(onSet).not.toHaveBeenCalled();
      expect(Swal.fire).not.toHaveBeenCalled();
   });
});
