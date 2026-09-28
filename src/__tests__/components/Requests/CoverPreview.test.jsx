import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

import { CoverPreview } from '../../../components/Requests/CoverPreview';
import { getLoadDocuments, postStampedCover } from '../../../services';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';
import { createRouter } from '../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../services', () => ({ getLoadDocuments: jest.fn(), postStampedCover: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const SOLICITUD_RECHAZADA = 11;
const groupRequests = [
   { idRequest: 1, sealed: false, idCatStatus: 4 },
   { idRequest: 2, sealed: true, idCatStatus: 10 },
   { idRequest: 3, sealed: false, idCatStatus: 4 },
   { idRequest: 4, sealed: false, idCatStatus: SOLICITUD_RECHAZADA },
];

function setup({ props = {}, docResult = { url: 'blob:cover' } } = {}) {
   getLoadDocuments.mockResolvedValue(docResult);
   const router = createRouter({ query: { group: '55', showModal: 'true' } });
   useRouter.mockReturnValue(router);
   const actions = createActions({ toggleReloading: jest.fn() });
   const wrapper = createContextWrapper({ user: { userAD: 'secretario' }, actions });
   const utils = renderComponent(
      <CoverPreview idRequest={1} idClient='123' idGroup={55} requests={groupRequests} {...props} />,
      { wrapper }
   );
   return { router, actions, ...utils };
}

const confirm = async (user) => {
   await screen.findByTitle('Visor de PDF');
   await user.click(screen.getByRole('button', { name: 'Confirmar' }));
};

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('CoverPreview', () => {
   test('disables the buttons and shows the loader while the cover loads', async () => {
      getLoadDocuments.mockReturnValue(new Promise(() => {}));
      useRouter.mockReturnValue(createRouter());
      renderComponent(<CoverPreview idRequest={1} idClient='123' idGroup={55} requests={groupRequests} />, {
         wrapper: createContextWrapper({ user: { userAD: 'secretario' }, actions: createActions() }),
      });

      expect(screen.getByText(/Estamos cargando el documento/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeDisabled();
      expect(screen.getByTitle('Cerrar modal')).toBeDisabled();
   });

   test('shows the cover without toolbar once loaded', async () => {
      setup();

      expect(await screen.findByTitle('Visor de PDF')).toHaveAttribute('src', 'blob:cover#toolbar=0&navpanes=0');
      expect(getLoadDocuments).toHaveBeenCalledWith(1, '123', 'PDF_COVER_SIGNATURES');
      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeEnabled();
   });

   test('shows the error returned by the service', async () => {
      setup({ docResult: { url: '', error: 'No se pudo generar' } });

      expect(await screen.findByText('No se pudo generar')).toBeInTheDocument();
      expect(screen.queryByTitle('Visor de PDF')).not.toBeInTheDocument();
   });

   test('blocks the page scroll while it is open and restores it on unmount', async () => {
      const { unmount } = setup();
      await screen.findByTitle('Visor de PDF');
      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('auto');
      expect(document.documentElement.style.overflowY).toBe('auto');
   });

   test('goes back to the requests review of the group', async () => {
      const { router, user } = setup();
      await screen.findByTitle('Visor de PDF');

      await user.click(screen.getByTitle('Cerrar modal'));

      expect(router.push).toHaveBeenCalledWith({ pathname: '/SEC/RequestsReview/55' });
   });

   describe('stamping', () => {
      test('stamps a single request, announces it and goes to the history', async () => {
         postStampedCover.mockResolvedValue({ status: 200 });
         localStorage.setItem('ACTIVE_APPLICANT', '{"idRequest":1}');
         const { router, actions, user } = setup();

         await confirm(user);

         expect(postStampedCover).toHaveBeenCalledWith(1, 'secretario');
         expect(actions.toggleLoading).toHaveBeenNthCalledWith(1, 'Guardando carátula y el estudio...');
         expect(actions.toggleLoading).toHaveBeenNthCalledWith(2);
         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/Shared/History'));
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('¡Solicitud completada con éxito!') })
         );
         expect(localStorage.getItem('ACTIVE_APPLICANT')).toBeNull();
      });

      test('goes to the history when every request of the group is already stamped', async () => {
         postStampedCover.mockResolvedValue({ status: 200 });
         const closing = [
            { idRequest: 1, sealed: false, idCatStatus: 4 },
            { idRequest: 2, sealed: true, idCatStatus: 10 },
            { idRequest: 4, sealed: false, idCatStatus: SOLICITUD_RECHAZADA },
         ];
         const { router, user } = setup({ props: { isGroup: true, requests: closing } });

         await confirm(user);

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/Shared/History'));
      });

      test('shows the progress and continues with the next request of the group', async () => {
         postStampedCover.mockResolvedValue({ status: 200 });
         const { router, actions, user } = setup({ props: { isGroup: true } });

         await confirm(user);

         await waitFor(() => expect(actions.toggleReloading).toHaveBeenCalledTimes(1));
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ confirmButtonText: expect.stringContaining('Siguiente solicitud') })
         );
         expect(JSON.parse(localStorage.getItem('ACTIVE_APPLICANT'))).toEqual({ idGroup: 55, idRequest: 3 });
         expect(router.push).toHaveBeenCalledWith({ pathname: '/SEC/RequestsReview/55' });
         expect(router.push).not.toHaveBeenCalledWith('/Shared/History');
      });

      test('shows the error and stays on the cover when stamping fails', async () => {
         postStampedCover.mockResolvedValue({ status: 400 });
         const { router, actions, user } = setup();

         await confirm(user);

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ confirmButtonText: 'Aceptar' }));
         expect(router.push).not.toHaveBeenCalled();
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
      });

      test('logs the error and hides the loading when the request throws', async () => {
         jest.spyOn(console, 'error').mockImplementation(() => {});
         postStampedCover.mockRejectedValue(new Error('sin red'));
         const { router, actions, user } = setup();

         await confirm(user);

         await waitFor(() => expect(console.error).toHaveBeenCalledWith('SELLAR CARÁTULA ', expect.any(Error)));
         expect(actions.toggleLoading).toHaveBeenCalledTimes(2);
         expect(router.push).not.toHaveBeenCalled();
      });
   });
});
