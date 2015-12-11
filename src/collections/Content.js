'use strict';

const Collection = require('../lib/Collection');
const ContentResource = require('../resources/Content');

class Content extends Collection {

  constructor (api, context) {
    super(api, context);
    this.path = '/api/content';
    this.Resource = ContentResource;
  }

}

module.exports = Content;
