## yuque-auth

语雀第三方应用的客户端鉴权客户端。

### install

```bash
tnpm install yuque-auth
```

### Usage

```js
const { auth } = require('yuque-auth');

auth({
  // clientId 和 clientSevret在 oauth 应用中可查到
  clientId,
  clientSecret,
  scope: 'repo,doc',
}).then(res => {
  console.log('get auth', res);
  //{ access_token: 'Y1iwvwUPI4M67VjWRGHAzgq7gzB4a21EV3jOhyFf', token_type: 'bearer', scope: 'repo,doc' }
}).catch(err => {
  console.log('error happend', err.stack);
});
```
