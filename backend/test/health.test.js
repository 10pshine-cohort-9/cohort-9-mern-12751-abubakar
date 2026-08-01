const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
chai.use(chaiHttp);
const { expect } = chai;

describe('GET /api/health', () => {
  it('should return OK', async () => {
    try {  
    const res = await chai.request(app).get('/api/health');
    expect(res).to.have.status(200);
    expect(res.body.status).to.equal('OK');
    } catch (err) {
      throw new Error('GET /api/health failed', { cause: err });
    }
  });
});