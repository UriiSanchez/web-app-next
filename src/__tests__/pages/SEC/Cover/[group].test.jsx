import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import CoverDetails, { getServerSideProps } from '../../../../pages/SEC/Cover/[group]';
import { getCoverInfo, saveCoverInfo } from '../../../../services';
import { renderPage } from '../../../utils/page';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('next-auth/react', () => ({ useSession: jest.fn(), signOut: jest.fn() }));
jest.mock('../../../../services', () => ({
   ...jest.requireActual('../../../../services'),
   getCoverInfo: jest.fn(),
   saveCoverInfo: jest.fn(),
}));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})) },
}));

const secretary = { userAD: 'sec.ad', path: 'SEC', idProfile: 5, status: [] };

const buildApplicant = (idRequest, name) => ({
   idRequest,
   coverComplete: false,
   generalDataCifResponse: {
      personType: 'PM',
      checkLessor: true,
      relationshipCredit: 'SI',
      typeExchange: '17.25',
      applicant: name,
      idClient: 4400 + idRequest,
      address: 'Reforma 1',
      economicGroup: 'Grupo Alfa',
      antiquity: '10 años',
      city: 'CDMX',
      rfc: 'ALF010101AAA',
      branchOffice: 'Lomas',
      state: 'Ciudad de México',
      presentationDate: '01-03-2025',
      requestDate: '20-02-2025',
      analyst: 'Raúl Díaz',
      commercialAddress: 'Insurgentes 100',
   },
   infoFinancialResponse: {
      totalDirect: 100,
      totalIndirect: 0,
      lastAnnualDate: '31-12-2024',
      partialDate: '',
      bureauReportApplicantDate: '05-01-2025',
      bureauReportObligedDate: '',
      qualificationApplicant: 'A1',
      qualificationObliged: '',
      shareholding: [{ id: 1, name: 'Socio Uno', rfc: 'SOC010101AAA', directParticipation: 100, indirectParticipation: null }],
   },
   sectorInformationResponse: {
      codeBaseSector: 'S-10',
      targetMarket: 'SI',
      sector: 'Industria',
      subSector: 'Manufactura',
      specificActivity: 'Textil',
      strategicMarket: 'NO',
      specificDescriptionActivity: '',
   },
   resolutionLinesResponse: {
      previousLines: { linesActives: [{ lineNumber: 1, type: '' }] },
      requestLinesResponse: {},
      modelAuthorization: { amountEm: 1000 },
   },
   termsAndConditionsResponse: {
      presentationDate: '15-03-2025',
      company: name,
      lineNumber: 'L-90',
      creditType: 'Simple',
      destination: 'Capital de trabajo',
      municipality: 'Miguel Hidalgo',
      state: 'CDMX',
      lineTerm: '12 meses',
      contractTerm: '24 meses',
      resources: 'Propios',
      provision: 'Única',
      principalPayment: 'Al vencimiento',
      interestPayment: 'Mensual',
      solidaryObliged: 'Luis Gómez',
      warranty: 'Hipotecaria',
      precedentCondition: '',
      followingCondition: '',
      contractCondition: '',
      operatingCondition: '',
      cumulativeAmount: 0,
      coverageIndex: 50,
      notional: '',
   },
});

const setup = async ({ applicants = [buildApplicant(1, 'Empresa Alfa'), buildApplicant(2, 'Empresa Beta')], idRequest = '2' } = {}) => {
   getCoverInfo.mockResolvedValue({ status: 200, data: applicants });
   const utils = renderPage(<CoverDetails idGroup='7' idRequest={idRequest} />, { context: { user: secretary } });
   await screen.findByRole('link', { name: 'Empresa Beta' }).catch(() => {});
   return utils;
};
const button = (name) => screen.getByRole('button', { name });
const makeChange = async (user) => user.selectOptions(screen.getByTestId('relationshipCredit'), 'NO');

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (SEC Cover)', () => {
   test('passes the group of the route and the request of the query', async () => {
      expect(await getServerSideProps({ params: { group: '7' }, query: { idRequest: '2' } })).toEqual({
         props: { idGroup: '7', idRequest: '2' },
      });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {}, query: {} })).toEqual({
         props: { idGroup: 0, idRequest: undefined },
      });
   });
});

