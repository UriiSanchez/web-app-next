import { AuthorizationButtons } from '../../../components';

describe('AuthorizationButtons', () => {
   let idStatusRequest = 26;
   let lastRejection = false;
   let authorizations = [
      {
         userAD: 'testUser1',
         signatureDate: '2025-03-06T10:29:36',
         typeFaculty: 'CREDITO',
         decisionFaculty: 'YES',
         fullName: 'USUARIO DE PRUEBA1',
      },
   ];
   let userAD = 'testUser1';
   let profileType = 'CREDITO';
   let onSet = jest.fn();

   test('it show he authorize and reject buttons ', async () => {
      const {
         queries: { getByText },
      } = await renderPage(AuthorizationButtons, {
         authorizations,
         userAD,
         profileType,
         onSet,
         idStatusRequest,
         lastRejection,
      });

      let buttonRejected = getByText('Rechazar');
      let buttonAuthorized = getByText('Autorizar');
      expect(buttonAuthorized).toBeVisible();
      expect(buttonRejected).toBeVisible();
   });

   test('it show a check mark icon should appear on the button that is selected', async () => {
      const {
         queries: { getByText },
      } = await renderPage(AuthorizationButtons, {
         authorizations,
         userAD,
         profileType,
         onSet,
         idStatusRequest,
         lastRejection,
      });
      expect(getByText('check')).toBeVisible();
   });
});
