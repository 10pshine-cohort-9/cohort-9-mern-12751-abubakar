const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const User = require('../models/User');

chai.use(chaiHttp);
const { expect } = chai;

describe('Auth API', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: '123456',
        });

      expect(res).to.have.status(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property('token');
      expect(res.body.data).to.have.property('email', 'test@example.com');
      expect(res.body.data).to.not.have.property('password');
    });

    it('should not register with duplicate email', async () => {
      await User.create({
        fullName: 'Existing',
        email: 'duplicate@example.com',
        password: '123456',
      });

      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'New',
          email: 'duplicate@example.com',
          password: '123456',
        });

      expect(res).to.have.status(409);
      expect(res.body.success).to.be.false;
      expect(res.body.error).to.include('already registered');
    });

    it('should fail if required fields are missing', async () => {
      const res = await chai.request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' }); // missing fullName and password

      expect(res).to.have.status(400); // or whatever validation you add
      expect(res.body.success).to.be.false;
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        fullName: 'Login User',
        email: 'login@example.com',
        password: '123456',
      });
    });

    it('should login with correct credentials', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: '123456' });

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property('token');
    });

    it('should not login with wrong password', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrong' });

      expect(res).to.have.status(401);
      expect(res.body.success).to.be.false;
    });

    it('should not login with non-existent email', async () => {
      const res = await chai.request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: '123456' });

      expect(res).to.have.status(401);
      expect(res.body.success).to.be.false;
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile when authenticated', async () => {
      // First, register a user
      const registerRes = await chai.request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Profile User',
          email: 'profile@example.com',
          password: '123456',
        });

      const token = registerRes.body.data.token;

      const res = await chai.request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body.data).to.have.property('email', 'profile@example.com');
    });

    it('should fail without token', async () => {
      const res = await chai.request(app).get('/api/auth/me');
      expect(res).to.have.status(401);
      expect(res.body.success).to.be.false;
    });
  });
});