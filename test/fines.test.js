const fs = require('fs')
const path = require('path')

const chai = require('chai')
const sinon = require('sinon')
const chaiHttp = require('chai-http')
const requireInject = require('require-inject')

const { nanoid } = require('nanoid')

const mongo = cleanRequire('../src/dao/database')

const expect = chai.expect
chai.use(chaiHttp)

const uri = `${process.env.DB_URI || 'localhost'}/${nanoid()}`

let config;

const createTemplatingContext = (ctx) => Object.keys(ctx).reduce((previousValue, currentValue) => ({ ...previousValue, [`\${{${currentValue}}}`]: ctx[currentValue] }), {})
const replaceRegex = (ctx) => new RegExp(`\\\${{(${Object.keys(ctx).join('|')})}}`, 'gi')

describe('/seasons', function () {

  var app;

  before(async function () {
    config = requireInject('../src/config')
    config.load()

    config.set('database-uri', uri)
    config.set('database-collection', nanoid())
    config.set('zipkin', nanoid())

    try {
      require('../src/utils/zipkin').initialise(config, { logSpan: sinon.spy() })
    } catch (e) { }

    await mongo.connect(config)
  })

  beforeEach(function () {
    app = require('../src/app')(config)
  })

  after(async function () {
    await mongo.close()
  });

  describe('/', function () {
    describe('GET', function () {
      let data;

      before(async () => {
        const ctx = { config: nanoid() }
        const raw = replace(await read(path.join(__dirname, './utils/data/example.season.json')), replaceRegex(ctx), (s) => createTemplatingContext(ctx)[s])
        data = JSON.parse(raw)

        await mongo.insert('seasons')(data)
      })

      it('should get valid seasons', async function () {
        const res = await chai.request(app).get(`/seasons`)

        expect(res).to.be.status(200)

        let body = res.body
        // Need to convert the id to a string
        expect(body.data).to.be.an('array')
        expect(body.data).to.have.lengthOf(1)
      });
    });

    describe('POST', function () {
      describe('valid body', function () {
        it('should create a valid season', async function () {
          const res = await chai.request(app).post('/seasons').send({
            name: 'Powerplay 4\'s',
            config: nanoid(),
            type: 'practice'
          })

          expect(res).to.be.status(201)

          let data = res.body.data
          expect(data.name).to.be.equal('Powerplay 4\'s')
          expect(data.type).to.be.equal('practice')
        });
      });

      describe('empty body', function () {
        it('should return 404', async function () {
          const res = await chai.request(app).post('/seasons').send({})
          expect(res).to.be.status(400)
        });
      });

      describe('invalid body', function () {
        it('should throw a 422', async function () {
          const res = await chai.request(app).post('/seasons').send({
            name: 'Powerplay 4\'s',
            type: 'practice'
          })

          expect(res).to.be.status(422)
        });
      });
    });
  });

  describe('/:season', function () {

    let data;

    before(async () => {
      const ctx = { config: nanoid() }
      const raw = replace(await read(path.join(__dirname, './utils/data/example.season.json')), replaceRegex(ctx), (s) => createTemplatingContext(ctx)[s])
      data = JSON.parse(raw)

      await mongo.insert('seasons')(data)
    })

    it('should get with id', async function () {
      const res = await chai.request(app).get(`/seasons/${data._id}`)

      // console.log(res)
      expect(res).to.be.status(200)

      let body = res.body
      // Need to convert the id to a string
      expect(body.data).to.be.deep.eq({...data, _id: data._id.toString()})
    });

    it('should update the season data', async function () {
      const res = await chai.request(app).patch(`/seasons/${data._id}`).send([
        {
          "op": "replace",
          "path": "/type",
          "value": "league"
        }
      ])

      expect(res).to.be.status(200)

      // Add the new data for the test
      const updated = {...data, type: 'league'}

      let body = res.body
      // Need to convert the id to a string
      expect(body.data).to.be.deep.eq({ ...updated, _id: updated._id.toString()})
    });

    it('should delete the season data', async function () {
      const res = await chai.request(app).delete(`/seasons/${data._id}`)
      expect(res).to.be.status(204)
    });

  });

  describe('/:season/events', function () {
    describe('GET', function () {
      let data, season = nanoid();

      before(async () => {
        const ctx = { season }
        const raw = replace(await read(path.join(__dirname, './utils/data/example.event.json')), replaceRegex(ctx), (s) => createTemplatingContext(ctx)[s])
        data = JSON.parse(raw)

        await mongo.insert('events')(data)
      })

      it('should get valid events', async function () {
        const res = await chai.request(app).get(`/seasons/${season}/events`)

        expect(res).to.be.status(200)

        let body = res.body
        // Need to convert the id to a string
        expect(body.data).to.be.an('array')
        expect(body.data).to.have.lengthOf(1)
      });
    });

    describe('POST', function () {
      describe('valid body', function () {
        it('should create a valid event', async function () {
          const season = nanoid()
          const res = await chai.request(app).post(`/seasons/${season}/events`).send({
            players: {
              'HW': [[], [], []]
            },
            captains: {
              'HW': [[], [], []]
            },
            round: 1,
            type: 'week',
            season,
          })

          expect(res).to.be.status(201)

          let data = res.body.data
          expect(data.season).to.be.equal(season)
          expect(data.type).to.be.equal('week')
        });
      });

      describe('empty body', function () {
        it('should return 404', async function () {
          const season = nanoid()

          const res = await chai.request(app).post(`/seasons/${season}/events`).send({})
          expect(res).to.be.status(400)
        });
      });

      describe('invalid body', function () {
        it('should throw a 422', async function () {
          const season = nanoid()

          const res = await chai.request(app).post(`/seasons/${season}/events`).send({
            round: 1,
            type: 'practice'
          })

          expect(res).to.be.status(422)
        });
      });
    });
  })

  describe('/:season/events/event', function () {

    let data, season = nanoid();

    before(async () => {
      const ctx = { season }
      const raw = replace(await read(path.join(__dirname, './utils/data/example.event.json')), replaceRegex(ctx), (s) => createTemplatingContext(ctx)[s])
      data = JSON.parse(raw)

      await mongo.insert('events')(data)
    })

    it('should get with id', async function () {
      const res = await chai.request(app).get(`/seasons/${season}/events/${data._id}`)

      // console.log(res)
      expect(res).to.be.status(200)

      let body = res.body
      // Need to convert the id to a string
      expect(body.data).to.be.deep.eq({...data, _id: data._id.toString()})
    });

    it('should update the season data', async function () {
      const res = await chai.request(app).patch(`/seasons/${season}/events/${data._id}`).send([
        {
          "op": "replace",
          "path": "/type",
          "value": "league"
        }
      ])

      expect(res).to.be.status(200)

      // Add the new data for the test
      const updated = {...data, type: 'league'}

      let body = res.body
      // Need to convert the id to a string
      expect(body.data).to.be.deep.eq({ ...updated, _id: updated._id.toString()})
    });

    it('should delete the season data', async function () {
      const res = await chai.request(app).delete(`/seasons/${season}/events/${data._id}`)
      expect(res).to.be.status(204)
    });

  });
})

function cleanRequire (path) {
  delete require.cache[require.resolve(path)]
  return require(path)
}

async function read(filePath) {
  return (await fs.promises.readFile(filePath)).toString('utf-8')
}

/**
 * Replace a template string
 *
 * @param {string} string - the template
 * @param {RegExp} withRegex - The regex to check
 * @param {Function} replacer - The replacer function
 * */
function replace (string, withRegex, replacer) {
  return string.replace(withRegex, replacer)
}
