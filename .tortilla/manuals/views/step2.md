# Step 2: Writing a GraphQL schema

In this step we will create a GraphQL server, we will implement it with NodeJS and Express.

> My preference is to use Yarn as package manager - but you can also use NPM.

Let's start by creating a NodeJS project:

    $ mkdir server
    $ cd server
    $ yarn init

Great, now let's add the dependencies we need:

    $ yarn add graphql express graphql-tools graphql-server-express body-parser casual dataloader morgan node-fetch
    $ yarn add -D nodemon

Now let's add some scripts to our `package.json`:

```json
  "scripts": {
    "start": "node src/index.js",
    "watch": "nodemon src/index.js"
  },
```

Your final `package.json` should look like that:

[{]: <helper> (diffStep 2.1 files="server/package.json")

#### Step 2.1: Basic NodeJS server

##### Added server&#x2F;package.json
```diff
@@ -0,0 +1,32 @@
+┊  ┊ 1┊{
+┊  ┊ 2┊  "name": "workshop-server",
+┊  ┊ 3┊  "version": "1.0.0",
+┊  ┊ 4┊  "description": "GraphQL Basic server",
+┊  ┊ 5┊  "main": "index.js",
+┊  ┊ 6┊  "license": "MIT",
+┊  ┊ 7┊  "scripts": {
+┊  ┊ 8┊    "start": "node src/index.js",
+┊  ┊ 9┊    "watch": "nodemon src/index.js"
+┊  ┊10┊  },
+┊  ┊11┊  "keywords": [
+┊  ┊12┊    "tutorial",
+┊  ┊13┊    "graphql",
+┊  ┊14┊    "apollo",
+┊  ┊15┊    "server",
+┊  ┊16┊    "express"
+┊  ┊17┊  ],
+┊  ┊18┊  "dependencies": {
+┊  ┊19┊    "body-parser": "^1.17.2",
+┊  ┊20┊    "casual": "^1.5.14",
+┊  ┊21┊    "dataloader": "^1.3.0",
+┊  ┊22┊    "express": "^4.15.3",
+┊  ┊23┊    "graphql": "^0.10.3",
+┊  ┊24┊    "graphql-server-express": "^0.9.0",
+┊  ┊25┊    "graphql-tools": "^1.0.0",
+┊  ┊26┊    "morgan": "^1.8.2",
+┊  ┊27┊    "node-fetch": "^1.7.1"
+┊  ┊28┊  },
+┊  ┊29┊  "devDependencies": {
+┊  ┊30┊    "nodemon": "^1.11.0"
+┊  ┊31┊  }
+┊  ┊32┊}
```

[}]: #

Now, after learning to work with Github's GraphQL explorer, we now want to try and learn how it's done.

Our implementation will be much more simpler but it will eventually help us understand how to wrap every REST Api with GraphQL endpoint.


### Write you GraphQL schema

Create a new file named schema.js. We would write our schema inside a single ES6 template string.

```js
const typeDefs = `
  ... our schema goes here ....
`;
```

Every great schema starts with a schema declaration. It will have two fields, query of type Query and mutation of type Mutation.

```graphql
schema {
  query: Query
  mutation: Mutation
}
```

Next we define our Query type. We will add only one field me of type User, because this is the only thing the interests us at the moment.

```graphql
type Query {
  me: User
}
```

Now define our Mutation type. Add a field called follow. This field will get a mandatory argument called userId of the type ID. It will return the type User as well.

```graphql
type Mutation {
  follow(userId: ID!): User
}
```

> Note how we used the exclamation mark (!) to define a mandatory type.

All we have left is to define our User type. A user will have id, login, name, followerCount and a list of followers. followers can accept optional skip and limit arguments to control the returned items on the followers list. We will give skip a default value of 0 and limit default value of 10.

```graphql
type User {
  id: ID!
  login: String!
  name: String
  followerCount: Int
  followers(skip: Int = 0, limit: Int = 10): [User]
}
```

Now we use apollo to parse that schema and make an executable schema out of it.

Import the `makeExecutableSchema` from `graphql-tools` package, and use it to create your GraphQL schema object.

This is how you file should look like:

