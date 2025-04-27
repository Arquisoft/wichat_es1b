const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./user-model');


let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./user-service'); 
});

afterAll(async () => {
    app.close();
    await mongoServer.stop();
});

describe('User Service', () => {
  it('should add a new user on POST /adduser', async () => {
    const newUser = {
      username: 'testuser',
      password: 'testpassword',
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');

    // Check if the user is inserted into the database
    const userInDb = await User.findOne({ username: 'testuser' });

    // Assert that the user exists in the database
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe('testuser');

    // Assert that the password is encrypted
    const isPasswordValid = await bcrypt.compare('testpassword', userInDb.password);
    expect(isPasswordValid).toBe(true);
  });

  describe('Validaciones de error en /adduser', () => {
    it('debería devolver error por validaciones de campos requeridos y username inválido', async () => {
      // Faltan campos requeridos (línea 24)
      let response = await request(app).post('/adduser').send({});
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toMatch(/Missing required field/);
  
      // Username no es string (línea 30)
      response = await request(app).post('/adduser').send({ username: 12345, password: 'testpassword' });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toMatch(/Invalid username format/);
  
      // Username vacío o mayor de 50 caracteres (línea 36)
      response = await request(app).post('/adduser').send({ username: ' '.repeat(51), password: 'testpassword' });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toMatch(/Invalid username/);
  
      // Username con caracteres no permitidos (línea 41)
      response = await request(app).post('/adduser').send({ username: 'user with spaces', password: 'testpassword' });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toMatch(/Invalid username format/);
  
      // Crear un usuario correcto primero
      await request(app).post('/adduser').send({ username: 'validuser', password: 'testpassword' });
  
      // Intentar crear el mismo usuario otra vez (línea 46)
      response = await request(app).post('/adduser').send({ username: 'validuser', password: 'testpassword' });
      expect(response.statusCode).toBe(400);
      expect(response.body.error).toMatch(/Username already exists/);
    });
  });
  
});
