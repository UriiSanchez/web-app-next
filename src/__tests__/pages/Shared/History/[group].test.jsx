import HistoryDetails from '../../../../pages/Shared/History/[group]';

import { getOneRequest } from '../../../../services';
import { useGlobalContext } from '../../../../hooks';

jest.mock('next/router', () => ({ __esModule: true, useRouter: () => ({ push: jest.fn() }) }));
jest.mock('../../../../services', () => ({ __esModule: true, getOneRequest: jest.fn() }));
jest.mock('../../../../components/Layout', () => ({ __esModule: true, MainLayout: ({ children }) => children }));
jest.mock('../../../../hooks', () => ({ __esModule: true, useGlobalContext: jest.fn() }));

describe('HistoryDetails page', () => {
   const props = { idGroup: '1' };

   beforeEach(() => {
      useGlobalContext.mockReturnValue({
         user: { idProfile: 2 },
         actions: {},
         general: { alertsModel: { show: false } },
      });

      getOneRequest.mockResolvedValue({
         status: 200,
         data: {
            idGroupRequest: 1,
            requestResponseList: [
               {
                  idRequest: 1,
                  idCatStatus: 10,
                  relatedPersonResponseList: [
                     { idCatTypePerson: 1, firstTwoLetters: 'TC', fullName: 'test client 1', idClient: '12345' },
                     { idCatTypePerson: 2, fullName: 'test os 1', idClient: '10' },
                     { idCatTypePerson: 2, fullName: 'test os 2', idClient: '20' },
                  ],
               },
               {
                  idRequest: 2,
                  idCatStatus: 11,
                  relatedPersonResponseList: [
                     { idCatTypePerson: 1, firstTwoLetters: 'UT', fullName: 'test client 2', idClient: '54321' },
                  ],
               },
               {
                  idRequest: 3,
                  idCatStatus: 6,
                  relatedPersonResponseList: [
                     { idCatTypePerson: 1, firstTwoLetters: 'AT', fullName: 'test client 3', idClient: '44444' },
                  ],
               },
            ],
         },
      });
   });

   test('it should display a row for each requester', async () => {
      const {
         queries: { getByText },
      } = await renderPage(HistoryDetails, props);

      expect(getByText('test client 1')).toBeVisible();
      expect(getByText('test client 2')).toBeVisible();
   });

   test('it shows the correct message according to the request status', async () => {
      const {
         queries: { getByText },
      } = await renderPage(HistoryDetails, props);

      expect(getByText('Aprobada')).toBeVisible();
      expect(getByText('Rechazada')).toBeVisible();
      expect(getByText('Pendiente')).toBeVisible();
   });

   test('it shows additional data when clicking on expand button', async () => {
      const {
         user,
         queries: { getAllByRole, getByText },
      } = await renderPage(HistoryDetails, props);

      const expandButtons = getAllByRole('button', { name: 'expand_more' });
      await user.click(expandButtons[0]);

      expect(getByText('No. de Cliente')).toBeVisible();
      expect(getByText('12345')).toBeVisible();
   });

   test('it shows the OS name according to the one selected int he list', async () => {
      const {
         user,
         queries: { getAllByRole, getAllByText },
      } = await renderPage(HistoryDetails, props);

      const expandButtons = getAllByRole('button', { name: 'expand_more' });
      await user.click(expandButtons[0]);

      const selectInputs = getAllByRole('combobox');
      await user.selectOptions(selectInputs[0], ['test os 2']);

      expect(getAllByText('test os 2').length).toBe(1);
   });
});
