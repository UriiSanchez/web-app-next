import { TrackingMovementTable } from '../../../../components/Tables/Tracking/TrackingMovementTable';

const mockDetails = [
   {
      idTracking: 1015,
      profile: 'ANALISTA DE CREDITO',
      idCatStatus: 4,
      flagDevolution: false,
      userAD: 'jsierra',
      fullName: 'Juan Ramon Sierra Garza',
      createDate: '2025-08-13 17:33:32',
      authorizationFacultyResponse: null,
   },
   {
      idTracking: 1011,
      profile: 'LIDER DE CONTRAPARTE',
      idCatStatus: 3,
      flagDevolution: false,
      userAD: 'uceron',
      fullName: 'Uriel Antonio Ceron Sanchez ',
      createDate: '2025-08-13T11:57:56',
      authorizationFacultyResponse: null,
   },
   {
      idTracking: 1010,
      profile: 'ESPECIALISTA DE FINANCIAMIENTO',
      idCatStatus: 8,
      flagDevolution: true,
      userAD: 'csalazarc',
      fullName: 'Celia  Salazar Cuautli ',
      createDate: '2025-08-13T11:56:42',
      authorizationFacultyResponse: null,
   },
   {
      idTracking: 1008,
      profile: 'LIDER DE CONTRAPARTE',
      idCatStatus: 3,
      flagDevolution: false,
      userAD: 'marzola',
      fullName: 'María Leticia Arzola Rayas ',
      createDate: '2025-08-13T11:51:42',
      authorizationFacultyResponse: null,
   },
   {
      idTracking: 1006,
      profile: 'MESA RECEPTORA',
      idCatStatus: 2,
      flagDevolution: false,
      userAD: 'uceron',
      fullName: 'Uriel Antonio Ceron Sanchez ',
      createDate: '2025-08-13T11:19:29',
      authorizationFacultyResponse: null,
   },
   {
      idTracking: 1005,
      profile: 'ESPECIALISTA DE FINANCIAMIENTO',
      idCatStatus: 7,
      flagDevolution: true,
      userAD: 'marzola',
      fullName: 'María Leticia Arzola Rayas ',
      createDate: '2025-08-13 10:59:06',
      authorizationFacultyResponse: null,
   },
   {
      idTracking: 1002,
      profile: 'MESA RECEPTORA',
      idCatStatus: 2,
      flagDevolution: false,
      userAD: 'uceron',
      fullName: 'Uriel Antonio Ceron Sanchez ',
      createDate: '2025-08-13T10:45:20',
      authorizationFacultyResponse: null,
   },
];

describe('TrackingMovementTable component', () => {
   afterEach(() => {
      jest.clearAllMocks();
   });

   test('should render the loading skeleton when isLoading is true', async () => {
      const {
         queries: { getAllByTestId },
      } = await renderPage(TrackingMovementTable, { isLoading: true, details: [] });

      const skeletonElements = getAllByTestId('skeleton-item');
      expect(skeletonElements).toHaveLength(3);
      expect(skeletonElements[0]).toHaveClass('box');
   });

   test('should display the message “No transactions found” when the details are empty', async () => {
      const {
         queries: { getByText },
      } = await renderPage(TrackingMovementTable, { isLoading: false, details: [] });
      expect(getByText('No se encontraron movimientos')).toBeInTheDocument();
   });

   test('must render the headers and the correct number of movements', async () => {
      const {
         queries: { getByText, getAllByTestId },
      } = await renderPage(TrackingMovementTable, { isLoading: false, details: mockDetails });

      // Encabezados de la tabla
      expect(getByText(/Área y Responsable/i)).toBeInTheDocument();
      expect(getByText('Llegada')).toBeInTheDocument();
      expect(getByText('Tiempo total')).toBeInTheDocument();
      // Filas
      const movsItems = getAllByTestId('tracking-timeline');
      expect(movsItems).toHaveLength(mockDetails.length);
   });

   test('it must render the first movement with its correct icon and data', async () => {
      const {
         queries: { getByText, getAllByText },
      } = await renderPage(TrackingMovementTable, { isLoading: false, details: mockDetails });

      expect(getByText('Juan Ramon Sierra Garza')).toBeInTheDocument();
      expect(getByText('ANALISTA DE CREDITO')).toBeInTheDocument();
      expect(getByText(/13\/08\/2025\s+17:33:32\s+PM/)).toBeInTheDocument();
      // Icono
      const iconFirst = getAllByText('check')[0];
      expect(iconFirst).toBeInTheDocument();
      expect(iconFirst).toHaveClass('bg-emerald-500');
   });

   test('must render a movement with return correctly', async () => {
      const {
         queries: { getAllByText },
      } = await renderPage(TrackingMovementTable, { isLoading: false, details: mockDetails });
      // Icon
      const icon = getAllByText('sync');
      // Deberia haber dos iconos
      expect(icon).toHaveLength(2);
      icon.forEach((icon) => {
         expect(icon).toBeInTheDocument();
         expect(icon).toHaveClass('bg-[#F9D37F]');
      });
   });

   test('the intermediate movement icon must be rendered with the correct color', async () => {
      const {
         queries: { getAllByText },
      } = await renderPage(TrackingMovementTable, { isLoading: false, details: mockDetails });

      const icon = getAllByText('check');
      // Deberia haber dos iconos
      expect(icon).toHaveLength(5);
      icon.forEach((element, idx) => {
         let hasClass = idx === 0 ? 'bg-emerald-500' : 'bg-[#B7B8B7]';
         expect(element).toBeInTheDocument();
         expect(element).toHaveClass(hasClass);
      });
   });
});
