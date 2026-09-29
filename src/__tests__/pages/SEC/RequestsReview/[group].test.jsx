import { screen, waitFor } from '@testing-library/react';

import RequestsDetails, { getServerSideProps } from '../../../../pages/SEC/RequestsReview/[group]';
import { getEmpoweredInformation, getLoadDocuments } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getEmpoweredInformation: jest.fn(),
   getLoadDocuments: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const secretary = { userAD: 'sec.ad', path: 'SEC', fullName: 'Sara Secretaria', idProfile: 5, status: [] };

const buildRequest = (idRequest, extra = {}) => ({
   idRequest,
   idClient: `10${idRequest}`,
   fullName: `Cliente ${idRequest}`,
   idCatStatus: 26,
   sealed: false,
   ...extra,
});
const buildGroup = (extra = {}) => ({
   idGroup: 5,
   isGroup: true,
   requests: [buildRequest(1), buildRequest(2)],
   ...extra,
});

const setup = async ({ group = buildGroup(), active = 1, props = {}, context = {} } = {}) => {
   localStorage.setItem('ACTIVE_APPLICANT', JSON.stringify({ idGroup: 5, idRequest: active }));
   getEmpoweredInformation.mockResolvedValue(group);
   const utils = renderPage(<RequestsDetails idGroup='5' coverPreview={false} {...props} />, {
      context: { user: secretary, ...context },
   });
   await screen.findByRole('link', { name: 'Solicitudes' }).catch(() => {});
   return utils;
};

beforeEach(() => {
   getLoadDocuments.mockResolvedValue({ url: 'blob:carátula' });
});

describe('getServerSideProps (SEC RequestsReview group)', () => {
   test('passes the group and a false cover preview by default', async () => {
      expect(await getServerSideProps({ query: { group: '5' } })).toEqual({
         props: { idGroup: '5', coverPreview: false },
      });
   });

   test('passes the cover preview flag of the query', async () => {
      expect(await getServerSideProps({ query: { group: '5', coverPreview: 'true' } })).toEqual({
         props: { idGroup: '5', coverPreview: 'true' },
      });
   });

   test.each([
      ['there is no group', {}],
      ['the group is not a number', { group: 'abc' }],
   ])('answers not found when %s', async (_label, query) => {
      expect(await getServerSideProps({ query })).toEqual({ notFound: true });
   });
});

describe('SEC RequestsReview group page', () => {
   describe('loading', () => {
      test('requests the group information as secretary and shows the active applicant', async () => {
         await setup();

         expect(getEmpoweredInformation).toHaveBeenCalledWith('5', 'sec.ad', 'SEC');
         expect(screen.getByText('Cliente 1')).toBeInTheDocument();
         expect(screen.getByRole('link', { name: 'Solicitudes' })).toHaveAttribute('href', '/SEC/RequestsReview');
      });

      test('loads the cover of the active applicant', async () => {
         await setup({ active: 2 });

         await waitFor(() => expect(getLoadDocuments).toHaveBeenCalledWith(2, '102', 'PDF_COVER_ONLY'));
         expect(await screen.findByTitle('Visor de PDF')).toHaveAttribute('src', 'blob:carátula');
      });

      test('does not request anything without an active user', () => {
         renderPage(<RequestsDetails idGroup='5' coverPreview={false} />, { context: { user: undefined } });

         expect(getEmpoweredInformation).not.toHaveBeenCalled();
         expect(screen.queryByRole('link', { name: 'Solicitudes' })).not.toBeInTheDocument();
      });

      test('keeps the skeleton when the service returns no group', async () => {
         localStorage.setItem('ACTIVE_APPLICANT', JSON.stringify({ idGroup: 5, idRequest: 1 }));
         getEmpoweredInformation.mockResolvedValue({});

         renderPage(<RequestsDetails idGroup='5' coverPreview={false} />, { context: { user: secretary } });

         await waitFor(() => expect(getEmpoweredInformation).toHaveBeenCalledTimes(1));
         expect(screen.queryByRole('link', { name: 'Solicitudes' })).not.toBeInTheDocument();
      });

      test('reloads the group when the global reload flag changes', async () => {
         const { updateContext } = await setup();

         updateContext({ isReloading: true });

         await waitFor(() => expect(getEmpoweredInformation).toHaveBeenCalledTimes(2));
      });
   });

   describe('applicant selection', () => {
      test('changes the active applicant, stores it and loads its cover', async () => {
         const { user } = await setup();

         await user.click(screen.getByText('Cliente 1'));
         await user.click(screen.getByText('Cliente 2'));

         await waitFor(() => expect(getLoadDocuments).toHaveBeenCalledWith(2, '102', 'PDF_COVER_ONLY'));
         expect(JSON.parse(localStorage.getItem('ACTIVE_APPLICANT'))).toEqual({ idGroup: 5, idRequest: 2 });
      });
   });

   describe('edit and seal actions', () => {
      test('links to the cover editor of the active applicant and to the seal preview', async () => {
         await setup({ active: 2 });

         expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/SEC/Cover/5?idRequest=2');
         expect(screen.getByRole('link', { name: /Sellar/ })).toHaveAttribute(
            'href',
            '/SEC/RequestsReview/5?coverPreview=true'
         );
      });

      test('disables both actions when the applicant is already sealed', async () => {
         const group = buildGroup({ requests: [buildRequest(1, { sealed: true }), buildRequest(2)] });

         await setup({ group });

         expect(screen.getByRole('button', { name: 'Editar' })).toBeDisabled();
         expect(screen.getByRole('button', { name: /Sellar/ })).toBeDisabled();
         expect(screen.queryByRole('link', { name: 'Editar' })).not.toBeInTheDocument();
      });

      test('disables both actions when the applicant was rejected', async () => {
         const group = buildGroup({ requests: [buildRequest(1, { idCatStatus: 11 }), buildRequest(2)] });

         await setup({ group });

         expect(screen.getByRole('button', { name: 'Editar' })).toBeDisabled();
         expect(screen.getByRole('button', { name: /Sellar/ })).toBeDisabled();
      });
   });

   describe('cover preview', () => {
      test('does not show the cover preview by default', async () => {
         await setup();

         expect(screen.queryByRole('button', { name: 'Confirmar' })).not.toBeInTheDocument();
      });

      test('shows the cover preview with signatures when requested', async () => {
         jest.spyOn(console, 'error').mockImplementation(() => {});
         await setup({ props: { coverPreview: true } });

         expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
         await waitFor(() =>
            expect(getLoadDocuments).toHaveBeenCalledWith(1, '101', 'PDF_COVER_SIGNATURES')
         );
      });

      // Comportamiento actual: la vista previa se monta antes de cargar el grupo, con idRequest e
      // idClient indefinidos (los propTypes lo advierten), y pide el PDF dos veces. Se documenta como hallazgo.
      test('requests the cover first without applicant data and again once the group is loaded (current behavior)', async () => {
         jest.spyOn(console, 'error').mockImplementation(() => {});
         await setup({ props: { coverPreview: true } });

         await waitFor(() => expect(getLoadDocuments).toHaveBeenCalledWith(1, '101', 'PDF_COVER_SIGNATURES'));

         expect(getLoadDocuments.mock.calls[0]).toEqual([undefined, undefined, 'PDF_COVER_SIGNATURES']);
      });
   });
});
