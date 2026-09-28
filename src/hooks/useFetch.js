export const genericFetch = async (data) => {
   return fetch('/api/genericRequest', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
         'Content-Type': 'application/json',
      },
   })
      .then(response => (response.status === 204) ? {status: response.status}: response.json())
      .catch(error => error);
};
