import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import RequestsDetails, { getServerSideProps } from '../../../../pages/FAC/RequestsReview/[group]';
import { getEmpoweredInformation, getLoadDocuments, postSaveAuthorization } from '../../../../services';
import { constProfiles } from '../../../../helpers/config';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getEmpoweredInformation: jest.fn(),
   getLoadDocuments: jest.fn(),
   postSaveAuthorization: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const faculty = {
   userAD: 'fac.ad',
   path: 'FAC',
   profileType: 'COMERCIAL',
   idProfile: constProfiles.FAC,
   fullName: 'Fabio Facultado',
   status: [],
};

const buildRequest = (idRequest, extra = {}) => ({
   idRequest,
   idClient: `10${idRequest}`,
   fullName: `Cliente ${idRequest}`,
   idCatStatus: 26,
   lastRejection: false,
   authorizationsFaculty: [],
   ...extra,
});
const buildGroup = (extra = {}) => ({
   idGroup: 12,
   isGroup: true,
   idCatStatus: 26,
   requests: [buildRequest(1), buildRequest(2)],
   ...extra,
});
const creditYes = { userAD: 'cred.ad', typeFaculty: 'CREDITO', decisionFaculty: 'YES' };

const setup = async ({ group = buildGroup(), active = 1, context = {} } = {}) => {
   localStorage.setItem('ACTIVE_APPLICANT', JSON.stringify({ idGroup: 12, idRequest: active }));
   getEmpoweredInformation.mockResolvedValue(group);
   const utils = renderPage(<RequestsDetails idGroup='12' />, { context: { user: faculty, ...context } });
   await screen.findByTitle('Visor de PDF');
   return utils;
};

