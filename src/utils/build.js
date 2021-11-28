const os = require('os')
const build = {}

build.tag = process.env.DOCKER_TAG || undefined
build.sha = (process.env.SOURCE_COMMIT && process.env.SOURCE_COMMIT.substr(0, 7)) || undefined
build.branch = process.env.SOURCE_BRANCH || undefined
build.name = os.hostname()

module.exports = Object.assign({}, build)
