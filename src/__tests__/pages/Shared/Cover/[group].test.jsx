import { act, screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import Cover, { getServerSideProps } from '../../../../pages/Shared/Cover/[group]';
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

const analyst = { userAD: 'ana.ad', path: 'ADC', idProfile: 1, status: [] };

const buildApplicant = (idRequest, name, extra = {}) => ({
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
   ...extra,
});

const setup = async ({ applicants = [buildApplicant(1, 'Empresa Alfa'), buildApplicant(2, 'Empresa Beta')] } = {}) => {
   getCoverInfo.mockResolvedValue({ status: 200, data: applicants });
   const utils = renderPage(<Cover idGroup='7' />, { context: { user: analyst } });
   await screen.findByRole('heading', { name: /Solicitante:\s*Empresa Alfa/ });
   return utils;
};
const button = (name) => screen.getByRole('button', { name });
// La página lee `e.nativeEvent.submitter.id`, que JSDOM 20 no informa al enviar un formulario con un clic.
// Se despacha el evento `submit` con el botón como `submitter`.
const submitWith = (submitter) => {
   const event = new Event('submit', { bubbles: true, cancelable: true });
   Object.defineProperty(event, 'submitter', { value: submitter });
   act(() => {
      submitter.closest('form').dispatchEvent(event);
   });
};
const makeChange = async (user) => user.selectOptions(screen.getByTestId('relationshipCredit'), 'NO');

beforeEach(() => {
   Swal.fire.mockResolvedValue({ isConfirmed: true });
});

describe('getServerSideProps (Shared Cover)', () => {
   test('passes the group of the route as idGroup', async () => {
      expect(await getServerSideProps({ params: { group: '7' } })).toEqual({ props: { idGroup: '7' } });
   });

   test('defaults the group to 0', async () => {
      expect(await getServerSideProps({ params: {} })).toEqual({ props: { idGroup: 0 } });
   });
});

describe('Shared Cover page', () => {
   describe('loading', () => {
      test('requests the cover of the group and shows the first applicant and its format', async () => {
         await setup();

         expect(getCoverInfo).toHaveBeenCalledWith('7');
         expect(screen.getByTestId('applicant')).toHaveValue('Empresa Alfa');
         expect(screen.getByRole('heading', { name: 'Información para caratula de autorización de crédito' })).toBeInTheDocument();
         expect(JSON.parse(localStorage.getItem('CoverPage')).idRequest).toBe(1);
      });

      test('shows the loading skeleton and no applicant while the cover is loading', () => {
         getCoverInfo.mockReturnValue(new Promise(() => {}));

         renderPage(<Cover idGroup='7' />, { context: { user: analyst } });

         expect(screen.queryByTestId('applicant')).not.toBeInTheDocument();
      });

      test('logs the error and stops loading when the service throws', async () => {
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         getCoverInfo.mockRejectedValue(new Error('boom'));

         renderPage(<Cover idGroup='7' />, { context: { user: analyst } });

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Error en caratula: ', expect.any(Error)));
      });
   });

   describe('header', () => {
      test('goes back to the application evaluation of the group', async () => {
         const { user, router } = await setup();

         await user.click(button('Regresar'));

         expect(router.push).toHaveBeenCalledWith('/ADC/ApplicationEvaluation/7');
      });

      test('keeps saving disabled until the cover changes and enables it after a change', async () => {
         const { user } = await setup();
         expect(button('Guardar')).toBeDisabled();

         await makeChange(user);

         expect(button('Guardar')).toBeEnabled();
      });

      test('disables saving again when the change is reverted', async () => {
         const { user } = await setup();
         await makeChange(user);

         await user.selectOptions(screen.getByTestId('relationshipCredit'), 'SI');

         expect(button('Guardar')).toBeDisabled();
      });
   });

   describe('pages', () => {
      test('moves to the terms and conditions and back to the format', async () => {
         const { user } = await setup();
         expect(button('Anterior')).toBeDisabled();

         await user.click(button('Siguiente'));
         expect(screen.getByRole('heading', { name: 'Sumario de términos y condiciones' })).toBeInTheDocument();
         expect(screen.queryByTestId('relationshipCredit')).not.toBeInTheDocument();
         expect(button('Siguiente')).toBeDisabled();

         await user.click(button('Anterior'));
         expect(screen.getByTestId('relationshipCredit')).toBeInTheDocument();
      });

      test('disables the study button while the cover is incomplete', async () => {
         const { user } = await setup();

         await user.click(button('Siguiente'));

         expect(button('Ver estudio')).toBeDisabled();
      });

      test('opens the cover and study of the applicant when the cover is complete', async () => {
         const { user, context } = await setup({
            applicants: [buildApplicant(1, 'Empresa Alfa', { coverComplete: true })],
         });
         await user.click(button('Siguiente'));

         submitWith(button('Ver estudio'));

         expect(context.actions.togglePDF).toHaveBeenCalledWith({
            idRequest: 1,
            idClient: 4401,
            title: 'Estudio caratula',
            typePDF: 'COVER_AND_STUDY',
         });
      });
   });

   describe('applicants', () => {
      const openMenu = async (user) => user.click(screen.getByTestId('menuButton'));

      test('lists the applicants of the group in the side menu', async () => {
         const { user } = await setup();

         await openMenu(user);

         // El campo «Solicitante» del formato comparte el data-testid; los del menú son los párrafos.
         const menuItems = screen.getAllByTestId('applicant').filter((element) => element.tagName === 'P');
         expect(menuItems.map((element) => element.getAttribute('title'))).toEqual([
            'Empresa Alfa',
            'Empresa Beta',
         ]);
      });

      test('switches to another applicant without asking when there are no changes', async () => {
         const { user } = await setup();
         await openMenu(user);

         await user.click(screen.getAllByTestId('applicant')[1]);

         await waitFor(() => expect(screen.getByRole('heading', { name: /Solicitante:\s*Empresa Beta/ })).toBeInTheDocument());
         expect(Swal.fire).not.toHaveBeenCalled();
         expect(JSON.parse(localStorage.getItem('CoverPage')).idRequest).toBe(2);
      });

      test('does nothing when the active applicant is selected again', async () => {
         const { user } = await setup();
         await openMenu(user);

         await user.click(screen.getAllByTestId('applicant')[0]);

         expect(screen.getByRole('heading', { name: /Solicitante:\s*Empresa Alfa/ })).toBeInTheDocument();
         expect(Swal.fire).not.toHaveBeenCalled();
      });

      test('asks for confirmation before leaving unsaved changes and discards them', async () => {
         const { user } = await setup();
         await makeChange(user);
         await openMenu(user);

         await user.click(screen.getAllByTestId('applicant')[1]);

         await waitFor(() =>
            expect(Swal.fire).toHaveBeenCalledWith(
               expect.objectContaining({ title: '¿Seguro que quieres continuar?', confirmButtonText: 'Continuar' })
            )
         );
         await waitFor(() => expect(screen.getByRole('heading', { name: /Solicitante:\s*Empresa Beta/ })).toBeInTheDocument());
         await openMenu(user);
         await user.click(screen.getAllByTestId('applicant')[0]);
         await waitFor(() => expect(screen.getByTestId('relationshipCredit')).toHaveValue('SI'));
      });

      test('stays with the active applicant when the confirmation is cancelled', async () => {
         Swal.fire.mockResolvedValue({ isConfirmed: false });
         const { user } = await setup();
         await makeChange(user);
         await openMenu(user);

         await user.click(screen.getAllByTestId('applicant')[1]);

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
         expect(screen.getByRole('heading', { name: /Solicitante:\s*Empresa Alfa/ })).toBeInTheDocument();
      });
   });

   describe('saving', () => {
      test('saves the cover of the group with the risk amounts and the user', async () => {
         saveCoverInfo.mockResolvedValue({ status: 204 });
         const { user, context } = await setup();
         await makeChange(user);

         submitWith(button('Guardar'));

         await waitFor(() => expect(saveCoverInfo).toHaveBeenCalledTimes(1));
         const saved = saveCoverInfo.mock.calls[0][0];
         expect(saved).toHaveLength(2);
         expect(saved[0]).toEqual(
            expect.objectContaining({
               userCreate: 'ana.ad',
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

         submitWith(button('Guardar'));

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
         const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
         saveCoverInfo.mockRejectedValue(new Error('boom'));
         const { user, context } = await setup();
         await makeChange(user);

         submitWith(button('Guardar'));

         await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Guardado caratula', expect.any(Error)));
         expect(context.actions.toggleLoading).toHaveBeenLastCalledWith();
      });
   });
});
