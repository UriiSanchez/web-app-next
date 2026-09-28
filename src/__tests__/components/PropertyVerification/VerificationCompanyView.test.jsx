import { fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';

import VerificationCompanyView from '../../../components/PropertyVerification/VerificationCompanyView';
import { onChangeRequestStatusOrAssignUser, savePropertyFormat } from '../../../services';
import { useDivMeasure, useGlobalContext } from '../../../hooks';
import { sweetConditional } from '../../../helpers';
import { EnumStatus } from '../../../helpers/config';
import mockUsers from '../../../__mocks__/users';

jest.mock('next/router', () => ({ __esModule: true, useRouter: jest.fn() }));
jest.mock('../../../services', () => ({
   __esModule: true,
   onChangeRequestStatusOrAssignUser: jest.fn(),
   savePropertyFormat: jest.fn(),
}));
jest.mock('../../../hooks', () => ({ __esModule: true, useDivMeasure: jest.fn(), useGlobalContext: jest.fn() }));
jest.mock('../../../helpers', () => ({
   __esModule: true,
   sweetConditional: jest.fn(),
   getCurrentDate: jest.fn(() => '2025-08-27'),
}));

const mockData = {
   propertiesFormat: {
      idPropertiesFormat: 519,
      idCatStatus: 17,
      idRequest: 519,
      uniqueFolio: null,
      result: '',
      verificationDate: null,
      description: "",
      genericFolio: null,
      createDate: '2025-08-20T11:45:55',
      modifyDate: '27-08-2025',
      hasVerification: true,
      typeVerification: 'SOCIETY',
      pendingVerification: true,
      freezeTitle: 'Cumple seguridad y sociedad',
   },
   idCatStatusGroup: 1,
   hasProperty: true,
   hasPropertyOS: true,
};

describe('VerificationCompanyView', () => {
   const btnState = { freezeDisabled: true };
   const mockOnUpdateData = jest.fn();
   const props = { idGroup: '367', genericUrl: '/EMG/Documentation/367', btnState, onUpdateData: mockOnUpdateData };
   let globalContextMock;
   let pushMock = jest.fn();

   beforeEach(() => {
      jest.clearAllMocks();
      globalContextMock = {
         user: mockUsers.EF,
         actions: {
            toggleLoading: jest.fn(),
         },
      };

      useRouter.mockReturnValue({ push: pushMock });
      useGlobalContext.mockReturnValue(globalContextMock);
      onChangeRequestStatusOrAssignUser.mockResolvedValue({ status: 204 });
      useDivMeasure.mockReturnValue([null, { width: 800, height: 670 }]);
   });

   test('it should enabled the inputs for the EF profile and disabled the "Finalizado" button', async () => {
      const {
         queries: { queryByRole, getByLabelText, getByRole },
      } = await renderPage(VerificationCompanyView, { ...props, info: mockData });

      expect(getByLabelText('Folio único')).toBeInTheDocument();
      expect(getByLabelText('Folio único')).toBeEnabled();

      expect(getByLabelText('Resultado')).toBeInTheDocument();
      expect(getByLabelText('Resultado')).toBeEnabled();

      expect(getByLabelText('Fecha verificación')).toBeInTheDocument();
      expect(getByLabelText('Fecha verificación')).toBeEnabled();

      let textDescription = 'Descripción (solo en caso de resultado gravada)';
      expect(getByLabelText(textDescription)).toBeInTheDocument();
      expect(getByLabelText(textDescription)).toBeDisabled();

      expect(queryByRole('button', { name: mockData.propertiesFormat.freezeTitle })).toBeNull();
   });

   test('Dispara onUpdateData al cambiar el select "Resultado"', async () => {
      const {
         queries: { getByLabelText },
      } = await renderPage(VerificationCompanyView, { ...props, info: mockData });
      const resultInput = getByLabelText('Resultado');
      fireEvent.change(resultInput, { target: { name: 'result', value: 'libre' } });
      expect(mockOnUpdateData).toHaveBeenCalledWith('propertiesFormat', {
         ...mockData.propertiesFormat,
         result: 'libre',
      });
   });

   test('habilita textarea de descripción solo si el resultado es "gravamen"', async () => {
      mockData.propertiesFormat.result = 'gravamen';
      const {
         queries: { getByLabelText },
      } = await renderPage(VerificationCompanyView, { ...props, info: mockData });

      expect(getByLabelText('Descripción (solo en caso de resultado gravada)')).toBeEnabled();
   });

   test('it should display a confirmation message when selecting "Embargada" in partnership verification', async () => {
      const {
         queries: { getByLabelText, getByText },
      } = await renderPage(VerificationCompanyView, { ...props, info: mockData });

      const resultInput = getByLabelText('Resultado');
      fireEvent.change(resultInput, { target: { name: 'result', value: 'embargada' } });
      expect(getByText('¡Sociedad embargada!')).toBeInTheDocument();
   });

   test('it should cancel the request when clicking yes in the confirmation message for "Embargada" in partnership verification', async () => {
      mockData.propertiesFormat.result = 'embargada';
      const {
         user,
         queries: { getByRole, getByText },
      } = await renderPage(VerificationCompanyView, { ...props, info: mockData });

      expect(getByText('¡Sociedad embargada!')).toBeInTheDocument();

      const yesButton = getByRole('button', { name: 'Sí, cancelar' });
      await user.click(yesButton);

      expect(onChangeRequestStatusOrAssignUser).toHaveBeenCalledWith(
         expect.objectContaining({
            idGroupRequest: props.idGroup,
            idCatStatus: EnumStatus.SOLICITUD_CANCELADA_POR_EMBARGO,
            userCreate: mockUsers.EF.userAD,
            nextProfile: 'EF',
         })
      );
   });

   test('validamos que la fecha de verificación tiene como máximo la fecha actual', async () => {
      const {
         queries: { getByLabelText },
      } = await renderPage(VerificationCompanyView, { ...props, info: mockData });

      expect(getByLabelText(/Fecha verificación/)).toHaveAttribute('max', '2025-08-27');
   });

   test('Los campos deben estar deshabilitados y no debe aparecer el botón de congelado', async () => {
      globalContextMock.user = mockUsers.MR;
      const {
         queries: { getByLabelText, queryByRole },
      } = await renderPage(VerificationCompanyView, { ...props, info: mockData });

      expect(getByLabelText('Folio único')).toBeDisabled();
      expect(getByLabelText('Resultado')).toBeDisabled();
      expect(getByLabelText('Fecha verificación')).toBeDisabled();

      let textDescription = 'Descripción (solo en caso de resultado gravada)';
      expect(getByLabelText(textDescription)).toBeDisabled();

      expect(queryByRole('button', { name: mockData.propertiesFormat.freezeTitle })).toBeNull();
   });

   describe('Profile Líder de Contraparte o Analista de Contraparte', () => {
      beforeEach(() => {
         globalContextMock.user = mockUsers.LDC;
         useGlobalContext.mockReturnValue(globalContextMock);
      });

      test('Debe mostrar el botón "Cumple seguridad y sociedad" deshabilitado si no esta completos los datos', async () => {
         const {
            queries: { getByRole },
         } = await renderPage(VerificationCompanyView, { ...props, info: mockData });

         expect(getByRole('button', { name: 'Cumple seguridad y sociedad' })).toBeInTheDocument();
         expect(getByRole('button', { name: 'Cumple seguridad y sociedad' })).toBeDisabled();
      });

      test('dispara sweetConditional al dar click en "Cumple seguridad y sociedad"', async () => {
         props.btnState.freezeDisabled = false;
         const {
            queries: { getByRole },
         } = await renderPage(VerificationCompanyView, { ...props, info: mockData });
         const btnFreeze = getByRole('button', { name: 'Cumple seguridad y sociedad' });
         expect(btnFreeze).toBeEnabled();

         fireEvent.click(btnFreeze);
         expect(sweetConditional).toHaveBeenCalledWith(
            expect.objectContaining({
               title: '¿Estás seguro de continuar?',
            })
         );
      });

      test('saveFreeze guarda el formato y redirige si status=200', async () => {
         savePropertyFormat.mockResolvedValue({ status: 200 });
         props.btnState.freezeDisabled = false;
         const {
            queries: { getByRole },
         } = await renderPage(VerificationCompanyView, { ...props, info: mockData });

         fireEvent.click(getByRole('button', { name: 'Cumple seguridad y sociedad' }));
         const args = sweetConditional.mock.calls[0][0];
         await args.onFunc();

         expect(savePropertyFormat).toHaveBeenCalledWith(expect.any(Object), mockUsers.LDC.idProfile, true);
      });
   });
});
