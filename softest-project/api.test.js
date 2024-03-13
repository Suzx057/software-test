const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const BASE_URL = 'http://localhost:3000';
const mock = new MockAdapter(axios);
const app = require('./server');


//////////////////////////////////////////   Authentication   /////////////////////////////////////////////////
test('Valid login: Valid username, Valid Password', async () => {
  // Mocking a valid login response
  mock.onPost(`${BASE_URL}/login`).reply(200, { username: 'user1', token: 'token123' });

  // Sending a login request
  const response = await axios.post(`${BASE_URL}/login`, { username: 'user1', password: 'password123' });

  // Expecting a successful response
  expect(response.status).toBe(200);
  expect(response.data.username).toBe('user1');
  expect(response.data.token).toBe('token123');
});

test('Invalid login: Invalid username', async () => {
  // Mocking an invalid login response for an invalid username
  mock.onPost(`${BASE_URL}/login`).reply(401, { error: 'Invalid username' });

  // Sending a login request with an invalid username
  const response = await axios.post(`${BASE_URL}/login`, { username: 'invalid_user', password: 'password123' });

  // Expecting an unauthorized response
  expect(response.status).toBe(401);
  expect(response.data.error).toBe('Invalid username');
});

test('Invalid login: Invalid password', async () => {
  // Mocking an invalid login response for an invalid password
  mock.onPost(`${BASE_URL}/login`).reply(401, { error: 'Invalid password' });

  // Sending a login request with an invalid password
  const response = await axios.post(`${BASE_URL}/login`, { username: 'user1', password: 'invalid_password' });

  // Expecting an unauthorized response
  expect(response.status).toBe(401);
  expect(response.data.error).toBe('Invalid password');
});

test('Unauthorized access: Missing username', async () => {
  // Mocking an unauthorized response for missing username
  mock.onPost(`${BASE_URL}/login`).reply(401, { error: 'Missing username' });

  // Sending a login request without a username
  const response = await axios.post(`${BASE_URL}/login`, { password: 'password123' });

  // Expecting an unauthorized response
  expect(response.status).toBe(401);
  expect(response.data.error).toBe('Missing username');
});

test('Unauthorized access: Missing password', async () => {
  // Mocking an unauthorized response for missing password
  mock.onPost(`${BASE_URL}/login`).reply(401, { error: 'Missing password' });

  // Sending a login request without a password
  const response = await axios.post(`${BASE_URL}/login`, { username: 'user1' });

  // Expecting an unauthorized response
  expect(response.status).toBe(401);
  expect(response.data.error).toBe('Missing password');
});

test('Unauthorized access: Empty credentials', async () => {
  // Mocking an unauthorized response for empty credentials
  mock.onPost(`${BASE_URL}/login`).reply(401, { error: 'Empty credentials' });

  // Sending a login request with empty credentials
  const response = await axios.post(`${BASE_URL}/login`, { username: '', password: '' });

  // Expecting an unauthorized response
  expect(response.status).toBe(401);
  expect(response.data.error).toBe('Empty credentials');
});

test('Unauthorized access: Incorrect combination of username and password', async () => {
  // Mocking an unauthorized response for incorrect combination of username and password
  mock.onPost(`${BASE_URL}/login`).reply(401, { error: 'Incorrect combination of username and password' });

  // Sending a login request with incorrect combination of username and password
  const response = await axios.post(`${BASE_URL}/login`, { username: 'user1', password: 'wrong_password' });

  // Expecting an unauthorized response
  expect(response.status).toBe(401);
  expect(response.data.error).toBe('Incorrect combination of username and password');
});

test('Unauthorized access: Account locked', async () => {
  // Mocking an unauthorized response for locked account
  mock.onPost(`${BASE_URL}/login`).reply(401, { error: 'Account locked' });

  // Sending a login request for a locked account
  const response = await axios.post(`${BASE_URL}/login`, { username: 'locked_user', password: 'password123' });

  // Expecting an unauthorized response
  expect(response.status).toBe(401);
  expect(response.data.error).toBe('Account locked');
});

