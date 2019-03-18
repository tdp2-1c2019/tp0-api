const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;

chai.use(chaiHttp);
const url= `http://localhost:${process.env.PORT || 3000}`;
const requester = chai.request(url);

const server = require('./i');


describe('Books API', function() {
  this.timeout(0);

  after(function() {
    server.close();
  });

  it('Should demand to be called with parameter q', async function() {
    const response = await requester.get('/api/books');

    expect(response).to.have.status(500);

    const data = response.body;

    expect(data).to.have.property('message').to.equal('FALTA Q');
  });

  it('Should return empty array when no books found', async function () {
    const response = await requester.get('/api/books?q=sdgjshagjkasdgsdfgfghad');

    expect(response).to.have.status(200);

    const data = response.body;

    expect(data).to.have.property('totalItems').to.equal(0);
    expect(data).to.have.property('items').to.be.an('array').that.is.empty;
  });

  it('Should return some results when found', async function () {
    const response = await requester.get('/api/books?q=sadgasgas');

    expect(response).to.have.status(200);

    const data = response.body;

    expect(data).to.have.property('totalItems').to.greaterThan(0);
    expect(data).to.have.property('items').to.be.an('array').that.is.not.empty;
  });

  it('Should return book data', async function () {
    const response = await requester.get('/api/books?q=sadgasgas');

    const book = response.body.items[0];

    expect(book).to.have.property('name').to.be.a('string');
    expect(book).to.have.property('cover').to.be.a('string');
    expect(book).to.have.property('authors').to.be.an('array');
    expect(book).to.have.property('description').to.be.a('string');
    expect(book).to.have.property('categories').to.be.an('array');
    expect(book).to.have.property('downloadLink').to.be.a('string');
  });

  it('Should return maximum of 100 results', async function () {
    const response = await requester.get('/api/books?q=harry');

    expect(response).to.have.status(200);

    const data = response.body;

    expect(data).to.have.property('totalItems').to.equal(100);
    expect(data).to.have.property('items').to.be.an('array').to.have.lengthOf(100);
  });
});