beforeEach(() => {
   getLoadDocuments.mockResolvedValue({ url: 'blob:carátula' });
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (FAC RequestsReview group)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '12' } })).toEqual({ props: { idGroup: '12' } });
   });

   test('defaults the group to 0 when the route has none', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('FAC RequestsReview group page', () => {
   describe('loading', () => {
      test('requests the group information for the active user and shows the active applicant', async () => {
         await setup();

         expect(getEmpoweredInformation).toHaveBeenCalledWith('12', 'fac.ad');
         expect(screen.getByText('Cliente 1')).toBeInTheDocument();
         expect(screen.getByRole('link', { name: 'Solicitudes' })).toHaveAttribute('href', '/FAC/RequestsReview');
      });

      test('loads the cover of the active applicant', async () => {
         await setup();

         expect(getLoadDocuments).toHaveBeenCalledWith(1, '101', 'PDF_COVER_ONLY');
         expect(screen.getByTitle('Visor de PDF')).toHaveAttribute('src', 'blob:carátula');
      });

      test('shows the active applicant stored in the browser when it is not the first one', async () => {
         await setup({ active: 2 });

         expect(screen.getByText('Cliente 2')).toBeInTheDocument();
         expect(getLoadDocuments).toHaveBeenCalledWith(2, '102', 'PDF_COVER_ONLY');
      });

      test('does not request anything without an active user', () => {
         renderPage(<RequestsDetails idGroup='12' />, { context: { user: undefined } });

         expect(getEmpoweredInformation).not.toHaveBeenCalled();
         expect(screen.queryByRole('link', { name: 'Solicitudes' })).not.toBeInTheDocument();
      });

      test('keeps the skeleton when the service returns no group', async () => {
         localStorage.setItem('ACTIVE_APPLICANT', JSON.stringify({ idGroup: 12, idRequest: 1 }));
         getEmpoweredInformation.mockResolvedValue({});

         renderPage(<RequestsDetails idGroup='12' />, { context: { user: faculty } });

         await waitFor(() => expect(getEmpoweredInformation).toHaveBeenCalledTimes(1));
         expect(screen.queryByRole('link', { name: 'Solicitudes' })).not.toBeInTheDocument();
      });

      test('reloads the group when the global reload flag changes', async () => {
         const { updateContext } = await setup();

         updateContext({ isReloading: true });

         await waitFor(() => expect(getEmpoweredInformation).toHaveBeenCalledTimes(2));
      });

      test('shows the applicant name without a dropdown for an individual request', async () => {
         await setup({ group: buildGroup({ isGroup: false, requests: [buildRequest(1)] }) });

         // El nombre aparece en el texto y en su tooltip; sin lista desplegable no hay flecha ni otros solicitantes.
         expect(screen.getAllByText('Cliente 1')).toHaveLength(2);
         expect(screen.queryByText('keyboard_arrow_down')).not.toBeInTheDocument();
         expect(screen.queryByText('Cliente 2')).not.toBeInTheDocument();
      });
   });

   describe('applicant selection', () => {
      test('changes the active applicant, stores it and loads its cover', async () => {
         const { user } = await setup();

         await user.click(screen.getByText('Cliente 1'));
         await user.click(screen.getByText('Cliente 2'));

         await waitFor(() => expect(getLoadDocuments).toHaveBeenCalledWith(2, '102', 'PDF_COVER_ONLY'));
         expect(JSON.parse(localStorage.getItem('ACTIVE_APPLICANT'))).toEqual({ idGroup: 12, idRequest: 2 });
      });
   });

   describe('decision buttons', () => {
      test('shows the authorization buttons while the group is in faculty review', async () => {
         await setup();

         expect(screen.getByRole('radio', { name: 'Rechazar' })).toBeEnabled();
         expect(screen.getByRole('radio', { name: 'Autorizar' })).toBeEnabled();
         expect(screen.queryByRole('link', { name: 'Regresar' })).not.toBeInTheDocument();
      });

      test('shows a link back to the history when the group is no longer in faculty review', async () => {
         await setup({ group: buildGroup({ idCatStatus: 12 }) });

         expect(screen.getByRole('link', { name: 'Regresar' })).toHaveAttribute('href', '/Shared/History');
         expect(screen.queryByRole('radio', { name: 'Autorizar' })).not.toBeInTheDocument();
      });
   });

   describe('saving a decision', () => {
      test('sends the decision of the active applicant with the active user', async () => {
         postSaveAuthorization.mockResolvedValue(true);
         const { user } = await setup();

         await user.click(screen.getByRole('radio', { name: 'Autorizar' }));

         await waitFor(() => expect(postSaveAuthorization).toHaveBeenCalledWith(1, 'fac.ad', 'YES'));
      });

      test('reloads the group when the decision could not be saved', async () => {
         postSaveAuthorization.mockResolvedValue(false);
         const { user, context } = await setup();

         await user.click(screen.getByRole('radio', { name: 'Autorizar' }));

         await waitFor(() => expect(context.actions.toggleReloading).toHaveBeenCalledTimes(1));
         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('moves to the next pending applicant of a group after authorizing', async () => {
         postSaveAuthorization.mockResolvedValue(true);
         const { user, context, router } = await setup();

         await user.click(screen.getByRole('radio', { name: 'Autorizar' }));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: expect.stringContaining('¡Bien hecho!'), focusConfirm: false })
            )
         );
         await waitFor(() => expect(context.actions.toggleReloading).toHaveBeenCalledTimes(1));
         expect(JSON.parse(localStorage.getItem('ACTIVE_APPLICANT'))).toEqual({ idGroup: 12, idRequest: 2 });
         expect(router.push).not.toHaveBeenCalled();
      });

      test('goes back to the requests list after authorizing the last pending request', async () => {
         postSaveAuthorization.mockResolvedValue(true);
         const group = buildGroup({ isGroup: false, requests: [buildRequest(1)] });
         const { user, router } = await setup({ group });

         await user.click(screen.getByRole('radio', { name: 'Autorizar' }));

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/FAC/RequestsReview'));
         expect(localStorage.getItem('ACTIVE_APPLICANT')).toBeNull();
      });

      test('shows the completion message when both faculty types authorized the last request', async () => {
         postSaveAuthorization.mockResolvedValue(true);
         const group = buildGroup({
            isGroup: false,
            requests: [buildRequest(1, { authorizationsFaculty: [creditYes] })],
         });
         const { user } = await setup({ group });

         await user.click(screen.getByRole('radio', { name: 'Autorizar' }));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ html: expect.stringContaining('¡Solicitud completada con éxito!') })
            )
         );
         expect(Swal.fire.mock.calls[0][0].html).toContain('00000012');
      });

      test('goes to the history when the last faculty rejects an individual request', async () => {
         postSaveAuthorization.mockResolvedValue(true);
         const group = buildGroup({
            isGroup: false,
            requests: [buildRequest(1, { lastRejection: true })],
         });
         const { user, router } = await setup({ group });

         await user.click(screen.getByRole('radio', { name: 'Rechazar' }));

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/Shared/History'));
         expect(postSaveAuthorization).toHaveBeenCalledWith(1, 'fac.ad', 'NO');
         expect(localStorage.getItem('ACTIVE_APPLICANT')).toBeNull();
      });

      test('asks for confirmation before the last faculty rejects and does not save when cancelled', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false });
         const group = buildGroup({
            isGroup: false,
            requests: [buildRequest(1, { lastRejection: true })],
         });
         const { user } = await setup({ group });

         await user.click(screen.getByRole('radio', { name: 'Rechazar' }));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ confirmButtonText: 'Confirmar' }));
         expect(postSaveAuthorization).not.toHaveBeenCalled();
      });

      test('goes to the history when the rejection leaves every other request of the group rejected', async () => {
         postSaveAuthorization.mockResolvedValue(true);
         const group = buildGroup({ requests: [buildRequest(1), buildRequest(2, { idCatStatus: 11 })] });
         const { user, router } = await setup({ group });

         await user.click(screen.getByRole('radio', { name: 'Rechazar' }));

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/Shared/History'));
         expect(Swal.fire).not.toHaveBeenCalled();
         expect(localStorage.getItem('ACTIVE_APPLICANT')).toBeNull();
      });

      test('shows the error when saving the decision throws', async () => {
         const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
         postSaveAuthorization.mockRejectedValue(new Error('boom'));
         const { user, router } = await setup();

         await user.click(screen.getByRole('radio', { name: 'Autorizar' }));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error' })));
         expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
         expect(router.push).not.toHaveBeenCalled();
      });
   });
});
