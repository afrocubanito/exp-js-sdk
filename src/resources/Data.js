'use strict';

const Resource = require('./Resource');
const api = require('../api');

class Data extends Resource {

  static get path () {
    return '/api/data';
  }

  get documentPath () {
    return this.constructor.path + '/' + encodeURIComponent(this.document.group) + '/' + encodeURIComponent(this.document.key);
  }

  get group () {
    return this.document.group;
  }

  get key () {
    return this.document.key;
  }

  get value () {
    return this.document.value;
  }

  set value (value) {
    this.document.value = value;
  }

  static get (group, key, context) {
    if (!key || !group) return Promise.reject(new Error('Key and group are required.'));
    return api.get(this.documentPath).then(document => {
      return new this(document, context);
    });
  }

  static create (document, options, context) {
    options = options || {};
    const resource = new this(document, context);
    if (options.save === false) return resource;
    return api.post(resource.documentPath, null, resource.document).then(document => {
      resource.document = document;
      return resource;
    });
  }

  getChannelName () {
    return 'data' + ':' + this.key + ':' + this.group;
  }

}

module.exports = Data;