[{]: <helper> (diffStep 2.2)

#### Step 2.2: Added basic GraphQL schema

##### Added server&#x2F;src&#x2F;schema.js
```diff
@@ -0,0 +1,30 @@
+┊  ┊ 1┊const { makeExecutableSchema } = require('graphql-tools');
+┊  ┊ 2┊
+┊  ┊ 3┊const typeDefs = `
+┊  ┊ 4┊  schema {
+┊  ┊ 5┊    query: Query
+┊  ┊ 6┊    mutation: Mutation
+┊  ┊ 7┊  }
+┊  ┊ 8┊  
+┊  ┊ 9┊  type Query {
+┊  ┊10┊    me: User
+┊  ┊11┊  }
+┊  ┊12┊  
+┊  ┊13┊  type Mutation {
+┊  ┊14┊    follow(login: String!): User
+┊  ┊15┊  }
+┊  ┊16┊  
+┊  ┊17┊  type User {
+┊  ┊18┊    id: ID!
+┊  ┊19┊    login: String!
+┊  ┊20┊    name: String
+┊  ┊21┊    followingCount: Int
+┊  ┊22┊    following(page: Int = 0, perPage: Int = 10): [User]
+┊  ┊23┊  }
+┊  ┊24┊`;
+┊  ┊25┊
+┊  ┊26┊const Schema = makeExecutableSchema({ typeDefs });
+┊  ┊27┊
+┊  ┊28┊module.exports = {
+┊  ┊29┊  Schema,
+┊  ┊30┊};
```

[}]: #

### Create a GraphQL endpoint with your schema

- Create a new file named index.js. This of course, will be our server's entry point.
- Import `express`, `body-parser` and our `graphqlExpress` middleware.

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const {graphqlExpress} = require('graphql-server-express');
```

- Import our `Schema` object.
```javascript
const {Schema} = require('./schema');
```

- Now we create our `express` app, and add our `bodyParser` and `graphqlExpress` middleware on `/graphql` path.

```javascript
const app = express();

app.use('/graphql', bodyParser.json(), graphqlExpress({
  schema: Schema,
}));
```

- Lastly we need to tell `express` to start listening on some port.
```javascript
app.listen(3001);
```

**Now we can go ahead and start the app by typing `npm start` in our project directory.**

> If it works without errors, close it using Ctrl + C and run `npm run watch` to make our server restart when we change our files.

- So now we have a GrpahQL endpoint but we don't know how to explore the API. To do just that, we will add `graphiqlExpress` middleware.
```javascript
// Import graphiqlExpress from the same package
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express');

// ... Just before calling the listen method

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql', // This will tell the graphiql interface where to run queries
}));
```

This is how your file should looks like:

[{]: <helper> (diffStep 2.3)

#### Step 2.3: Expose GraphQL endpoint

##### Added server&#x2F;src&#x2F;index.js
```diff
@@ -0,0 +1,20 @@
+┊  ┊ 1┊const express = require('express');
+┊  ┊ 2┊const bodyParser = require('body-parser');
+┊  ┊ 3┊const morgan = require('morgan');
+┊  ┊ 4┊const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
+┊  ┊ 5┊
+┊  ┊ 6┊const { Schema } = require('./schema');
+┊  ┊ 7┊
+┊  ┊ 8┊const app = express();
+┊  ┊ 9┊
+┊  ┊10┊app.use(morgan('tiny'));
+┊  ┊11┊
+┊  ┊12┊app.use('/graphql', bodyParser.json(), graphqlExpress({
+┊  ┊13┊  schema: Schema,
+┊  ┊14┊}));
+┊  ┊15┊
+┊  ┊16┊app.use('/graphiql', graphiqlExpress({
+┊  ┊17┊  endpointURL: '/graphql',
+┊  ┊18┊}));
+┊  ┊19┊
+┊  ┊20┊app.listen(3001);
```

[}]: #

- Now open your browser on http://localhost:3001/graphiql and start exploring the schema we've just wrote!

- Try to run the following `me` query.

```graphql
query {
  me {
    login
    name
    followerCount
    followers(limit: 5) {
      login
      name
    }
  }
}
```

- You will get the following response:
```json
{
  "data": {
    "me": null
  }
}
```

### Adding GraphQL Mocks

Our schema does not know how to resolve `me` or any other field for that matter.
We need to provide it with proper resolvers but until we get to do that,
there is one more very cool feature to apollo which is generating mock resolvers.

- Import from `graphql-tools` the function `addMockFunctionsToSchema` on our schema.js file.

```javascript
const {makeExecutableSchema, addMockFunctionsToSchema} = require('graphql-tools');
```

- Now call this function right before the export of our `Schema` object.

```javascript
addMockFunctionsToSchema({schema: Schema});
```

- Go back to our grahpiql tool on http://localhost:3001/graphiql and run the `me` query again.

- This time you will receive a response of the following structure:
```json
{
  "data": {
    "me": {
      "login": "Hello World",
      "name": "Hello World",
      "followerCount": -96,
      "followers": [
        {
          "login": "Hello World",
          "name": "Hello World"
        },
        {
          "login": "Hello World",
          "name": "Hello World"
        }
      ]
    }
  }
}
```

So we can see that our schema now knows how to return data. We can also see that the data is quite genric and sometimes doesn't make sense.
In order to change that, we use a package called `casual` to tweak some of the mocked data.

-  Import `casual` to our schema.js file and create a `mocks` object.
Pass that `mocks` object to the `addMockFunctionsToSchema` function.
```javascript
const casual = require('casual');
// ....
const mocks = {};

