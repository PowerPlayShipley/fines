const chai = require('chai')
const requireInject = require('require-inject')

const { name: pkgName } = require('../package.json')

const expect = chai.expect

describe('config', function () {
  describe('env-vars', function () {
    let env;

    before(function () {
      env = process.env
      process.env.PORT = 9000
    })

    after(function () {
      process.env = env
    })

    it('should load a correct var', function () {
      const config = requireInject('../src/config')
      config.load()

      expect(config.get('port')).to.be.eq(9000)
    });
  });

  describe('default values', function () {
    it('should load a correct var', function () {
      const config = requireInject('../src/config')
      config.load()

      expect(config.get('name')).to.be.eq(pkgName)
    });
  });
})
