import IndividualSummary from '../../../../components/PropertyVerification/Details/IndividualSummary';

const mockSummary = {
   idResume: 538,
   totalAreaDimension: 1200,
   totalBuildArea: 23,
   totalCustomerValue: 1200000,
   resumeEnum: 'INDIVIDUAL_A',
   resume: {
      libres: {
         valor: 4500000,
         numero: 1,
      },
      gravados: {
         valor: 0,
         numero: 0,
      },
      inmuebles: {
         valor: 4500000,
         numero: 1,
      },
      embargados: {
         valor: 0,
         numero: 0,
      },
      pendientes: {
         valor: 0,
         numero: 0,
      },
      escrituracion: {
         valor: 0,
         numero: 0,
      },
   },
   creditRisk: null,
   coverageRatio: null,
};

describe('IndividualSummary component', () => {
   const props = { data: mockSummary };
   beforeEach(() => {
      jest.clearAllMocks();
   });

   test('muestra los totales correctamente', async () => {
      const {
         queries: { getByText },
      } = await renderPage(IndividualSummary, props);

      expect(getByText(/Dimensiones de terreno/i).closest('div')).toHaveTextContent(1200);
      expect(getByText(/de construcción/i).closest('div')).toHaveTextContent(23);
      expect(getByText(/Valor s\/cliente:/i)).toHaveTextContent('$1,200,000');
   });

   test('muestra los encabezados de la tabla correctamente', async () => {
      const {
         queries: { getByText },
      } = await renderPage(IndividualSummary, props);

      expect(getByText(/Resumen individual/i)).toBeInTheDocument();
      expect(getByText(/Inmueble\(s\) del solicitante/i)).toBeInTheDocument();
      expect(getByText(/Libres de gravamen/i)).toBeInTheDocument();
      expect(getByText(/Gravados/i)).toBeInTheDocument();
      expect(getByText(/Embargados/i)).toBeInTheDocument();
      expect(getByText(/Pendientes por verificar/i)).toBeInTheDocument();
      expect(getByText(/En escrituración/i)).toBeInTheDocument();
   });
});