describe('SEC Cover page', () => {
   describe('loading', () => {
      test('requests the cover of the group and edits the applicant of the request', async () => {
         await setup();

         expect(getCoverInfo).toHaveBeenCalledWith('7');
         expect(screen.getByTestId('applicant')).toHaveValue('Empresa Beta');
         expect(JSON.parse(localStorage.getItem('CoverPage')).idRequest).toBe(2);
         expect(screen.getByRole('heading', { name: 'Sumario de términos y condiciones' })).toBeInTheDocument();
      });

      test('shows the breadcrumbs with the requests list and the applicant', async () => {
         await setup();

         expect(screen.getByRole('link', { name: 'Solicitudes' })).toHaveAttribute('href', '/SEC/RequestsReview');
         expect(screen.getByRole('link', { name: 'Empresa Beta' })).toHaveAttribute('href', '/SEC/RequestsReview/7');
         expect(screen.getByText('Edición de Carátula')).toBeInTheDocument();
      });

      test('shows a loading label in the breadcrumbs while the cover is loading', () => {
         getCoverInfo.mockReturnValue(new Promise(() => {}));

         renderPage(<CoverDetails idGroup='7' idRequest='2' />, { context: { user: secretary } });

         expect(screen.getByRole('link', { name: 'Cargando...' })).toBeInTheDocument();
      });

      test('logs the error when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         getCoverInfo.mockRejectedValue(new Error('boom'));

         renderPage(<CoverDetails idGroup='7' idRequest='2' />, { context: { user: secretary } });

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Error en caratula: ', expect.any(Error)));
      });

      test('keeps the loading state when the service answers with another status', async () => {
         getCoverInfo.mockResolvedValue({ status: 500, data: [] });

         renderPage(<CoverDetails idGroup='7' idRequest='2' />, { context: { user: secretary } });

         await waitFor(() => expect(getCoverInfo).toHaveBeenCalledTimes(1));
         expect(screen.getByRole('link', { name: 'Cargando...' })).toBeInTheDocument();
      });
   });

   describe('saving', () => {
      test('keeps saving disabled until the cover changes', async () => {
         const { user } = await setup();
         expect(button('Guardar')).toBeDisabled();

         await makeChange(user);

         expect(button('Guardar')).toBeEnabled();
      });

      test('saves the cover of the group with the risk amounts and the user', async () => {
         saveCoverInfo.mockResolvedValue({ status: 204 });
         const { user, context } = await setup();
         await makeChange(user);

         await user.click(button('Guardar'));

         await waitFor(() => expect(saveCoverInfo).toHaveBeenCalledTimes(1));
         const saved = saveCoverInfo.mock.calls[0][0];
         expect(saved).toHaveLength(2);
         expect(saved[1]).toEqual(
            expect.objectContaining({
               userCreate: 'sec.ad',
               generalDataCifResponse: expect.objectContaining({ relationshipCredit: 'NO' }),
            })
         );
         expect(saved[0].resolutionLinesResponse.modelAuthorization).toEqual(
            expect.objectContaining({ riskGroupAmountEm: 1000, riskPotentialAmountEm: 2000 })
         );
         expect(context.actions.toggleLoading).toHaveBeenCalledWith('Guardando...');
         await waitFor(() => expect(button('Guardar')).toBeDisabled());
         expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ html: expect.stringContaining('Los cambios se han guardado') })
         );
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });

      test('shows the service message and keeps the changes when saving answers with another status', async () => {
         saveCoverInfo.mockResolvedValue({ status: 400, error: { response: { message: 'Datos inválidos' } } });
         const { user } = await setup();
         await makeChange(user);

         await user.click(button('Guardar'));

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({
                  title: '¡Ocurrio un error al intentar guardar la información!',
                  html: 'Datos inválidos',
                  icon: 'warning',
               })
            )
         );
         expect(button('Guardar')).toBeEnabled();
      });

      test('logs the error and hides the loader when saving throws', async () => {
         const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
         saveCoverInfo.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();
         await makeChange(user);

         await user.click(button('Guardar'));

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Guardado caratula', expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });

   describe('going back', () => {
      test('goes back to the request details without asking when there are no changes', async () => {
         const { user, router } = await setup();

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/SEC/RequestsReview/7');
         expect(localStorage.getItem('CoverPage')).toBeNull();
         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('asks for confirmation before discarding unsaved changes and then goes back', async () => {
         const { user, router } = await setup();
         await makeChange(user);

         await user.click(button('Regresar'));

         await waitFor(() => expect(router.push).toHaveBeenCalledWith('/SEC/RequestsReview/7'));
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ confirmButtonText: 'Confirmar' }));
      });

      test('stays on the page when the confirmation is cancelled', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false });
         const { user, router } = await setup();
         await makeChange(user);

         await user.click(button('Regresar'));

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
         expect(router.push).not.toHaveBeenCalled();
      });
   });
});
