const fines = {
  type: 'array',
  items: {
    type: 'array',
    items: {
      type: 'string'
    }
  }
}

const event = {
  type: 'object',
  required: [
    'season',
    'round',
    'type'
  ],
  properties: {
    season: {
      type: 'string'
    },
    round: {
      type: 'number'
    },
    players: {
      type: 'object',
      patternProperties: {
        '^.*$': fines
      },
      additionalProperties: true
    },
    captains: {
      type: 'object',
      patternProperties: {
        '^.*$': fines
      },
      additionalProperties: true
    },
    type: {
      type: 'string',
      enum: [
        'week', 'round', 'block'
      ]
    }
  }
}

const season = {
  type: 'object',
  required: [
    'name',
    'config',
    'type'
  ],
  properties: {
    name: {
      type: 'string'
    },
    config: {
      type: 'string'
    },
    center: {
      type: 'string'
    },
    type: {
      type: 'string',
      enum: ['league', 'tournament']
    },
  }
}

module.exports = {
  season, event,
}
