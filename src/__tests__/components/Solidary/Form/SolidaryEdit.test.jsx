import { useState } from 'react';
import { screen, within } from '@testing-library/react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

import { SolidaryEdit } from '../../../../components/Solidary/Form/SolidaryEdit';
import { getClientsById } from '../../../../services';
import { renderComponent } from '../../../utils/render';
import { createActions, createContextWrapper } from '../../../utils/context';
import { createRouter } from '../../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
// La validación de montos es lógica pura del módulo; solo se sustituyen las búsquedas de red.
jest.mock('../../../../services', () => ({
   getClientsById: jest.fn(),
   getClientsByName: jest.fn(),
   validateAmount: (...args) => jest.requireActual('../../../../services/servSolidary').validateAmount(...args),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const applicant = { idCatTypePerson: 1, idClient: 1, fullName: 'Empresa Alfa' };
const existing = {
   idCatTypePerson: 2,
   idClient: 2,
   idRequest: 7,
   fullName: 'Carlos Vega',
   maritalStatus: 'Casado',
   mail: 'carlos@correo.com',
   personType: 'PF',
};
const baseRequest = {
   idRequest: 7,
   kindProcedure: 'Nuevo Tramite',
   requestAmount: '',
   oldAmount: 1000,
   activeCredit: false,
   relatedPersonResponseList: [applicant, existing],
};
const newClient = {
   status: 200,
   data: { idClient: 9, businessName: 'Nueva SA', email: 'nueva@correo.com', personType: 'PM' },
};

// El componente es controlado: notifica la solicitud completa y el padre la devuelve como request.
function Harness({ onSet, start, creditLimit }) {
   const [request, setRequest] = useState(start);
   const handleSet = (id, next) => {
      onSet(id, next);
      setRequest(next);
   };
   return <SolidaryEdit request={request} onSet={handleSet} creditLimit={creditLimit} isNotEditable={false} />;
}

function setup({ request = {}, creditLimit = 5000000 } = {}) {
   useRouter.mockReturnValue(createRouter());
   const onSet = jest.fn();
   const wrapper = createContextWrapper({
      user: { userAD: 'analista01' },
      actions: createActions({ setPagination: jest.fn(), setExpandedRows: jest.fn() }),
      expandedRows: [],
      pagination: { currentPage: 1, totalPages: 1, sourcePage: 0, sourceTotalPages: 0 },
   });
   const utils = renderComponent(<Harness onSet={onSet} start={{ ...baseRequest, ...request }} creditLimit={creditLimit} />, {
      wrapper,
   });
   return { onSet, ...utils };
}

const last = (onSet) => onSet.mock.calls.at(-1)[1];
const amountInput = () => screen.getByLabelText(/Monto de línea solicitado/);
const procedureSelect = () => screen.getByLabelText(/Tipo de trámite/);
const searchByNumber = async (user, slot, number) => {
   await user.click(screen.getAllByText('arrow_downward')[slot]);
   await user.click(screen.getAllByRole('button', { name: 'Número de persona' })[slot]);
   await user.type(screen.getAllByRole('searchbox')[slot], `${number}{Enter}`);
};

// Se precarga el módulo dinámico para que las pruebas no dependan del orden de ejecución.
beforeAll(() => import('../../../../components/Solidary/Form/ObligatedItemDetails'));

describe('SolidaryEdit', () => {
   test('shows the applicant name and the first obligor', async () => {
      setup();

      expect(screen.getByRole('heading', { name: 'Empresa Alfa' })).toBeInTheDocument();
      // Los detalles del obligado se cargan de forma dinámica.
      expect(await screen.findByText('Obligado Solidario 01')).toBeInTheDocument();
      expect(screen.getByText('Carlos Vega')).toBeInTheDocument();
   });

   test('offers only a new procedure for a client without an active credit', () => {
      setup();

      expect(within(procedureSelect()).getAllByRole('option').map((o) => o.textContent)).toEqual([
         '- Seleccionar -',
         'Nuevo trámite',
      ]);
   });

   test('offers the modification procedures for a client with an active credit', () => {
      setup({ request: { activeCredit: true, kindProcedure: '' } });

      expect(within(procedureSelect()).getAllByRole('option').map((o) => o.textContent)).toEqual([
         '- Seleccionar -',
         'Recalificación',
         'Incremento',
         'Decremento',
         'Modificación',
      ]);
   });

   test.each(['Recalificacion', 'Modificacion'])('locks the amount for %s', (kindProcedure) => {
      setup({ request: { activeCredit: true, kindProcedure } });

      expect(amountInput()).toBeDisabled();
   });

   describe('requested amount', () => {
      test('stores the typed amount without sign or separators together with its validation', async () => {
         const { onSet, user } = setup();

         await user.type(amountInput(), '150000');

         expect(onSet).toHaveBeenLastCalledWith(
            7,
            expect.objectContaining({ requestAmount: '150000', validate: { valid: true, procedure: '' } })
         );
         expect(amountInput()).toHaveValue('$150,000');
         expect(screen.queryByText('Monto excedido')).not.toBeInTheDocument();
      });

      test('warns when the amount reaches the credit limit', async () => {
         const { user } = setup({ creditLimit: 1000 });

         await user.type(amountInput(), '5000');

         expect(screen.getByText('Monto excedido')).toBeInTheDocument();
      });

      test('asks for a greater amount when an increase does not exceed the previous one', async () => {
         const { user } = setup({ request: { activeCredit: true, kindProcedure: 'Incremento' } });

         await user.type(amountInput(), '500');

         expect(screen.getByText('El monto debe ser mayor')).toBeInTheDocument();
      });

      test('asks for a lower amount when a decrease does not go below the previous one', async () => {
         const { user } = setup({ request: { activeCredit: true, kindProcedure: 'Decremento' } });

         await user.type(amountInput(), '2000');

         expect(screen.getByText('El monto debe ser menor')).toBeInTheDocument();
      });

      test('accepts an increase above the previous amount', async () => {
         const { user } = setup({ request: { activeCredit: true, kindProcedure: 'Incremento' } });

         await user.type(amountInput(), '3000');

         expect(screen.queryByText('El monto debe ser mayor')).not.toBeInTheDocument();
      });
   });

   describe('procedure', () => {
      test('stores the selected procedure with its validation', async () => {
         const { onSet, user } = setup({ request: { activeCredit: true, kindProcedure: '', requestAmount: '4000' } });

         await user.selectOptions(procedureSelect(), 'Incremento');

         expect(last(onSet).kindProcedure).toBe('Incremento');
         expect(last(onSet).validate).toEqual({ valid: true, procedure: 'Incremento' });
      });

      test('restores the previous amount when the procedure changes on an active credit', async () => {
         const { onSet, user } = setup({ request: { activeCredit: true, kindProcedure: '', requestAmount: '4000' } });

         await user.selectOptions(procedureSelect(), 'Recalificacion');

         expect(last(onSet)).toMatchObject({ kindProcedure: 'Recalificacion', requestAmount: 1000 });
      });
   });

   describe('obligors', () => {
      test('ignores the deleted obligors', () => {
         setup({ request: { relatedPersonResponseList: [applicant, { ...existing, deleted: true }] } });

         expect(screen.queryByText('Carlos Vega')).not.toBeInTheDocument();
         expect(screen.getByText('Nombre')).toBeInTheDocument();
      });

      test('adds an empty obligor slot', async () => {
         const { user } = setup();

         await user.click(screen.getByRole('button', { name: 'Agregar obligado solidario +' }));

         expect(screen.getByText('Obligado Solidario 02')).toBeInTheDocument();
         expect(screen.getAllByRole('searchbox')).toHaveLength(2);
      });

      test('marks a saved obligor as deleted', async () => {
         const { onSet, user } = setup();

         await user.click(screen.getByTitle('Haz click para eliminar'));

         expect(last(onSet).relatedPersonResponseList).toEqual([applicant, { ...existing, deleted: true }]);
         expect(screen.queryByText('Carlos Vega')).not.toBeInTheDocument();
         expect(screen.getByText('Nombre')).toBeInTheDocument();
      });

      test('removes an obligor that was added in this session', async () => {
         const draft = { ...existing, newObli: true };
         const { onSet, user } = setup({ request: { relatedPersonResponseList: [applicant, draft] } });

         await user.click(screen.getByTitle('Haz click para eliminar'));

         expect(last(onSet).relatedPersonResponseList).toEqual([applicant]);
      });

      test('adds the found client as a new obligor', async () => {
         getClientsById.mockResolvedValue(newClient);
         const { onSet, user } = setup({ request: { relatedPersonResponseList: [applicant] } });

         await searchByNumber(user, 0, 9);

         expect(last(onSet).relatedPersonResponseList).toEqual([
            applicant,
            expect.objectContaining({ idClient: 9, fullName: 'Nueva SA', newObli: true, idCatTypePerson: 2 }),
         ]);
      });

      test('replaces a saved obligor and keeps it marked as deleted', async () => {
         getClientsById.mockResolvedValue(newClient);
         const { onSet, user } = setup();

         await searchByNumber(user, 0, 9);

         const list = last(onSet).relatedPersonResponseList;
         expect(list).toEqual([
            applicant,
            expect.objectContaining({ idClient: 9, newObli: true }),
            { ...existing, deleted: true },
         ]);
      });

      test('replaces an obligor added in this session without keeping it', async () => {
         getClientsById.mockResolvedValue(newClient);
         const draft = { ...existing, newObli: true };
         const { onSet, user } = setup({ request: { relatedPersonResponseList: [applicant, draft] } });

         await searchByNumber(user, 0, 9);

         expect(last(onSet).relatedPersonResponseList).toEqual([
            applicant,
            expect.objectContaining({ idClient: 9 }),
         ]);
      });

      test('reactivates an obligor that had been deleted', async () => {
         getClientsById.mockResolvedValue({ status: 200, data: { ...existing, businessName: 'Carlos Vega' } });
         const deleted = { ...existing, deleted: true };
         const { onSet, user } = setup({ request: { relatedPersonResponseList: [applicant, deleted] } });

         await searchByNumber(user, 0, 2);

         expect(last(onSet).relatedPersonResponseList).toEqual([applicant, { ...existing, deleted: false }]);
      });

      test('refuses an obligor that is already assigned', async () => {
         getClientsById.mockResolvedValue({ status: 200, data: { ...existing, businessName: 'Carlos Vega' } });
         const { onSet, user } = setup();

         await searchByNumber(user, 0, 2);

         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'warning' }));
         expect(onSet).not.toHaveBeenCalled();
      });
   });
});
