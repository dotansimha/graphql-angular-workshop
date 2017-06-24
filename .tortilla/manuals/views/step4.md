# Step 4: Fetch data from GitHub

Now that we have our app working with mocks, we would like change the mocks with real data, taken from GitHub.

## Setup

- Create a github API token for your user here - [https://github.com/settings/tokens/new]
  Enter a description, then check the user scope and press "Generate token" button.

- Create two constants on `server/index.js` file. One will hold you github login and the second will hold the token you've
  just created.

```javascript
const GITHUB_LOGIN = 'YOUR_GITHUB_USERNAME_HERE';
const GITHUB_ACCESS_TOKEN = 'YOUR_GITHUB_TOKEN_HERE';
```

## Create a GitHub connector class

- Create a new file under `server` directory, named `github-connector.js`. This file will hold everything that is needed in order to
  get data from the GitHub API. To do our REST calls we will use `fetch` from `node-fetch`.

```javascript
const fetch = require('node-fetch');
```

- Defining our `GithubConnector` class we will require the github's access token and save that on our instance:

```javascript
class GithubConnector {
  constructor( accessToken ) {
    this.accessToken = accessToken;
  }
}

module.exports = {
  GithubConnector,
};
```

- First we need a way to get any user object using the `login` string. GitHub's REST Api defines this as a GET to the
  `/users/{login}` route. We will do just that while passing the responsibility of making the request and parsing the
  result to another method we will call `getFromGithub`.

```javascript
class GithubConnector {
  getUserForLogin( login ) {
    return this.getFromGithub(`/users/${login}`);
  }
}
```

- In order to fulfill our schema needs, we also got to have a way to get a certain user's following list. Github defines
  that similarly as GET to `/users/{login}/following`. Following is a list and we've already specifies in our schema, a way
  to control the results of this list. So we can require page and items per page here, and pass them to Github.

```javascript
class GithubConnector {
  getFollowingForLogin( login, page, perPage ) {
    return this.getFromGithub(`/users/${login}/following`, page, perPage);
  }
}
```

- All those requests will happen from this `getFromGithub` method. We will define it as
  `(relativeUrl, page, perPage) => Promise<Object | Array>`. We use `fetch` to make the GET request use the `result.json()`
   method to get a parsed body object. We build the url using Github's API url `'https://api.github.com'` and add at the
   end `access_token` parameter. The responsibility of adding paginating parameters to the url, we transfer to a
   dedicated `paginate` method.


This is how the final GitHub connection class should look like:

[{]: <helper> (diffStep 4.2)

#### Step 4.2: Added GitHub connector class

##### Added server&#x2F;src&#x2F;github-connector.js
```diff
@@ -0,0 +1,38 @@
+┊  ┊ 1┊const fetch = require('node-fetch');
+┊  ┊ 2┊
+┊  ┊ 3┊class GithubConnector {
+┊  ┊ 4┊  constructor( accessToken ) {
+┊  ┊ 5┊    this.accessToken = accessToken;
+┊  ┊ 6┊  }
+┊  ┊ 7┊
+┊  ┊ 8┊  getUserForLogin( login ) {
+┊  ┊ 9┊    return this.getFromGithub(`/users/${login}`);
+┊  ┊10┊  }
+┊  ┊11┊
+┊  ┊12┊  getFollowingForLogin( login, page, perPage ) {
+┊  ┊13┊    return this.getFromGithub(`/users/${login}/following`, page, perPage);
+┊  ┊14┊  }
+┊  ┊15┊
+┊  ┊16┊  getFromGithub( relativeUrl, page, perPage ) {
+┊  ┊17┊    const url = `https://api.github.com${relativeUrl}?access_token=${this.accessToken}`;
+┊  ┊18┊    return fetch(this.paginate(url, page, perPage)).then(res => res.json());
+┊  ┊19┊  }
+┊  ┊20┊
+┊  ┊21┊  paginate( url, page, perPage ) {
+┊  ┊22┊    let transformed = url.indexOf('?') !== -1 ? url : url + '?';
+┊  ┊23┊
+┊  ┊24┊    if ( page ) {
+┊  ┊25┊      transformed = `${transformed}&page=${page}`
+┊  ┊26┊    }
+┊  ┊27┊
+┊  ┊28┊    if ( perPage ) {
+┊  ┊29┊      transformed = `${transformed}&per_page=${perPage}`
+┊  ┊30┊    }
+┊  ┊31┊
+┊  ┊32┊    return transformed;
+┊  ┊33┊  }
+┊  ┊34┊}
+┊  ┊35┊
+┊  ┊36┊module.exports = {
+┊  ┊37┊  GithubConnector,
+┊  ┊38┊};🚫↵
```

[}]: #

- Our schema resolvers will be able to use the `GithubConnector` class, using a context object that is created in
  index.js and is passed into `graphqlExpress` middleware. Note that `user` field is also part of `context` and it holds
  the current user's github login. On a real setup, this will be created for every session after authenticating the user.

[{]: <helper> (diffStep 4.3)

#### Step 4.3: Extend GraphQL execution context with GitHub connector instance

##### Changed server&#x2F;src&#x2F;index.js
```diff
@@ -2,6 +2,7 @@
 ┊2┊2┊const bodyParser = require('body-parser');
 ┊3┊3┊const morgan = require('morgan');
 ┊4┊4┊const cors = require('cors');
