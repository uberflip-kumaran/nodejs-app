import express from "express";
import Provider from "oidc-provider";
import path from "path";
import { fileURLToPath } from "url";

import userData from "./MOCK_DATA.json" assert { type: "json" };
import graphql from "graphql";
import { graphqlHTTP } from "express-graphql";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const PORT = 5000;

const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
} = graphql;

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLInt },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    getAllUsers: {
      type: new GraphQLList(UserType),
      args: { id: { type: GraphQLInt } },
      resolve(parent, args) {
        return userData;
      },
    },
    findUserById: {
      type: UserType,
      description: "fetch single user",
      args: { id: { type: GraphQLInt } },
      resolve(parent, args) {
        return userData.find((a) => a.id == args.id);
      },
    },
  },
});
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve(parent, args) {
        userData.push({
          id: userData.length + 1,
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          password: args.password,
        });
        return args;
      },
    },
  },
});

const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation });

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.get("/rest/getAllUsers", (req, res) => {
  res.send(userData);
});

// //Middlewares
// app.use(express.static(__dirname + "/public"));
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");
// const configuration = {
//   clients: [
//     {
//       client_id: "oidcCLIENT",
//       client_secret: "Some_super_secret",
//       grant_types: ["authorization_code"],
//       redirect_uris: [
//         /* "http://localhost:8080/auth/login/callback",
//         "https://oidcdebugger.com/debug", */
//         "http://localhost:8055",
//       ],
//       response_types: ["code"],

//       //other configurations if needed
//     },
//   ],
//   pkce: {
//     required: () => false,
//   },
// };

// const oidc = new Provider("http://localhost:3000", configuration);

// app.use("/oidc", oidc.callback());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
