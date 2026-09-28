import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { ActiveLines } from '../../../components/Cover/ActiveLines';
import { renderComponent } from '../../utils/render';

const initialData = {
   previousLines: {
      linesActives: [
         { lineNumber: 11, type: 'ACCC', authDateIsi: '2023-01-10', issueDateIsi: '2025-01-10', amountIsi: '1000', currencyIsi: 'USD', balanceIsi: '400', warrantyIsi: 'OS' },
         { lineNumber: 12, type: '', amountIsi: '', currencyIsi: '', balanceIsi: '', warrantyIsi: '' },
      ],
      riskApplicantAmountIsi: '5000',
      riskApplicantBalanceIsi: '',
      riskGroupAmountIsi: '',
      riskGroupBalanceIsi: '',
      riskPotentialAmountIsi: '',
      riskPotentialBalanceIsi: '',
   },
   requestLinesResponse: {
      situation: 'Nueva',
      amountEc: 750000,
      currencyEc: 'MXP',
      termEc: '2 años',
      warrantyEc: 'SIN_OS',
      riskApplicantAmountEc: 100,
      riskGroupAmountEc: 200,
      riskPotentialAmountEc: 300,
   },
   modelAuthorization: { amountEm: '', currencyEm: '', termEm: '', warrantyEm: '', riskGroupAmountEm: 500000 },
};

// El componente es controlado: notifica el objeto completo y el padre lo devuelve como data.
function Harness({ onSet, start = initialData }) {
   const [data, setData] = useState(start);
   const fnSet = (...args) => {
      onSet(...args);
      setData(args[2]);
   };
   return <ActiveLines data={data} fnSet={fnSet} />;
}

const setup = (start) => {
   const onSet = jest.fn();
   return { onSet, ...renderComponent(<Harness onSet={onSet} start={start} />) };
};

const lastData = (onSet) => onSet.mock.calls.at(-1)[2];

describe('ActiveLines', () => {
   test('shows the previous lines with their stored values', () => {
      setup();

      expect(screen.getByTestId('type-0')).toHaveValue('ACCC');
      expect(screen.getByTestId('type-1')).toHaveDisplayValue(/Seleccionar/);
      expect(screen.getByTestId('authDateIsi-0')).toHaveValue('2023-01-10');
      expect(screen.getByTestId('issueDateIsi-0')).toHaveValue('2025-01-10');
      expect(screen.getByTestId('amountIsi-0')).toHaveValue('$1,000');
      expect(screen.getByTestId('currencyIsi-0')).toHaveValue('USD');
      expect(screen.getByTestId('balanceIsi-0')).toHaveValue('$400');
      expect(screen.getByTestId('warrantyIsi-0')).toHaveValue('OS');
      expect(screen.getByText('No. 11')).toBeInTheDocument();
      expect(screen.getByTestId('riskApplicantAmountIsi')).toHaveValue('$5,000');
   });

   test('renders without lines when the data is empty', () => {
      renderComponent(<ActiveLines data={{}} fnSet={jest.fn()} />);

      expect(screen.getByText('Resolución de líneas')).toBeInTheDocument();
      expect(screen.queryByTestId('type-0')).not.toBeInTheDocument();
   });

   test('shows the requested line as read only text', () => {
      setup();

      expect(screen.getByText('Nueva')).toBeInTheDocument();
      expect(screen.getByText('MXP', { selector: 'div' })).toBeInTheDocument();
      expect(screen.getByText('2 años')).toBeInTheDocument();
      expect(screen.getByText('SIN_OS')).toBeInTheDocument();
      expect(screen.getByText(/750,000/)).toBeInTheDocument();
   });

   test('reports the selected type of a line inside a copy of the whole data', async () => {
      const { onSet, user } = setup();

      await user.selectOptions(screen.getByTestId('type-1'), 'ACS');

      expect(onSet).toHaveBeenCalledWith('resolutionLinesResponse', '', expect.any(Object), 'object');
      expect(lastData(onSet).previousLines.linesActives[1].type).toBe('ACS');
      expect(lastData(onSet).previousLines.linesActives[0].type).toBe('ACCC');
      expect(initialData.previousLines.linesActives[1].type).toBe('');
      expect(screen.getByTestId('type-1')).toHaveValue('ACS');
   });

   test('reports currency and warranty changes of a line', async () => {
      const { onSet, user } = setup();

      await user.selectOptions(screen.getByTestId('currencyIsi-1'), 'MXP');
      await user.selectOptions(screen.getByTestId('warrantyIsi-1'), 'SIN_OS');

      const line = lastData(onSet).previousLines.linesActives[1];
      expect(line.currencyIsi).toBe('MXP');
      expect(line.warrantyIsi).toBe('SIN_OS');
   });

   test('reports date changes of a line', () => {
      const { onSet } = setup();

      fireEvent.change(screen.getByTestId('authDateIsi-1'), { target: { value: '2024-05-01' } });

      expect(lastData(onSet).previousLines.linesActives[1].authDateIsi).toBe('2024-05-01');
   });

   test('stores typed amounts without the currency sign or separators', async () => {
      const { onSet, user } = setup();

      await user.type(screen.getByTestId('amountIsi-1'), '2500');

      expect(lastData(onSet).previousLines.linesActives[1].amountIsi).toBe('2500');
      expect(screen.getByTestId('amountIsi-1')).toHaveValue('$2,500');
   });

   test('stores the previous risk totals on previousLines', async () => {
      const { onSet, user } = setup();

      await user.type(screen.getByTestId('riskGroupBalanceIsi'), '80');

      expect(lastData(onSet).previousLines.riskGroupBalanceIsi).toBe('80');
      expect(lastData(onSet).previousLines.linesActives).toHaveLength(2);
   });

   test('computes the applicant and potential risk when the authorized amount changes', async () => {
      const { onSet, user } = setup();

      await user.type(screen.getByTestId('amountEm'), '2000');

      const { modelAuthorization } = lastData(onSet);
      expect(modelAuthorization.amountEm).toBe('2000');
      expect(modelAuthorization.riskApplicantAmountEm).toBe('2000');
      expect(modelAuthorization.riskPotentialAmountEm).toBe(502000);
      expect(screen.getAllByText('$2,000').length).toBeGreaterThan(0);
      expect(screen.getByText('$502,000')).toBeInTheDocument();
   });

   test('shows zero risk amounts while nothing has been authorized', () => {
      setup({ ...initialData, modelAuthorization: {} });

      expect(screen.getAllByText('$ 0.00')).toHaveLength(3);
   });

   test('reports authorized currency, warranty and term', async () => {
      const { onSet, user } = setup();

      await user.selectOptions(screen.getByTestId('currencyEm'), 'USD');
      await user.selectOptions(screen.getByTestId('warrantyEm'), 'OS');
      await user.click(screen.getByText('dd/mm/aaaa'));
      await user.click(screen.getByText('1 año'));

      const { modelAuthorization } = lastData(onSet);
      expect(modelAuthorization).toMatchObject({ currencyEm: 'USD', warrantyEm: 'OS', termEm: '1 año' });
      expect(screen.getByText('1 año', { selector: 'summary' })).toBeInTheDocument();
   });
});
