import { InformationRequestBar } from '../../../../components/Requests/OptionsBar/InformationRequestBar';

describe('InformationRequestBar', () => {
   let authorizations = [];
   let fullName = 'Test Company User';

   test('it show a name of applicant', async () => {
      const {
         queries: { getByText },
      } = await renderPage(InformationRequestBar, { fullName, authorizations });

      let titleName = getByText('Test Company User');
      expect(titleName).toBeVisible();
   });

   test('it validates that the data of the authorizing party is displayed', async () => {
      authorizations.push({
         userAD: 'testuser',
         fullName: 'Test User Front',
         signatureDate: '2025-02-11T17:26:08',
         typeFaculty: 'COMERCIAL',
         decisionFaculty: 'NO',
      });

      const {
         queries: { getByText },
      } = await renderPage(InformationRequestBar, { fullName, authorizations });

      let testName = getByText('Test User Front');
      let testDate = getByText('11/02/2025 17:26:08 PM');
      let testDecision = getByText('Rechazado');
      expect(testName).toBeVisible();
      expect(testDate).toBeVisible();
      expect(testDecision).toBeVisible();
   });

   test('it validate that the colors are the correct ones in the decision of the empowered', async () => {
      authorizations.push(
         {
            userAD: 'testuser1',
            fullName: 'Test User Comercial 1',
            signatureDate: '2025-02-12T13:26:08',
            typeFaculty: 'COMERCIAL',
            decisionFaculty: 'YES',
         }
      );

      const {
         queries: { getByTestId },
      } = await renderPage(InformationRequestBar, { fullName, authorizations });

      authorizations.forEach(({ decisionFaculty }) => {
         const result = getByTestId('decisionFaculty-' + decisionFaculty);
         let containClass = decisionFaculty === 'NO' ? 'bg-red-500' : 'bg-emerald-600';
         let containText = decisionFaculty === 'YES' ? 'Autorizado' : 'Rechazado';
         expect(result).toBeInTheDocument();
         expect(result).toHaveClass(containClass);
         expect(result).toHaveTextContent(containText);
      });
   });
});
