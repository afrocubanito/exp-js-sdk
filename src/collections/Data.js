'use strict';

const Collection = require('../lib/Collection');
const Resource = require('../lib/Resource');

class Data extends Collection {

  constructor (api, context) {
    super(api, context);
    this.path = '/api/data';
    this.Resource = Resource;
  }

}

module.exports = Data;