+┊ ┊5┊const { GithubConnector } = require('./github-connector');
 ┊5┊6┊const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
 ┊6┊7┊
 ┊7┊8┊const { Schema } = require('./schema');
```
```diff
@@ -16,6 +17,10 @@
 ┊16┊17┊
 ┊17┊18┊app.use('/graphql', bodyParser.json(), graphqlExpress({
 ┊18┊19┊  schema: Schema,
+┊  ┊20┊  context: {
+┊  ┊21┊    githubConnector: new GithubConnector(GITHUB_ACCESS_TOKEN),
+┊  ┊22┊    user: { login: GITHUB_LOGIN },
+┊  ┊23┊  }
 ┊19┊24┊}));
 ┊20┊25┊
 ┊21┊26┊app.use('/graphiql', graphiqlExpress({
```

[}]: #

## Replace mocks with real data

- Up until now, our schema used mocks to resolve the queried data. Now, we would like to tell our schema how it can acquire
  some real data.

- On `schema.js` create an empty object called `resolvers` and pass it into `makeExecutableSchema`.

```javascript
const resolvers = {};
const Schema = makeExecutableSchema({typeDefs, resolvers});
```

- Now let's specify how to resolve the `Query` type. the first and only field we have on `Query` is `me`. The resolver
  function is being called by the graphql `execute` function with four argument. The `value` passed from the parent resolver.
  The `argumnets` (or `args`) passed as the field arguments. The `context` object we defined on our index.js file. And lastly
  the schema definition and other specific request information. The last argument is used mostly in framework like `join-monster`
  which allows optimization of sql database queries. It is out of our scope.

- For resolving `me` we use the githubConnector we added to the `context` object. We are using the `getUserForLogin`,
  and passing it the logged in user that we also added to `context`.

- We need to define the `User` type. The `following` field will use `getFollowingForLogin` to get the list of users
  that the current user is following. This list does not have all the data we need to satisfy the other `User` fields, so
  we need to get each user's full public profile. That is done by mapping each user to the `getUserForLogin` method.
  The only other resolver we need to specify is the `followingCount`. This data is available from `getUserForLogin` but
  is ironically called `following` on github's returned object. Other resolvers are redundant as github's response maps
  to our other field names (id, name, login).

- We can now remove the mocks from our schema.js file and test from our web app or from graphiql

So this is the resolvers implementation:

[{]: <helper> (diffStep 4.4)

#### Step 4.4: Replace mocks with real resolvers

##### Changed server&#x2F;src&#x2F;schema.js
```diff
@@ -1,5 +1,4 @@
-┊1┊ ┊const { makeExecutableSchema, addMockFunctionsToSchema, MockList } = require('graphql-tools');
-┊2┊ ┊const casual = require('casual');
+┊ ┊1┊const { makeExecutableSchema } = require('graphql-tools');
 ┊3┊2┊
 ┊4┊3┊const typeDefs = `
 ┊5┊4┊  schema {
```
```diff
@@ -24,18 +23,24 @@
 ┊24┊23┊  }
 ┊25┊24┊`;
 ┊26┊25┊
-┊27┊  ┊const Schema = makeExecutableSchema({ typeDefs });
-┊28┊  ┊
-┊29┊  ┊const mocks = {
-┊30┊  ┊  User: () => ({
-┊31┊  ┊    login: () => casual.username,
-┊32┊  ┊    name: () => casual.name,
-┊33┊  ┊    followingCount: () => casual.integer(0),
-┊34┊  ┊    following: (_, { perPage }) => new MockList(perPage),
-┊35┊  ┊  }),
+┊  ┊26┊const resolvers = {
+┊  ┊27┊  Query: {
+┊  ┊28┊    me(_, args, { githubConnector, user }) {
+┊  ┊29┊      return githubConnector.getUserForLogin(user.login);
+┊  ┊30┊    }
+┊  ┊31┊  },
+┊  ┊32┊  User: {
+┊  ┊33┊    following(user, { page, perPage }, { githubConnector }) {
+┊  ┊34┊      return githubConnector.getFollowingForLogin(user.login, page, perPage)
+┊  ┊35┊        .then(users =>
+┊  ┊36┊          users.map(user => githubConnector.getUserForLogin(user.login))
+┊  ┊37┊        );
+┊  ┊38┊    },
+┊  ┊39┊    followingCount: user => user.following,
+┊  ┊40┊  }
 ┊36┊41┊};
 ┊37┊42┊
-┊38┊  ┊addMockFunctionsToSchema({ schema: Schema, mocks });
+┊  ┊43┊const Schema = makeExecutableSchema({ typeDefs, resolvers });
 ┊39┊44┊
 ┊40┊45┊module.exports = {
 ┊41┊46┊  Schema,
```

[}]: #


## Making fewer calls to GitHub

- So our schema is working great but it has two apparent issues. One it is somewhat slow and is depending on GitHub's API
  to give quick responses. Second, it queries GitHub a bunch of times for each GraphQL query. If we have circular follow
  dependencies it will even query more than once to get the same user profile. We will now fix those problems to some
  extent using very simple tool from facebook called `dataloader`.

- We will import `DataLoader` from the `dataloader` package on our github-connector.js file.
```javascript
const DataLoader = require('dataloader');
```

- The `DataLoader` constructor needs a function that will be able to mass load any of the objects it is required. We will
  also set our data loader to avoid batching requests as the GitHub API does not support batching.

```javascript
  new DataLoader(this.fetchAll.bind(this), { batch: false })
```

- To implement fetchAll we just need to use `fetch` as done before on `getFromGithub` for each url we receive. After that,
  use `Promise.all()` to create a single promise and return that. Make sure to print each call to fetch so we would know
  when our data loader is using it's cache and when it's not.

- We also need to change `getFromGithub` to use our data loader instead of fetch.

[{]: <helper> (diffStep 4.5)

#### Step 4.5: Adding a data loader to reduce number of requests to GitHub

##### Changed server&#x2F;src&#x2F;github-connector.js
```diff
@@ -1,36 +1,48 @@
 ┊ 1┊ 1┊const fetch = require('node-fetch');
+┊  ┊ 2┊const DataLoader = require('dataloader');
 ┊ 2┊ 3┊
 ┊ 3┊ 4┊class GithubConnector {
-┊ 4┊  ┊  constructor( accessToken ) {
+┊  ┊ 5┊  constructor(accessToken) {
 ┊ 5┊ 6┊    this.accessToken = accessToken;
+┊  ┊ 7┊    this.dataLoader = new DataLoader(this.fetchAll.bind(this), { batch: false });
 ┊ 6┊ 8┊  }
 ┊ 7┊ 9┊
-┊ 8┊  ┊  getUserForLogin( login ) {
+┊  ┊10┊  getUserForLogin(login) {
 ┊ 9┊11┊    return this.getFromGithub(`/users/${login}`);
 ┊10┊12┊  }
 ┊11┊13┊
-┊12┊  ┊  getFollowingForLogin( login, page, perPage ) {
+┊  ┊14┊  getFollowingForLogin(login, page, perPage) {
 ┊13┊15┊    return this.getFromGithub(`/users/${login}/following`, page, perPage);
 ┊14┊16┊  }
 ┊15┊17┊
-┊16┊  ┊  getFromGithub( relativeUrl, page, perPage ) {
+┊  ┊18┊  getFromGithub(relativeUrl, page, perPage) {
 ┊17┊19┊    const url = `https://api.github.com${relativeUrl}?access_token=${this.accessToken}`;
-┊18┊  ┊    return fetch(this.paginate(url, page, perPage)).then(res => res.json());
+┊  ┊20┊
+┊  ┊21┊    return this.dataLoader.load(this.paginate(url, page, perPage));
 ┊19┊22┊  }
 ┊20┊23┊
-┊21┊  ┊  paginate( url, page, perPage ) {
+┊  ┊24┊  paginate(url, page, perPage) {
 ┊22┊25┊    let transformed = url.indexOf('?') !== -1 ? url : url + '?';
 ┊23┊26┊
-┊24┊  ┊    if ( page ) {
+┊  ┊27┊    if (page) {
 ┊25┊28┊      transformed = `${transformed}&page=${page}`
 ┊26┊29┊    }
 ┊27┊30┊
-┊28┊  ┊    if ( perPage ) {
+┊  ┊31┊    if (perPage) {
 ┊29┊32┊      transformed = `${transformed}&per_page=${perPage}`
 ┊30┊33┊    }
 ┊31┊34┊
 ┊32┊35┊    return transformed;
 ┊33┊36┊  }
+┊  ┊37┊
+┊  ┊38┊  fetchAll(urls) {
+┊  ┊39┊    return Promise.all(
+┊  ┊40┊      urls.map(url => {
+┊  ┊41┊        console.log('Fetching Url', url);
+┊  ┊42┊        return fetch(url).then(res => res.json())
+┊  ┊43┊      })
+┊  ┊44┊    );
+┊  ┊45┊  }
 ┊34┊46┊}
 ┊35┊47┊
 ┊36┊48┊module.exports = {
```

[}]: #

> Note that we don't invalidate the data loader's cache. Facebook suggests we would invalidate when ever a mutation is
> done. This a simple call to `clearAll` method and you can see an example for it on step 5.

- You should now see that whenever you query you GraphQL API, it will get the data the first time from GitHub, causing
  a long response time and on the second time it will load the data from memory with a fraction of the time.

[{]: <helper> (navStep)

| [< Previous Step](step3.md) | [Next Step >](step5.md) |
|:--------------------------------|--------------------------------:|

[}]: #
