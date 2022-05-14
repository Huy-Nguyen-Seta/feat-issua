export const uploadLoginBiometricForm = (url, { method, headers, body }) => fetch(url, {
  method,
  headers,
  body
}).then((res) => res.json());

export const uploadRegisterBiometricForm = (url, { method, credentials, body }) => fetch(url, {
  method,
  credentials,
  body
}).then((res) => res.json());
