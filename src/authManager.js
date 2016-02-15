'use strict';

const jwt = require('jsonwebtoken');
const EventNode = require('event-node');

class AuthManager extends EventNode {

  constructor () {
    super();
    this.promise = new Promise((resolve, reject) => { this.resolve = resolve; this.reject = reject; });
    this.running = false;
    this.started = false;
  }

  start (options) {
    if (this.started) throw new Error('Manager already started.');
    this.started = true;
    this.running = true;
    this.options = options;
    this.trigger('start');
    this.login();
    return this.promise;
  }

  set (auth) {
    this.onSuccess(auth);
  }

  getSync () {
    if (!this.auth) throw new Error('Not authenticated.');
    return this.auth;
  }

  get () {
    return this.promise;
  }

  abort (error) {
    this.trigger('error', error);
    this.reject(error);
    this.stop();
    this.promise = Promise.reject(error);
  }

  stop () {
    this.trigger('stop');
    this.running = false;
    this.reject(new Error('Manager stopped.'));
    this.promise = Promise.reject(new Error('Manager stopped.'));
  }

  getLoginPayload () {
    if (this.options.type === 'user') {
      return {
        type: 'user',
        username: this.options.username,
        password: this.options.password,
        organization: this.options.organization
      };
    } else if (this.options.type === 'device') {
      return {
        token: jwt.sign({
          type: 'device',
          uuid: this.options.uuid,
          allowPairing: this.options.allowPairing,
        }, this.options.secret || '_')
      };
    } else if (this.options.type === 'consumerApp') {
      return {
        token : jwt.sign({
          type: 'consumerApp',
          uuid: this.options.uuid,
        }, this.options.apiKey)
      };
    }
  }

  login () {
    if (!this.running) return;
    fetch(this.options.host + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.getLoginPayload())
    }).then(response => {
      if (response.status === 401) return this.abort(new Error('Authentication failed. Please check your credentials.'));
      else if (!response.ok) throw new Error();
      return response.json().then(auth => this.set(auth));
    }).catch(() => setTimeout(() => this.login(), 5000));
  }

  refresh () {
    if (!this.running) return;
    fetch(this.options.host + '/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.auth.token
      }
    }).then(response => {
      if (response.status === 401) this.login();
      else if (!response.ok) throw new Error();
      else return response.json().then(auth => this.set(auth));
    }).catch(() => setTimeout(() => this.refresh(), 5000));
  }

  onSuccess (auth) {
    if (!this.running) return;
    setTimeout(() => this.refresh(), (auth.expiration - Date.now()) / 2);
    this.auth = auth;
    this.trigger('update', auth);
    this.resolve(auth);
    this.promise = Promise.resolve(auth);
  }

}

module.exports = new AuthManager();