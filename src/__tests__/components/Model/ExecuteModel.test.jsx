import { screen, waitFor } from '@testing-library/react';
import Swal from 'sweetalert2';

import { ExecuteModel } from '../../../components/Model/ExecuteModel';
import { getValidateModel, postExecutionModel } from '../../../services';
import { renderComponent } from '../../utils/render';
import { createActions, createContextWrapper } from '../../utils/context';

jest.mock('../../../services', () => ({ getValidateModel: jest.fn(), postExecutionModel: jest.fn() }));
jest.mock('sweetalert2', () => ({
   __esModule: true,
   default: { fire: jest.fn(), mixin: jest.fn(() => ({})), stopTimer: jest.fn(), resumeTimer: jest.fn() },
}));

const deferred = () => {
   let resolve;
   const promise = new Promise((res) => (resolve = res));
   return { promise, resolve };
};

function setup(props = {}) {
   const wrapper = createContextWrapper({ user: { userAD: 'analista' }, actions: createActions() });
   return renderComponent(<ExecuteModel idGroup={55} {...props} />, { wrapper });
}

const executeButton = () => screen.getByRole('button', { name: 'Ejecutar modelo' });
const lastHtml = () => Swal.fire.mock.calls.at(-1)[0].html;

describe('ExecuteModel', () => {
   test('shows the execute button without the loader', () => {
      setup();

      expect(executeButton()).toBeEnabled();
      expect(screen.queryByText(/Revisando documentación/)).not.toBeInTheDocument();
   });

   test('disables the button when it is told to', () => {
      setup({ isDisabled: true });

      expect(executeButton()).toBeDisabled();
   });

   test('shows the loader while it validates and then while it runs the model', async () => {
      const validation = deferred();
      const execution = deferred();
      getValidateModel.mockReturnValue(validation.promise);
      postExecutionModel.mockReturnValue(execution.promise);
      const { user } = setup();

      await user.click(executeButton());
      expect(await screen.findByText(/Revisando documentación Solicitantes/)).toBeInTheDocument();
      expect(getValidateModel).toHaveBeenCalledWith(55, 'analista');

      validation.resolve({ status: 200 });
      expect(await screen.findByText(/Procesando modelo/)).toBeInTheDocument();
      expect(screen.queryByText(/Revisando documentación/)).not.toBeInTheDocument();
      expect(postExecutionModel).toHaveBeenCalledWith(55, 'analista');

      execution.resolve({ status: 200 });
      await waitFor(() => expect(screen.queryByText(/Procesando modelo/)).not.toBeInTheDocument());
   });

   test('announces that the execution is in progress when everything goes well', async () => {
      getValidateModel.mockResolvedValue({ status: 200 });
      postExecutionModel.mockResolvedValue({ status: 200 });
      const { user } = setup();

      await user.click(executeButton());

      await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
      expect(lastHtml()).toContain('Ejecución en proceso');
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ timer: 5000, showConfirmButton: false }));
      expect(screen.queryByText(/Procesando modelo/)).not.toBeInTheDocument();
   });

   test('resets the loader message so the next run starts by reviewing the documents', async () => {
      const validation = deferred();
      getValidateModel.mockResolvedValueOnce({ status: 200 }).mockReturnValueOnce(validation.promise);
      postExecutionModel.mockResolvedValue({ status: 200 });
      const { user } = setup();
      await user.click(executeButton());
      await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));

      await user.click(executeButton());

      expect(await screen.findByText(/Revisando documentación Solicitantes/)).toBeInTheDocument();
      expect(screen.queryByText(/Procesando modelo/)).not.toBeInTheDocument();
   });

   describe('when the validation fails', () => {
      test('shows the plain error message and does not run the model', async () => {
         getValidateModel.mockResolvedValue({
            status: 400,
            error: { response: { message: 'Falta el balance' }, traceId: 'trace-1' },
         });
         const { user } = setup();

         await user.click(executeButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
         expect(lastHtml()).toContain('Error en la información');
         expect(lastHtml()).toContain('Falta el balance');
         expect(lastHtml()).toContain('Trace ID: trace-1');
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ timer: 8000, width: 500 }));
         expect(postExecutionModel).not.toHaveBeenCalled();
         expect(screen.queryByText(/Revisando documentación/)).not.toBeInTheDocument();
      });

      test('shows the details when the message comes as JSON', async () => {
         const message = JSON.stringify({ message: 'Datos incompletos', fullName: 'Empresa Alfa', errors: 'Sin RFC' });
         getValidateModel.mockResolvedValue({ status: 400, error: { response: { message } } });
         const { user } = setup();

         await user.click(executeButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
         expect(lastHtml()).toContain('Datos incompletos');
         expect(lastHtml()).toContain('Empresa Alfa');
         expect(lastHtml()).toContain('Sin RFC');
         expect(lastHtml()).toContain('cisti@ejemplo.com');
         expect(lastHtml()).toContain('Trace ID: ');
      });

      test('uses default texts when the JSON has no details', async () => {
         getValidateModel.mockResolvedValue({ status: 500, error: { response: { message: '{"code":1}' } } });
         const { user } = setup();

         await user.click(executeButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalled());
         expect(lastHtml()).toContain('Revisa los datos e intenta ejecutar el modelo nuevamente');
         expect(lastHtml()).toContain('No definido');
      });
   });

   describe('when the execution fails', () => {
      test('shows the error and hides the loader', async () => {
         getValidateModel.mockResolvedValue({ status: 200 });
         postExecutionModel.mockResolvedValue({
            status: 500,
            error: { response: { message: 'Modelo no disponible' }, traceId: 'trace-2' },
         });
         const { user } = setup();

         await user.click(executeButton());

         await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1));
         expect(lastHtml()).toContain('Modelo no disponible');
         expect(lastHtml()).toContain('Trace ID: trace-2');
         expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ timer: 8000 }));
         expect(screen.queryByText(/Procesando modelo/)).not.toBeInTheDocument();
      });
   });

   test('logs the error when a request throws', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      getValidateModel.mockRejectedValue(new Error('sin red'));
      const { user } = setup();

      await user.click(executeButton());

      await waitFor(() => expect(console.log).toHaveBeenCalledWith(expect.any(Error)));
      expect(postExecutionModel).not.toHaveBeenCalled();
      expect(Swal.fire).not.toHaveBeenCalled();
   });
});
