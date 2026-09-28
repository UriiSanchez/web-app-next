describe.each(['localStorage', 'sessionStorage'])('%s: contrato y aislamiento', (name) => {
   test.each([1, 2])('empieza vacío aunque otro caso lo haya usado (%s)', () => {
      expect(window[name].length).toBe(0);
      window[name].setItem('pending', 'previous test');
   });
   test('distingue valores vacíos de claves ausentes y convierte valores a cadenas', () => {
      const storage = window[name];
      storage.setItem('empty', '');
      expect(storage.getItem('empty')).toBe('');
      expect(storage.getItem('missing')).toBeNull();
      for (const value of [42, null, undefined, false]) {
         storage.setItem('value', value);
         expect(storage.getItem('value')).toBe(String(value));
      }
      storage.removeItem('empty');
      expect(storage.getItem('empty')).toBeNull();
   });
});
