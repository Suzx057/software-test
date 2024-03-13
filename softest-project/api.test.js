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
  try {
    await axios.post(`${BASE_URL}/login`, { username: 'invalid_user', password: 'password123' });
  } catch (error) {
    expect(error.response.status).toBe(401);
  }
});

test('Invalid login: Invalid password', async () => {
  try {
    await axios.post(`${BASE_URL}/login`, { username: 'user1', password: 'invalid_password' });
  } catch (error) {
    expect(error.response.status).toBe(401);
    expect(error.response.data.error).toBe('Invalid password'); // test message
  }
});


test('Unauthorized access: Missing username', async () => {
  try {
    await axios.post(`${BASE_URL}/login`, { password: 'password123' });
  } catch (error) {
    expect(error.response.status).toBe(401);
  }
});

test('Unauthorized access: Missing password', async () => {
  try{
    await axios.post(`${BASE_URL}/login`, { username: 'user1' });
  } catch(error){
    expect(response.status).toBe(401);
  }
  
});

test('Unauthorized access: Empty credentials', async () => {
  try {
    await axios.post(`${BASE_URL}/login`, { username: '', password: '' });
  } catch (error) {
    expect(error.response.status).toBe(401);
  }
});

test('Unauthorized access: Incorrect combination of username and password', async () => {
  try {
    await axios.post(`${BASE_URL}/login`, { username: 'user1', password: 'wrong_password' });
  } catch (error) {
    expect(error.response.status).toBe(401);
  }
});

test('Unauthorized access: Account locked', async () => {
  try {
    await axios.post(`${BASE_URL}/login`, { username: 'locked_user', password: 'password123' });
  } catch (error) {
    expect(error.response.status).toBe(401);
  }
});

test('Unauthorized access: Account disabled', async () => {
  try {
    await axios.post(`${BASE_URL}/login`, { username: 'disabled_user', password: 'password123' });
  } catch (error) {
    expect(error.response.status).toBe(401);
  }
});


test('Unauthorized access: Account expired', async () => {
  try {
    await axios.post(`${BASE_URL}/login`, { username: 'expired_user', password: 'password123' });
  } catch (error) {
    expect(error.response.status).toBe(401);
  }
});

///////////////////////////////////////////// HTTP ///////////////////////////////////////////////////////////
test('HTTP status codes', async () => {
  // Mocking various HTTP status codes
  mock.onGet(`${BASE_URL}/status/200`).reply(200);


  // Perform a successful authentication (assuming a separate test exists for successful login)
  // Assuming a successful login test sets a variable with the token
  const authResponse = await axios.post(`${BASE_URL}/login`, { username: 'your_username', password: 'your_password' });
  const token = authResponse.data.token;

  // Testing different status codes with authentication
  const responses = await Promise.all([
    axios.get(`${BASE_URL}/status/200`, { headers: { Authorization: `Bearer ${token}` } }),

  ]);
  // Expecting correct status codes
  expect(responses[0].status).toBe(200);
});


/////////////////////////////////  Idempotent  //////////////////////////////////////////////////////////
test('Idempotent property', async () => {
  // Mocking a request that returns the same data on multiple calls
  mock.onGet(`${BASE_URL}/idempotent`).reply(200, { id: 'data1' });

  // Sending two identical requests
  const response1 = await axios.get(`${BASE_URL}/idempotent`);
  const response2 = await axios.get(`${BASE_URL}/idempotent`);

  // Expecting the same data
  expect(response1.data).toEqual(response2.data);
});
/////////////////////////////   safe  //////////////////////////////////////////////////////////////////////
test('Safe property', async () => {
  // Mocking a safe request that does not change server state
  mock.onGet(`${BASE_URL}/safe`).reply(200, { message: 'This is a safe request' });

  // Sending a safe request
  const response = await axios.get(`${BASE_URL}/safe`);

  // Expecting a successful response
  expect(response.status).toBe(200);
  expect(response.data.message).toBe('This is a safe request');
});
//////////////////////////////////////////Functional///////////////////////////////////////////////////////
test('Functional testing', async () => {
  // Mocking a translation API that translates Thai to English
  mock.onPost(`${BASE_URL}/translate`).reply(200, { translated_text: 'Hello' });

  // Sending a Thai text to translate
  const response = await axios.post(`${BASE_URL}/translate`, { text: 'สวัสดี' });

  // Expecting the translated text in English
  expect(response.status).toBe(200);
  expect(response.data.translated_text).toBe('Hello');
});

test('Withdraw: Valid amount', async () => {
  // Mocking a withdrawal response
  mock.onPost(`${BASE_URL}/withdraw`).reply(200, { balance: 100 });

  // Sending a withdrawal request
  const response = await axios.post(`${BASE_URL}/withdraw`, { amount: 50 });

  // Expecting a successful response with updated balance
  expect(response.status).toBe(200);
  expect(response.data.balance).toBe(100); // Assuming original balance was 150
});

test('Deposit: Valid amount', async () => {
  // Mocking a deposit response
  mock.onPost(`${BASE_URL}/deposit`).reply(200, { balance: 200 });

  // Sending a deposit request
  const response = await axios.post(`${BASE_URL}/deposit`, { amount: 100 });

  // Expecting a successful response with updated balance
  expect(response.status).toBe(200);
  expect(response.data.balance).toBe(200); // Assuming original balance was 100
});



test('Withdraw: Invalid amount (negative)', async () => {
  // Sending a withdrawal request with negative amount
  try {
    await axios.post(`${BASE_URL}/withdraw`, { amount: -50 });
  } catch (error) {
    // Expecting a 400 Bad Request response
    expect(error.response.status).toBe(400);
    expect(error.response.data.message).toBe('Invalid withdrawal amount');
  }
});

test('Deposit: Invalid amount (zero)', async () => {
  // Sending a deposit request with zero amount
  try {
    await axios.post(`${BASE_URL}/deposit`, { amount: 0 });
  } catch (error) {
    // Expecting a 400 Bad Request response
    expect(error.response.status).toBe(400);
    expect(error.response.data.message).toBe('Invalid deposit amount');
  }
});

afterAll(() => {
  mock.restore();
});
//test
