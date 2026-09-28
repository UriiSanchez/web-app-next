import { ListEconomicGroup } from '../../../components';
import { isValidEmail } from '../../../helpers';

jest.mock('../../../helpers', () => ({ __esModule: true, isValidEmail: jest.fn() }));

const mockGroup = [
   {
      idClient: '2',
      fullName: 'Client B',
      isInProgress: false,
      email: 'b@example.com',
      edit: false,
   },
   {
      idClient: '3',
      fullName: 'Client C',
      isInProgress: true,
      email: 'c@example.com',
      edit: false,
   },
   {
      idClient: '4',
      fullName: 'Client D',
      isInProgress: false,
      email: 'd@example.com',
      edit: false,
   },
];

describe('ListEconomicGroup component', () => {
   const mockApplicantsInitial = [
      {
         idClient: '1',
         fullName: 'Client A',
         isInProgress: false,
         email: 'a@example.com',
         edit: false,
      },
   ];
   let onSetDataMock;

   beforeEach(() => {
      jest.clearAllMocks();
      onSetDataMock = jest.fn();
      isValidEmail.mockReturnValue(true);
   });

   test('should render all group members with correct initial state', async () => {
      const {
         queries: { getByText, getAllByRole, getAllByText },
      } = await renderPage(ListEconomicGroup, {
         group: mockGroup,
         applicants: mockApplicantsInitial,
         onSetData: onSetDataMock,
      });

      // Se valida que se muestren el nombre de los integrantes del grupo.
      expect(getByText('Client B')).toBeInTheDocument();
      expect(getByText('Client C')).toBeInTheDocument();
      expect(getByText('Client D')).toBeInTheDocument();
      // Validamos que los checks estén presentes
      expect(getAllByRole('checkbox').length).toBe(3);
      // Verificamos el estatus de solicitud
      expect(getByText('En proceso')).toBeInTheDocument();
      expect(getAllByText('Sin solicitud').length).toBe(2);
      // Validamos que los correos se muestren por defecto
      expect(getByText('b@example.com')).toBeInTheDocument();
      expect(getByText('c@example.com')).toBeInTheDocument();
      expect(getByText('d@example.com')).toBeInTheDocument();
   });

   test('should add a client to applicants when their checkbox is clicked', async () => {
      const {
         queries: { getAllByRole },
         user,
      } = await renderPage(ListEconomicGroup, {
         group: mockGroup,
         applicants: mockApplicantsInitial,
         onSetData: onSetDataMock,
      });

      const allChecks = getAllByRole('checkbox');
      await user.click(allChecks[0]);
      expect(onSetDataMock).toHaveBeenCalledTimes(1);
      expect(onSetDataMock).toHaveBeenCalledWith([...mockApplicantsInitial, mockGroup[0]]);
   });

   test('should remove a client from applicants when their checkbox is clicked again', async () => {
      const applicantsWithClientC = [...mockApplicantsInitial, mockGroup[2]];
      const {
         queries: { getAllByRole },
         user,
      } = await renderPage(ListEconomicGroup, {
         group: mockGroup,
         applicants: applicantsWithClientC,
         onSetData: onSetDataMock,
      });

      const checkClientD = getAllByRole('checkbox')[2];
      expect(checkClientD).toBeChecked();
      // Uncheck al cliente D
      await user.click(checkClientD);
      expect(onSetDataMock).toHaveBeenCalledTimes(1);
      expect(onSetDataMock).toHaveBeenCalledWith([...mockApplicantsInitial]);
   });

   test('should toggle edit mode for alternative email when "Editar" button is clicked', async () => {
      const applicantsWithClientC = [...mockApplicantsInitial, mockGroup[0]];
      const {
         queries: { getByTestId },
         user,
      } = await renderPage(ListEconomicGroup, {
         group: mockGroup,
         applicants: applicantsWithClientC,
         onSetData: onSetDataMock,
      });

      const btnEditClientB = getByTestId('edit-alternative-2');
      expect(btnEditClientB).toHaveTextContent('Editar');

      await user.click(btnEditClientB);
      // onSetData deberia haber sido llamado para cambiar el estado 'edit'
      expect(onSetDataMock).toHaveBeenCalledTimes(1);
      expect(onSetDataMock).toHaveBeenCalledWith([...mockApplicantsInitial, { ...mockGroup[0], edit: true }]);

      onSetDataMock.mock.calls[0][0][1].edit = true;

      const result = await renderPage(ListEconomicGroup, {
         group: mockGroup,
         applicants: onSetDataMock.mock.calls[0][0],
         onSetData: onSetDataMock,
      });

      // Verificar que el input del correo alternativo se encuentre visible
      const inputEmail = result.queries.getByTestId('input-alternative-2');
      expect(inputEmail).toBeInTheDocument();
      expect(inputEmail).toHaveAttribute('placeholder', 'Correo alternativo');

      // Verificamos que el botón tenga el texto cancelar
      const btnCancelClientB = result.queries.getByRole('button', { name: 'Cancelar' });
      expect(btnCancelClientB).toHaveTextContent('Cancelar');
   });

   test('should apply correct styles for invalid alternative email', async () => {
      isValidEmail.mockReturnValue(false);
      const applicantsWithEditMode = [
         ...mockApplicantsInitial,
         {
            ...mockGroup[0],
            edit: true,
            alternativeMail: 'invalid-email',
         },
      ];

      const {
         queries: { getByTestId },
         user,
      } = await renderPage(ListEconomicGroup, {
         group: mockGroup,
         applicants: applicantsWithEditMode,
         onSetData: onSetDataMock,
      });

      const inputEmail = getByTestId('input-alternative-2');
      expect(inputEmail).toHaveClass('border-red-500');
      expect(inputEmail).toHaveClass('text-red-500');
      expect(inputEmail).not.toHaveClass('border-blue-500');
   });

   test('should disable edit button if application is not in current applicants list', async () => {
      const {
         queries: { getByTestId },
         user,
      } = await renderPage(ListEconomicGroup, {
         group: mockGroup,
         applicants: mockApplicantsInitial,
         onSetData: onSetDataMock,
      });

      const editButtonClientB = getByTestId('edit-alternative-2');
      expect(editButtonClientB).toHaveClass('cursor-default');
      expect(editButtonClientB).toHaveClass('text-gray-400');
      expect(editButtonClientB).not.toHaveClass('text-blue-800');
   });
});
