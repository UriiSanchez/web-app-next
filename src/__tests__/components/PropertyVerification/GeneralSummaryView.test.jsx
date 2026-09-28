import GeneralSummaryView from '../../../components/PropertyVerification/GeneralSummaryView';

const mockInfo = {
   idResume: 539,
   totalAreaDimension: null,
   totalBuildArea: null,
   totalCustomerValue: null,
   resumeEnum: 'GENERAL_EMG',
   resume: {
      inmueblesApplicant: {
         verify: {
            valor: 0,
            numero: 0,
         },
         pending: {
            valor: 1200000,
            numero: 1,
         },
      },
      inmueblesObligated: {
         verify: {
            valor: 0,
            numero: 0,
         },
         pending: {
            valor: 3155446,
            numero: 2,
         },
      },
      copropiedadWithOS: {
         valor: 0,
         numero: 0,
      },
      copropiedadOthers: {
         valor: 0,
         numero: 0,
      },
      embargados: {
         valor: 0,
         numero: 0,
      },
      escrituracion: {
         valor: 0,
         numero: 0,
      },
      gravados: {
         valor: 0,
         numero: 0,
      },
      libres: {
         valor: 0,
         numero: 0,
      },
      pendientes: {
         verify: {
            valor: 0,
            numero: 0,
         },
         pending: {
            valor: 4355446,
            numero: 3,
         },
      },
      coverageRatioClient: 1.8936721739130435,
   },
   creditRisk: 2300000,
   coverageRatio: 0,
};

describe('GeneralSummaryView', () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   test('debe mostrar las tabla con colores indicados cuando "No" hay propiedades verificadas', async () => {
      const {
         queries: { getByText },
      } = await renderPage(GeneralSummaryView, { info: mockInfo });
      const verifiedTable = getByText('Propiedades verificadas');
      const statementTable = getByText('Declaración del cliente');
      expect(verifiedTable).toBeInTheDocument();
      expect(statementTable).toBeInTheDocument();

      expect(verifiedTable.closest('table').querySelector('thead')).toHaveClass('bg-gray');
      expect(statementTable.closest('table').querySelector('thead')).toHaveClass('bg-black');
   });

   test('debe mostrar las tabla con colores indicados cuando "Sí" hay propiedades verificadas', async () => {
      mockInfo.resume.inmueblesApplicant.verify = {
         valor: 1000000,
         numero: 1,
      };

      const {
         queries: { getByText },
      } = await renderPage(GeneralSummaryView, { info: mockInfo });
      const verifiedTable = getByText('Propiedades verificadas');
      const statementTable = getByText('Declaración del cliente');
      expect(verifiedTable).toBeInTheDocument();
      expect(statementTable).toBeInTheDocument();

      expect(verifiedTable.closest('table').querySelector('thead')).toHaveClass('bg-black');
      expect(statementTable.closest('table').querySelector('thead')).toHaveClass('bg-black');
   });

});
