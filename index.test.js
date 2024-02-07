import request from 'supertest';
import bcrypt from 'bcrypt';
import app from './index.js'; 

describe('Registrasi dan Login', () => {
  const userData = {
    username: 'testuser',
    password: 'testpassword'
  };

  let hashedPassword; 

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash(userData.password, 10);
  });

  it('Mendaftarkan pengguna baru', async () => {
    const response = await request(app)
      .post('/register')
      .send(userData)
      .expect(201);

    expect(response.text).toBe('User registered successfully');
  });

  it('Login pengguna yang telah terdaftar', async () => {
    const response = await request(app)
      .post('/login')
      .send(userData)
      .expect(200);

    expect(response.text).toBe('Login successful');
  });

  it('Gagal login dengan password yang salah', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: userData.username,
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.text).toBe('Incorrect password');
  });

  it('Gagal login dengan pengguna yang tidak terdaftar', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'nonexistentuser',
        password: 'anypassword'
      })
      .expect(401);

    expect(response.text).toBe('User not found');
  });
});
