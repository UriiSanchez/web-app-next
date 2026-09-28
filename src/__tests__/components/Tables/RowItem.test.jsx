import { screen, within } from '@testing-library/react';
import { useRouter } from 'next/router';

import { RowItem } from '../../../components/Tables/RowItem';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';
import { createRouter } from '../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const cols = [
   { id: 'groupName', sx: 'col-span-2' },
   { id: 'function', sx: 'col-span-1', type: 'expand' },
];
const request = (idClient, overrides = {}) => ({
   idClient,
   kindProcedure: 'Nuevo Tramite',
   requestAmount: 4000,
   lastDateExecEm: '2025-06-03T08:46:12',
   resultExecEm: true,
   recommendationAc: true,
   recommendationLc: false,
   relatedPersonResponseList: [
      { idCatTypePerson: 2, fullName: 'Aval' },
      { idCatTypePerson: 1, fullName: `Solicitante ${idClient}` },
   ],
   ...overrides,
});
const item = {
   idGroup: 8,
   isGroup: true,
   groupName: 'Grupo Ocho',
   idCatStatus: 4,
   requestResponseList: [request(1), request(2, { kindProcedure: '' })],
};

const adcUser = { idProfile: 1, path: 'ADC', status: [4] };

function setup({ user = adcUser, expandedRows = [], row = item, onFunc } = {}) {
   const router = createRouter();
   useRouter.mockReturnValue(router);
   const actions = createActions({ setExpandedRows: jest.fn() });
   const utils = renderComponent(
      <table>
         <tbody>
            <RowItem item={row} cols={cols} onFunc={onFunc} />
         </tbody>
      </table>,
      { wrapper: createContextWrapper({ user, expandedRows, actions }) }
   );
   return { router, actions, ...utils };
}

describe('RowItem', () => {
   test('shows the row cells and no detail rows while collapsed', () => {
      setup();

      expect(screen.getAllByRole('row')).toHaveLength(1);
      expect(screen.getByText('Grupo Ocho')).toBeInTheDocument();
   });

   test('reports the item when the row is clicked', async () => {
      const onFunc = jest.fn();
      const { user } = setup({ onFunc });

      await user.click(screen.getByText('Grupo Ocho'));

      expect(onFunc).toHaveBeenCalledWith(item);
   });

   test('toggles the expanded row without triggering the row click', async () => {
      const onFunc = jest.fn();
      const { actions, user } = setup({ onFunc });

      await user.click(screen.getByTestId('btn-expanded-8'));

      expect(actions.setExpandedRows).toHaveBeenCalledWith(8);
      expect(onFunc).not.toHaveBeenCalled();
   });

   test('shows a detail row per request with the applicant of the group', () => {
      setup({ expandedRows: [8] });

      expect(screen.getAllByRole('row')).toHaveLength(3);
      expect(screen.getByText('Solicitante 1')).toBeInTheDocument();
      expect(screen.getByText('Solicitante 2')).toBeInTheDocument();
      expect(screen.getAllByText('$4,000')).toHaveLength(2);
      expect(screen.getAllByText('Nuevo Tramite')).toHaveLength(1);
      expect(screen.getByText('- No definido -')).toBeInTheDocument();
      expect(screen.getAllByText('03/06/2025 08:46:12 AM')).toHaveLength(2);
   });

   test('omits the applicant name and the amount for an individual request', () => {
      setup({ expandedRows: [8], row: { ...item, isGroup: false } });

      expect(screen.queryByText('Solicitante 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Monto línea:')).not.toBeInTheDocument();
   });

   test('shows the model columns for profiles other than MRC', () => {
      setup({ expandedRows: [8] });
      const [, first] = screen.getAllByRole('row');

      expect(within(first).getByText('Última ejecución del modelo')).toBeInTheDocument();
      expect(within(first).getByText('Recomendación contraparte:')).toBeInTheDocument();
      expect(within(first).getAllByAltText('Resultado del modelo')).toHaveLength(1);
      expect(within(first).getByAltText('Recomendación del Analista')).toBeInTheDocument();
      expect(within(first).getByAltText('Recomendación del Líder')).toBeInTheDocument();
   });

   test('hides the model columns for the MRC profile', () => {
      setup({ expandedRows: [8], user: { idProfile: 2, path: 'MRC', status: [] } });

      expect(screen.queryByText('Última ejecución del modelo')).not.toBeInTheDocument();
      expect(screen.queryByText('Recomendación contraparte:')).not.toBeInTheDocument();
      expect(screen.getAllByText('Tipo tramite:')).toHaveLength(2);
   });

   test('lets an ADC user open the model result when the request status allows it', async () => {
      const { router, user } = setup({ expandedRows: [8] });

      await user.click(screen.getAllByRole('button', { name: /open_in_new/ })[0]);

      expect(router.push).toHaveBeenCalledWith('/ADC/ApplicationEvaluation/8');
   });

   test.each([
      ['the model has no result', adcUser, { resultExecEm: null }],
      ['the status is not available to the user', { ...adcUser, status: [9] }, {}],
   ])('disables the model result button when %s', (_, user, overrides) => {
      setup({
         expandedRows: [8],
         user,
         row: { ...item, requestResponseList: [request(1, overrides)] },
      });

      expect(screen.getByRole('button', { name: /open_in_new/ })).toBeDisabled();
   });

   test('does not offer the model result button to non-ADC profiles', () => {
      setup({ expandedRows: [8], user: { idProfile: 3, path: 'EMG', status: [4] } });

      expect(screen.queryByRole('button', { name: /open_in_new/ })).not.toBeInTheDocument();
   });
});
