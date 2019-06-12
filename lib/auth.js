'use strict';

const querystring = require('querystring');
const utility = require('utility');
const assert = require('assert');
const crypto = require('crypto');
const urllib = require('urllib');
const open = require('opn');

const LARK_HOST = 'https://www.yuque.com';

module.exports = params => {
  assert(params.clientId, 'clientId required');
  assert(params.clientSecret, 'clientSecret required');

  const log = params.log || console.log;
  const host = params.host || LARK_HOST;
  const clientId = params.clientId;
  const clientSecret = params.clientSecret;

  const query = {
    client_id: clientId,
    scope: params.scope || '',
    code: utility.randomString(40),
    response_type: 'code',
    timestamp: Date.now(),
  };
  query.sign = sign(query, clientSecret);
  const url = `${host}/oauth2/authorize?${querystring.stringify(query)}`;
  return open(url, { wait: false }).catch(err => {
    log(`[yuque-auth][WARING] 尝试自动打开浏览器失败: ${err.message}`);
    log(`[yuque-auth][WARING] 请复制链接到浏览器中打开完成授权: ${url}`);
  }).then(() => getToken({ clientId, host, code: query.code }));
};

function getToken({ clientId, host, code }) {
  return new Promise((resolve, reject) => {
    const url = `${host}/oauth2/token`;
    const interval = 3000;
    const maxRetry = 20; // 120s 超时
    let timer = null;
    let retry = 0;
    let error;

    timer = setInterval(request, interval);

    function request() {
      retry++;
      if (retry > maxRetry) {
        error = new Error('request token timeout');
        return done();
      }

      urllib.request(url, {
        method: 'POST',
        dataType: 'json',
        data: { code, client_id: clientId, grant_type: 'client_code' },
      }).then(res => {
        if (res.status !== 200 && res.status !== 400) {
          error = new Error(`request yuque server with error status ${res.status}`);
          return;
        }

        error = null;
        if (res.status === 200) {
          done(res.data);
          return;
        }
      }).catch(err => {
        error = err;
      });
    }

    function done(token) {
      clearInterval(timer);
      if (token) return resolve(token);
      if (error) return reject(error);
    }
  });
}

function sign(query, secret) {
  const signString = [
    'client_id', 'code', 'response_type', 'scope', 'timestamp',
  ].map(key => `${key}=${encodeURIComponent(query[key] || '')}`).join('&');
  return crypto.createHmac('sha1', secret)
    .update(signString)
    .digest()
    .toString('base64');
}