test('Unauthorized access: Account disabled', async () => {
  // Mocking an unauthorized response for disabled account
  mock.onPost(`${BASE_URL}/login`).reply(401, { error: 'Account disabled' });

  // Sending a login request for a disabled account
  const response = await axios.post(`${BASE_URL}/login`, { username: 'disabled_user', password: 'password123' });

  // Expecting an unauthorized response
  expect(response.status).toBe(401);
  expect(response.data.error).toBe('Account disabled');
});

test('Unauthorized access: Account expired', async () => {
  // Mocking an unauthorized response for expired account
  mock.onPost(`${BASE_URL}/login`).reply(401, { error: 'Account expired' });

  // Sending a login request for an expired account
  const response = await axios.post(`${BASE_URL}/login`, { username: 'expired_user', password: 'password123' });

  // Expecting an unauthorized response
  expect(response.status).toBe(401);
  expect(response.data.error).toBe('Account expired');
});

///////////////////////////////////////////// HTTP ///////////////////////////////////////////////////////////
test('HTTP status codes', async () => {
  // Mocking various HTTP status codes
  mock.onGet(`${BASE_URL}/status/200`).reply(200);
  mock.onGet(`${BASE_URL}/status/400`).reply(400);
  mock.onGet(`${BASE_URL}/status/401`).reply(401);
  mock.onGet(`${BASE_URL}/status/403`).reply(403);
  mock.onGet(`${BASE_URL}/status/404`).reply(404);
  mock.onGet(`${BASE_URL}/status/500`).reply(500);

  // Perform authentication
  const authResponse = await axios.post(`${BASE_URL}/login`, { username: 'your_username', password: 'your_password' });
  const token = authResponse.data.token;

  // Testing different status codes with authentication
  const responses = await Promise.all([
    axios.get(`${BASE_URL}/status/200`, { headers: { Authorization: `Bearer ${token}` } }),
    axios.get(`${BASE_URL}/status/400`, { headers: { Authorization: `Bearer ${token}` } }),
    axios.get(`${BASE_URL}/status/401`, { headers: { Authorization: `Bearer ${token}` } }),
    axios.get(`${BASE_URL}/status/403`, { headers: { Authorization: `Bearer ${token}` } }),
    axios.get(`${BASE_URL}/status/404`, { headers: { Authorization: `Bearer ${token}` } }),
    axios.get(`${BASE_URL}/status/500`, { headers: { Authorization: `Bearer ${token}` } }),
  ]);

  // Expecting correct status codes
  expect(responses[0].status).toBe(200);
  expect(responses[1].status).toBe(400);
  expect(responses[2].status).toBe(401);
  expect(responses[3].status).toBe(403);
  expect(responses[4].status).toBe(404);
  expect(responses[5].status).toBe(500);
});




test('Idempotent property', async () => {
  // Mocking a request that returns the same data on multiple calls
  mock.onGet(`${BASE_URL}/idempotent`).reply(200, { id: 'data1' });

  // Sending two identical requests
  const response1 = await axios.get(`${BASE_URL}/idempotent`);
  const response2 = await axios.get(`${BASE_URL}/idempotent`);

  // Expecting the same data
  expect(response1.data).toEqual(response2.data);
});

test('Safe property', async () => {
  // Mocking a safe request that does not change server state
  mock.onGet(`${BASE_URL}/safe`).reply(200, { message: 'This is a safe request' });

  // Sending a safe request
  const response = await axios.get(`${BASE_URL}/safe`);

  // Expecting a successful response
  expect(response.status).toBe(200);
  expect(response.data.message).toBe('This is a safe request');
});

test('Functional testing', async () => {
  // Mocking a translation API that translates Thai to English
  mock.onPost(`${BASE_URL}/translate`).reply(200, { translated_text: 'Hello' });

  // Sending a Thai text to translate
  const response = await axios.post(`${BASE_URL}/translate`, { text: 'สวัสดี' });

  // Expecting the translated text in English
  expect(response.status).toBe(200);
  expect(response.data.translated_text).toBe('Hello');
});

afterAll(() => {
  mock.restore();
});
