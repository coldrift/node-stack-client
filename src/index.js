
import URL from 'url';
import { escape } from 'querystring';
import https from 'https';

import Promise from 'bluebird';

const WEBDAV_PATH = '/remote.php/webdav/';

class StackClient {

  constructor(base_url, username, password, options) {

    if(!base_url) {
      throw new Error('You must specify Stack base URL')
    }

    try {
      this.base_url = URL.parse(base_url)
    }
    catch(err) {
      throw new Error('Invalid Stack base URL: ' + err.message)
    }

    if(typeof(username) === 'string') {
      this.base_url.username = username
    }
    else {
      options = username;
    }

    if(typeof(password) === 'string') {
      this.base_url.password = password
    }
    else {
      options = password;
    }

    if(!this.base_url.username) {
      throw new Error('You must specify Stack username')
    }

    if(!this.base_url.password) {
      throw new Error('You must specify Stack password')
    }

    this.options = options || {}
  }

  _request(method, path) {
    return new Promise((resolve, reject) => {

      const headers = clone(this.options.headers || {})

      headers['Authorization'] = get_authorization_header(this.base_url)

      const options = {
        method,
        hostname: this.base_url.hostname,
        path: WEBDAV_PATH + escape(path),
        headers
      };

      const request = https.request(options);

      request.on('response', response => {

        response.on('aborted', err => {
          reject(err)
        })

        response.on('error', err => {
          reject(err)
        })

        response.on('data', data => {})

        response.on('end', () => {

          if (response.statusCode > 299) {
            const err = new Error('Stack HTTP error ' + response.statusCode)
            return reject(err);
          }

          resolve(response);
        });
      });

      request.on('error', err => {
        reject(err);
      });

      request.end();
    })
  }

  mkdir(path) {
    return this._request('MKCOL', path)
  }

  delete(path) {
    return this._request('DELETE', path)
  }

  createWriteStream(path, cb) {

    if(typeof(cb) !== 'function') {
      cb = () => {}
    }

    const headers = clone(this.options.headers || {})

    headers['Authorization'] = get_authorization_header(this.base_url)

    const options = {
      method: 'PUT',
      hostname: this.base_url.hostname,
      path: WEBDAV_PATH + escape(path),
      headers
    };

    const request = https.request(options);

    var body;

    request.on('response', (response) => {

      response.on('data', (data) => {
        body = body ? Buffer.concat([body, data]) : data;
      });

      response.on('end', () => {

        if (response.statusCode > 299) {
          const err = new Error('Stack HTTP error ' + response.statusCode)
          return cb(err);
        }

        response.body = body;
        cb(null, response);
      });
    });

    request.on('error', (err) => {
      cb(err);
    });

    return request
  }
}

function get_authorization_header(base_url) {
  const username = base_url.username
  const password = base_url.password
  return 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
}

function clone(object) {
  var r = {}

  for(let key in object) {
    r[key] = object[key]
  }

  return r;
}

module.exports = StackClient;
