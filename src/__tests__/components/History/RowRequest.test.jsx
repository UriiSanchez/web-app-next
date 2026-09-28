import { screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { RowRequest } from '../../../components/History/RowRequest';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';
import { createRouter } from '../../utils/router';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

const ADC = 1;
const EMG = 3;
const SOLICITUD_AUTORIZADA = 10;
const EN_RESOLUCION_SECRETARIADO = 6;
const SOLICITUD_CANCELADA = 23;

const data = {
   idRequest: 9,
   idGroupRequest: 3,
   idCatStatus: SOLICITUD_AUTORIZADA,
   relatedPersonResponseList: [
      { idCatTypePerson: 2, idClient: 200, fullName: 'Obligado Uno', firstTwoLetters: 'OU' },
      { idCatTypePerson: 1, idClient: 100, fullName: 'Ana Pérez', firstTwoLetters: 'AP', color: '#123456' },
   ],
};

function setup({ profile = ADC, row = data, props = {} } = {}) {
   useRouter.mockReturnValue(createRouter());
   const actions = createActions({ togglePDF: jest.fn() });
   const fnSet = jest.fn();
   const wrapper = createContextWrapper({ user: { idProfile: profile }, actions });
   const utils = renderComponent(<RowRequest data={row} fnSet={fnSet} isExpanded={false} {...props} />, { wrapper });
   return { actions, fnSet, ...utils };
}

describe('RowRequest', () => {
   test('shows the applicant, its initials and the request number', () => {
      setup();

      expect(screen.getByText('AP')).toBeInTheDocument();
      expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
      expect(screen.queryByText('Obligado Uno')).not.toBeInTheDocument();
      expect(screen.getByText('Núm de solicitud: 0000000003-9')).toBeInTheDocument();
   });

   test('shows the status label and icon of the request', () => {
      setup();

      expect(screen.getByText('Aprobada')).toBeInTheDocument();
      expect(screen.getByText('check_circle')).toHaveClass('text-emerald-600');
   });

   test('shows a dash when the status is unknown', () => {
      setup({ row: { ...data, idCatStatus: 99 } });

      expect(screen.getByText('-')).toBeInTheDocument();
      expect(screen.queryByText('check_circle')).not.toBeInTheDocument();
   });

   test('reflects the expanded state in the toggle icon and calls fnSet when clicked', async () => {
      const { fnSet, user, rerender } = setup();

      await user.click(screen.getByRole('button', { name: 'expand_more' }));
      expect(fnSet).toHaveBeenCalledTimes(1);

      rerender(<RowRequest data={data} fnSet={fnSet} isExpanded />);
      expect(screen.getByRole('button', { name: 'expand_less' })).toBeInTheDocument();
   });

   describe('download button', () => {
      test('asks for the cover and study PDF of the applicant when the request is resolved', async () => {
         const { actions, user } = setup({ profile: ADC });

         await user.click(screen.getByRole('button', { name: /Descargar/ }));

         expect(actions.togglePDF).toHaveBeenCalledWith({
            idRequest: 9,
            idClient: 100,
            title: 'Estudio Carátula',
            typePDF: 'COVER_AND_STUDY',
         });
      });

      test('is disabled while the request is still in resolution', () => {
         setup({ profile: ADC, row: { ...data, idCatStatus: EN_RESOLUCION_SECRETARIADO } });

         expect(screen.getByRole('button', { name: /Descargar/ })).toBeDisabled();
      });

      test('is not available for the EMG profile', () => {
         setup({ profile: EMG });

         expect(screen.queryByRole('button', { name: /Descargar/ })).not.toBeInTheDocument();
      });
   });

   describe('verification icon', () => {
      test('is shown for the EMG profile when the verification is pending', () => {
         setup({ profile: EMG, row: { ...data, pendingVerification: true } });

         expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            '/Shared/PropertyVerification/9?idGroup=3&origin=History'
         );
      });

      test('is shown for the analyst profile', () => {
         setup({ profile: ADC, row: { ...data, hasVerification: true } });

         expect(screen.getByText('Ir a verificar')).toBeInTheDocument();
      });

      test('is hidden for cancelled requests', () => {
         setup({ profile: ADC, row: { ...data, idCatStatus: SOLICITUD_CANCELADA, hasVerification: true } });

         expect(screen.queryByText('Ir a verificar')).not.toBeInTheDocument();
      });

      test('is hidden for profiles that do not verify', () => {
         setup({ profile: 5, row: { ...data, hasVerification: true, pendingVerification: true } });

         expect(screen.queryByText('Ir a verificar')).not.toBeInTheDocument();
         expect(screen.queryByRole('link')).not.toBeInTheDocument();
      });
   });
});
