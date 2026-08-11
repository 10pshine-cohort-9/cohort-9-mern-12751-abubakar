const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const Note = require('../models/Note');
const User = require('../models/User');

chai.use(chaiHttp);
const { expect } = chai;

const registerAndGetUser = async (userData) => {
  const res = await chai.request(app)
    .post('/api/auth/register')
    .send(userData);
  return res.body.data;
};

describe('Notes API', () => {
  let token;
  let primaryUser;
  let otherUser;

  beforeEach(async () => {
    await Note.deleteMany({});
    await User.deleteMany({});

    primaryUser = await registerAndGetUser({
      fullName: 'Note Tester',
      email: 'notetester@example.com',
      password: '123456',
    });
    token = primaryUser.token;

    otherUser = await registerAndGetUser({
      fullName: 'Other User',
      email: 'other@example.com',
      password: '123456',
    });
  });

  describe('POST /api/notes', () => {
    it('should create a new note', async () => {
      const res = await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Note', content: '<p>Hello</p><script>alert(1)</script>' });

      expect(res).to.have.status(201);
      expect(res.body.data).to.have.property('_id');
      expect(res.body.data.title).to.equal('My Note');
      expect(res.body.data.content).to.not.include('<script>');
      expect(res.body.data.user).to.equal(String(primaryUser._id));
    });

    it('should fail without token', async () => {
      const res = await chai.request(app)
        .post('/api/notes')
        .send({ title: 'No auth' });
      expect(res).to.have.status(401);
    });

    it('should fail with missing title', async () => {
      const res = await chai.request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Missing title' });
      expect(res).to.have.status(400);
    });
  });

  describe('GET /api/notes', () => {
    beforeEach(async () => {
      await Note.create([
        { title: 'Note 1', content: 'Content 1', user: primaryUser._id },
        { title: 'Note 2', content: 'Content 2', user: primaryUser._id },
        { title: 'Other Note', content: 'Other Content', user: otherUser._id },
      ]);
    });

    it('should return only user notes', async () => {
      const res = await chai.request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body.data).to.have.length(2);
    });

    it('should search notes', async () => {
      const res = await chai.request(app)
        .get('/api/notes?search=Note 1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.data).to.have.length(1);
      expect(res.body.data[0].title).to.equal('Note 1');
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should return note if owner', async () => {
      const note = await Note.create({
        title: 'Secret',
        content: 'Secret content',
        user: primaryUser._id,
      });

      const res = await chai.request(app)
        .get(`/api/notes/${note._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(200);
    });

    it('should return 404 if not owner', async () => {
      const note = await Note.create({
        title: 'Not yours',
        content: 'Content',
        user: otherUser._id,
      });

      const res = await chai.request(app)
        .get(`/api/notes/${note._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(404);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update note', async () => {
      const note = await Note.create({
        title: 'Old',
        content: 'Old',
        user: primaryUser._id,
      });

      const before = await Note.findById(note._id);

      const res = await chai.request(app)
        .put(`/api/notes/${note._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });

      expect(res).to.have.status(200);
      expect(res.body.data.title).to.equal('Updated');
      const after = await Note.findById(note._id);
      expect(after.updatedAt.getTime()).to.be.greaterThan(before.updatedAt.getTime());
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete note', async () => {
      const note = await Note.create({
        title: 'Delete me',
        content: 'Bye',
        user: primaryUser._id,
      });

      const res = await chai.request(app)
        .delete(`/api/notes/${note._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res).to.have.status(200);
      const found = await Note.findById(note._id);
      expect(found).to.be.null;
    });
  });
});