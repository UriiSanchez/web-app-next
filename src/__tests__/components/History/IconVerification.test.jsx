import { screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { IconVerification } from '../../../components/History/IconVerification';
import { renderComponent } from '../../utils/render';
import { createRouter } from '../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const ADC = 1;
const EMG = 3;
const LDC = 4;
const SEC = 5;
const EN_RESOLUCION_SECRETARIADO = 6;
const SOLICITUD_AUTORIZADA = 10;
const SOLICITUD_RECHAZADA = 11;
const url = '/Shared/PropertyVerification/9?idGroup=3&origin=History';

function setup(props = {}) {
   const router = createRouter();
   useRouter.mockReturnValue(router);
   const utils = renderComponent(
      <IconVerification idProfile={EMG} idCatStatus={SOLICITUD_AUTORIZADA} idRequest={9} idGroup={3} {...props} />
   );
   return { router, ...utils };
}

describe('IconVerification', () => {
   describe('EMG profile', () => {
      test.each([EN_RESOLUCION_SECRETARIADO, SOLICITUD_AUTORIZADA])(
         'links to the verification when it is pending and the status is %p',
         (idCatStatus) => {
            setup({ idCatStatus, pendingVerification: true });

            expect(screen.getByRole('link')).toHaveAttribute('href', url);
            expect(screen.getByText('No cuenta con la seguridad')).toBeInTheDocument();
         }
      );

      test('shows nothing when there is no pending verification', () => {
         setup({ pendingVerification: false });

         expect(screen.queryByRole('link')).not.toBeInTheDocument();
         expect(screen.queryByText('Ir a verificar')).not.toBeInTheDocument();
      });

      test('shows nothing when the status does not allow verification', () => {
         setup({ idCatStatus: SOLICITUD_RECHAZADA, pendingVerification: true });

         expect(screen.queryByRole('link')).not.toBeInTheDocument();
      });
   });

   describe('analyst and leader profiles', () => {
      test.each([ADC, LDC])('profile %p navigates to the verification when there is one to validate', async (idProfile) => {
         const { router, user } = setup({ idProfile, hasVerification: true });

         expect(screen.getByText('Haz clic para abrir la verificación')).toBeInTheDocument();
         await user.click(screen.getByText('Ir a verificar'));

         expect(router.push).toHaveBeenCalledWith(url);
      });

      test('does not navigate nor show the tooltip without a verification', async () => {
         const { router, user } = setup({ idProfile: ADC, hasVerification: false });

         await user.click(screen.getByText('Ir a verificar'));

         expect(router.push).not.toHaveBeenCalled();
         expect(screen.queryByText('Haz clic para abrir la verificación')).not.toBeInTheDocument();
      });

      test('shows nothing when the status does not allow verification', () => {
         setup({ idProfile: ADC, idCatStatus: SOLICITUD_RECHAZADA, hasVerification: true });

         expect(screen.queryByText('Ir a verificar')).not.toBeInTheDocument();
      });
   });

   test('shows nothing for other profiles', () => {
      const { container } = setup({ idProfile: SEC, hasVerification: true, pendingVerification: true });

      expect(container.firstChild).toBeEmptyDOMElement();
   });
});
