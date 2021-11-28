/**
 * Test anything that's not being tested
 * */

const EventEmitter = require('events').EventEmitter

const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiPromise = require('chai-as-promised')

const requireInject = require('require-inject')

const expect = chai.expect

// Since its a one time run
const database = requireInject('../src/dao/database')
const promiseOrCallback = require('../src/dao/utils/promiseOrCallback')

chai.use(chaiHttp)
chai.use(chaiPromise)

describe('utils', function () {

  // Might move this to a dependency
  describe('promiseAllCallback', function () {
    describe('promise', function () {
      it('should return a promise', async function () {
        const returnValue = await promiseOrCallback(null, (cb) => {
          cb(null, true)
        })

        expect(returnValue).to.be.true
      });

      it('should throw the error', function (done) {
        const throwing = promiseOrCallback(null, (cb) => {
          cb(new Error('Throwing'))
        })

        expect(throwing).to.be.rejected.and.notify(done);
      });

      it('should have multiple then arguments', async function () {
        const returnValue = await promiseOrCallback(null, (cb) => {
          cb(null, true, false)
        })

        expect(returnValue).to.instanceOf(Array)
      });
    });

    describe('callback', function () {
      it('should have return null error', function (done) {
        const callback = (error, value) => {
          expect(error).to.be.null
          done()
        }

        promiseOrCallback(callback, (cb) => {
          cb(null, true)
        })
      });

      it('should have return error', function (done) {
        const callback = (error, value) => {
          expect(error).to.not.be.null
          done()
        }

        promiseOrCallback(callback, (cb) => {
          cb(new Error('error'))
        })
      });
    });

    describe('error-emitter', function () {
      it('should emit error', function (done) {
        const emitter = new EventEmitter()
        emitter.on('error', (error) => {
          expect(error).to.not.be.null
          done()
        })

        // Never called but needed
        const callback = () => { }
        promiseOrCallback(callback, (cb) => {
          cb(new Error('error'))
        }, emitter)
      });

      it('should emit error with promise', function (done) {
        const emitter = new EventEmitter()
        emitter.on('error', (error) => {
          expect(error).to.not.be.null
          done()
        })

        // Never called but needed
        const callback = () => { }
        const fail = () => expect.fail()
        promiseOrCallback(null, (cb) => {
          cb(new Error('error'))
        }, emitter).then(fail).catch(callback)
      });
    });
  });

  describe('database.close', function () {
    it('should callback', function (done) {
      database.close(done)
    });
  });
});