addMockFunctionsToSchema({schema: Schema, mocks});
```

- First let's make `followerCount` to be a positive number.
```javascript
const mocks = {
  User: () => ({
    followerCount: () => casual.integer(0), // start from 0
  }),
};
```

- Now let's get `name` and `login` fields return fitting strings.
```javascript
const mocks = {
  User: () => ({
    login: () => casual.username,
    name: () => casual.name,

    followerCount: () => casual.integer(0),
  }),
};
```

- Lastly, we will use `MockedList` from `graphql-tools`, to make followers return a list of users that it's length corresponds to the given `limit` argument.

```javascript
const {makeExecutableSchema, addMockFunctionsToSchema, MockList} = require('graphql-tools');

// ....

const mocks = {
  User: () => ({
    login: () => casual.username,
    name: () => casual.name,
    followerCount: () => casual.integer(0),

    followers: (_, args) => new MockList(args.limit),
  }),
};
```

- Now run the `me` query again. You should get a more sensible result.
```json
{
  "data": {
    "follow": {
      "login": "Haleigh.Kutch",
      "name": "Dr. Marlen Smith",
      "followerCount": 182,
      "followers": [
        {
          "login": "Solon_Hirthe",
          "name": "Mrs. Jamie Roberts"
        },
        {
          "login": "Wyman_Arnold",
          "name": "Dr. Alisa Price"
        },
        {
          "login": "Mabelle_Donnelly",
          "name": "Ms. Monica Bosco"
        },
        {
          "login": "Wiegand_Keira",
          "name": "Miss Emilia McDermott"
        },
        {
          "login": "Duncan.Hickle",
          "name": "Mrs. Jacinto Reinger"
        }
      ]
    }
  }
}
```

This is how your schema file should look like:

[{]: <helper> (diffStep 2.4)

#### Step 2.4: Added GraphQL data mocks

##### Changed server&#x2F;src&#x2F;schema.js
```diff
@@ -1,4 +1,5 @@
-┊1┊ ┊const { makeExecutableSchema } = require('graphql-tools');
+┊ ┊1┊const { makeExecutableSchema, addMockFunctionsToSchema, MockList } = require('graphql-tools');
+┊ ┊2┊const casual = require('casual');
 ┊2┊3┊
 ┊3┊4┊const typeDefs = `
 ┊4┊5┊  schema {
```
```diff
@@ -25,6 +26,17 @@
 ┊25┊26┊
 ┊26┊27┊const Schema = makeExecutableSchema({ typeDefs });
 ┊27┊28┊
+┊  ┊29┊const mocks = {
+┊  ┊30┊  User: () => ({
+┊  ┊31┊    login: () => casual.username,
+┊  ┊32┊    name: () => casual.name,
+┊  ┊33┊    followingCount: () => casual.integer(0),
+┊  ┊34┊    following: (_, { perPage }) => new MockList(perPage),
+┊  ┊35┊  }),
+┊  ┊36┊};
+┊  ┊37┊
+┊  ┊38┊addMockFunctionsToSchema({ schema: Schema, mocks });
+┊  ┊39┊
 ┊28┊40┊module.exports = {
 ┊29┊41┊  Schema,
 ┊30┊42┊};
```

[}]: #

### CORS

Because we will separate our client and server and run them in different ports and instances, we need to make sure our server support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS).

To add CORS, install `cors` from NPM:

    $ cd server
    $ yarn add cors

Now, use it with your Express instance:

[{]: <helper> (diffStep 2.5 files="server/src/index.js")

#### Step 2.5: Added cors

##### Changed server&#x2F;src&#x2F;index.js
```diff
@@ -1,12 +1,14 @@
 ┊ 1┊ 1┊const express = require('express');
 ┊ 2┊ 2┊const bodyParser = require('body-parser');
 ┊ 3┊ 3┊const morgan = require('morgan');
+┊  ┊ 4┊const cors = require('cors');
 ┊ 4┊ 5┊const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
 ┊ 5┊ 6┊
 ┊ 6┊ 7┊const { Schema } = require('./schema');
 ┊ 7┊ 8┊
 ┊ 8┊ 9┊const app = express();
 ┊ 9┊10┊
+┊  ┊11┊app.use(cors());
 ┊10┊12┊app.use(morgan('tiny'));
 ┊11┊13┊
 ┊12┊14┊app.use('/graphql', bodyParser.json(), graphqlExpress({
```

[}]: #

[{]: <helper> (navStep)

| [< Previous Step](step1.md) | [Next Step >](step3.md) |
|:--------------------------------|--------------------------------:|

[}]: #
