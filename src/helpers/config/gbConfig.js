export const pagesByPerfil = {
   1: {
      path: 'ADC',
      allowedPages: ['PCD', 'PropertyVerification', 'History', 'Model', 'Cover', 'GeneralBalance', 'StateResults', 'Tracking'],
      startPage: '/ADC/RequestsReview',
      status: [4, 22],
      menu: [
         { title: ' Buscador', redirectTo: '/', isDisable: true },
         { title: ' Solicitudes', redirectTo: '/ADC/RequestsReview', isDisable: false },
         { title: ' Historial', redirectTo: '/Shared/History', isDisable: false },
         { title: ' Seguimiento', redirectTo: '/Shared/Tracking', isDisable: false },
      ]
   },
   2: {
      path: 'MRC',
      allowedPages: ['PCD', 'PropertyVerification', 'History', 'Tracking'],
      startPage: '/MRC/RequestsReview',
      status: [2],
      menu: [
         { title: ' Buscador', redirectTo: '/', isDisable: true },
         { title: ' Solicitudes', redirectTo: '/MRC/RequestsReview', isDisable: false },
         { title: ' Historial', redirectTo: '/Shared/History', isDisable: false },
         { title: ' Seguimiento', redirectTo: '/Shared/Tracking', isDisable: false },
      ],
   },
   3: {
      path: 'EMG',
      allowedPages: ['PropertyVerification', 'History', 'Tracking'],
      startPage: '/',
      status: [1, 7, 8, 9],
      menu: [
         { title: ' Buscador', redirectTo: '/', isDisable: false },
         { title: ' Solicitudes', redirectTo: '/EMG/RequestsReview', isDisable: false },
         { title: ' Historial', redirectTo: '/Shared/History', isDisable: false },
         { title: ' Seguimiento', redirectTo: '/Shared/Tracking', isDisable: false },
      ],
   },
   4: {
      path: 'LDC',
      allowedPages: ['PCD', 'PropertyVerification', 'History', 'Model', 'Cover', 'StateResults', 'GeneralBalance', 'Tracking'],
      startPage: '/LDC/RequestsReview',
      status: [3, 5],
      menu: [
         { title: ' Buscador', redirectTo: '/', isDisable: true },
         { title: ' Solicitudes', redirectTo: '/LDC/RequestsReview', isDisable: false },
         { title: ' Historial', redirectTo: '/Shared/History', isDisable: false },
         { title: ' Seguimiento', redirectTo: '/Shared/Tracking', isDisable: false },
      ],
   },
   5: {
      path: 'SEC',
      allowedPages: ['History', 'Tracking'],
      startPage: '/SEC/RequestsReview',
      status: [6],
      menu: [
         { title: ' Buscador', redirectTo: '/', isDisable: true },
         { title: ' Solicitudes', redirectTo: '/SEC/RequestsReview', isDisable: false },
         { title: ' Historial', redirectTo: '/Shared/History', isDisable: false },
         { title: ' Seguimiento', redirectTo: '/Shared/Tracking', isDisable: false },
      ],
   },
   6: {
      path: 'FAC',
      allowedPages: ['History', 'Tracking'],
      startPage: '/FAC/RequestsReview',
      status: [26],
      menu: [
         { title: ' Buscador', redirectTo: '/', isDisable: true },
         { title: ' Solicitudes', redirectTo: '/FAC/RequestsReview', isDisable: false },
         { title: ' Historial', redirectTo: '/Shared/History', isDisable: false },
         { title: ' Seguimiento', redirectTo: '/Shared/Tracking', isDisable: false },
      ],
   },
};
