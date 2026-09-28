import BuroValidation from '../../../../pages/MRC/BuroValidation/[client]';

import { getInfoClient, updateInfoClient } from '../../../../services';
import { useLocalStorage } from '../../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../../services', () => ({ __esModule: true, getInfoClient: jest.fn(), updateInfoClient: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => {
   const originalModule = jest.requireActual('../../../../hooks');

   return {
      ...originalModule,
      useGlobalContext: () => ({
         actions: {
            toggleLoading: jest.fn(),
         },
      }),
      useLocalStorage: jest.fn(),
   };
});

describe('BuroValidation page', () => {
   const props = {
      idClient: '1',
      idRequest: '1',
      idGroup: '1',
   };

   beforeEach(() => {
      useLocalStorage.mockReturnValue([
         {
            documentation: [
               { _id: 'MCBC', screenBureau: { title: '', signatureDate: '', signatureName: '', showSignature: '' } },
            ],
         },
      ]);

      getInfoClient.mockResolvedValue({
         status: 200,
         data: {
            accountType: 'PFAE',
            address: 'CALLE 14',
            birthdate: '1986-01-08',
            city: ' MIGUEL HIDALGO',
            country: 'MÉXICO',
            exteriorNumber: '1111',
            municipality: ' MIGUEL HIDALGO',
            nationality: 'MX',
            neighborhood: 'LOMAS',
            rfc: 'ABCDE123',
            state: 'CIUDAD DE MÉXICO',
            zipCode: '11000',
         },
      });

      updateInfoClient.mockResolvedValue({ status: 200 });
   });

   test('it should enable save button when a change is made', async () => {
      const {
         user,
         queries: { getByLabelText, getByRole },
      } = await renderPage(BuroValidation, props);

      await user.type(getByLabelText('Núm. exterior'), '123');

      expect(getByRole('button', { name: 'Actualizar' })).toBeEnabled();
   });

   test('it should disable finish button when a change is made', async () => {
      const {
         user,
         queries: { getByLabelText, getByRole },
      } = await renderPage(BuroValidation, props);

      await user.type(getByLabelText('Núm. exterior'), '123');

      expect(getByRole('button', { name: 'Confirmar' })).toBeDisabled();
   });

   test('it should enable finish button after clicking on save button', async () => {
      const {
         user,
         queries: { getByLabelText, getByRole },
      } = await renderPage(BuroValidation, props);

      await user.type(getByLabelText('Núm. exterior'), '123');
      await user.click(getByRole('button', { name: 'Actualizar' }));

      expect(getByRole('button', { name: 'Confirmar' })).toBeEnabled();
   });
});
