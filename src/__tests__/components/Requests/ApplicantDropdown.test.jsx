import { ApplicantDropdown } from '../../../components';

describe('ApplicantDropdown', () => {
   let applicantActive = {
      idRequest: 1,
      idCatStatus: 26,
      fullName: 'TEST S.A. DE C.V.',
      idCatTypePerson: 1,
      personType: 'PM',
      idClient: '1',
      authorizationsFaculty: [],
      resolutionByCredit: 'PENDING',
      resolutionByCommercial: 'PENDING',
      lastRejection: false,
   };

   let listRequest = [
      {
         idRequest: 1,
         idCatStatus: 26,
         fullName: 'TEST S.A. DE C.V.',
         idCatTypePerson: 1,
         personType: 'PM',
         idClient: '1',
         authorizationsFaculty: [
            {
               userAD: 'testUser',
               signatureDate: '2025-04-01T03:09:34',
               typeFaculty: 'CREDITO',
               decisionFaculty: 'YES',
               fullName: 'TEST USER',
            },
         ],
         resolutionByCredit: 'APPROVED',
         resolutionByCommercial: 'PENDING',
         lastRejection: false,
      },
      {
         idRequest: 2,
         idCatStatus: 26,
         fullName: 'TEST 2 S.A. DE C.V.',
         idCatTypePerson: 1,
         personType: 'PM',
         idClient: '2',
         authorizationsFaculty: [
            {
               userAD: 'testUser',
               signatureDate: '2025-04-01T03:09:34',
               typeFaculty: 'CREDITO',
               decisionFaculty: 'NO',
               fullName: 'TEST USER',
            },
         ],
         resolutionByCredit: 'REJECTED',
         resolutionByCommercial: 'PENDING',
         lastRejection: false,
      },
   ];
   let userActive = {
      profileType: 'CREDITO',
      idProfile: 6
   };
   let onSet = jest.fn();
   let isGroup = true;

   test('it show a name of applicant', async () => {
      const {
         queries: { getAllByRole },
      } = await renderPage(ApplicantDropdown, { applicantActive, listRequest, onSet, isGroup, userActive });

      let nameApplicant = getAllByRole('paragraph');
      expect(nameApplicant[0]).toBeInTheDocument();
   });

   test('it show a status request depending on the type of authorized', async () => {
      const {
         user,
         queries: { getByText },
      } = await renderPage(ApplicantDropdown, { applicantActive, listRequest, onSet, isGroup, userActive });
      await user.click(getByText('keyboard_arrow_down'));

      let statusAuthorized = getByText('Autorizado');
      let statusRejected = getByText('Rechazado');
      expect(statusAuthorized).toBeVisible();
      expect(statusRejected).toBeVisible();
   });

   test('it show a status request pending', async () => {
      let listRequest = [
         {
            idRequest: 1,
            idCatStatus: 26,
            fullName: 'TEST S.A. DE C.V.',
            idCatTypePerson: 1,
            personType: 'PM',
            idClient: '1',
            authorizationsFaculty: [
               {
                  userAD: 'testUser',
                  signatureDate: '2025-04-01T03:09:34',
                  typeFaculty: 'CREDITO',
                  decisionFaculty: 'YES',
                  fullName: 'TEST USER',
               },
            ],
            resolutionByCredit: 'APPROVED',
            resolutionByCommercial: 'PENDING',
            lastRejection: false,
         },
         {
            idRequest: 2,
            idCatStatus: 26,
            fullName: 'TEST 2 S.A. DE C.V.',
            idCatTypePerson: 1,
            personType: 'PM',
            idClient: '2',
            authorizationsFaculty: [],
            resolutionByCredit: 'PENDING',
            resolutionByCommercial: 'PENDING',
            lastRejection: false,
         },
      ];
      const {
         user,
         queries: { getByText },
      } = await renderPage(ApplicantDropdown, { applicantActive, listRequest, onSet, isGroup, userActive });
      await user.click(getByText('keyboard_arrow_down'));

      let statusPending = getByText('Pendiente');
      expect(statusPending).toBeVisible();
   });
});
