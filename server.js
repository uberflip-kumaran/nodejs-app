import express from "express";
import Provider from "oidc-provider";
import path from "path";
import { fileURLToPath } from "url";
import dns from "dns";

import userData from "./MOCK_DATA.json" assert { type: "json" };
import graphql from "graphql";
import { graphqlHTTP } from "express-graphql";

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// //Middlewares
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const configuration = {
  key: [
    {
      alg: "RS256",
      e: "AQAB",
      key_ops: ["verify"],
      kty: "RSA",
      n: "0VJwEa4fiRDv4R6HMNEJZDR3_UAMGcrMhkR8aLhOLaOkV1sh84epY5xlpTmDiyCFf9bRDhSpnSB3QMOqzkBEZSlmd53P3hV-Wo-zRh48r1KzRdD6MDZU0oL-OyYgTP_VP1TZcT0oC5LG__p9Jex8SLpwzuHARpMuJyZ01wp5tUVkAbdGzf50-pQHoQNmXYoeojnG-alRMVH8gtuZ5oUn-h0GBSBspcAx5Jd_ifwX9uBkmYRjNFQQbslL69LZVcKvBwmPmeSxMI2TW0k8EJ-uR3Cw_5z1upG1vnKsKNpMuUsnwRduzncGaafz-MWDUIvVUYxMkRBjWRG0pPhDEb3E9w",
      use: "sig",
      kid: "c92834c9af14ade755dcefd90b5d7600",
    },
  ],
  clients: [
    {
      client_id: "oidcCLIENT",
      client_secret: "Some_super_secret",
      grant_types: ["authorization_code"],
      redirect_uris: [
        /* "http://localhost:8080/auth/login/callback",
        "https://oidcdebugger.com/debug", */
        "http://localhost:8055",
      ],
      features: {
        introspection: { enabled: true },
        revocation: { enabled: true },
      },
      formats: {
        AccessToken: "jwt",
      },
      claims: {
        openid: ["sub"],
        email: ["email", "email_verified"],
        profile: [
          "name",
          "family_name",
          "given_name",
          "profile",
          "picture",
          "updated_at",
        ],
      },
      async findAccount(ctx, id) {
        return {
          accountId: id,
          async claims(use, scope) {
            return {
              sub: id, // Usually a user id
              email: "user@example.com",
              email_verified: true,
              name: "John Doe",
              given_name: "John",
              family_name: "Doe",
              // Add more claims as per your application's requirements
            };
          },
        };
      },
      response_types: ["code"],

      //other configurations if needed
    },
  ],
  async findAccount(ctx, id) {
    return {
      accountId: id,
      async claims(use, scope) {
        return {
          sub: id, // Usually a user id
          email: "user@example.com",
          email_verified: true,
          name: "John Doe",
          given_name: "John",
          family_name: "Doe",
          preferred_username: "johndoe",
          // Add more claims as per your application's requirements
        };
      },
    };
  },
  pkce: {
    required: () => false,
  },
};

// const oidc = new Provider(`http://localhost:${PORT}`, configuration);

// app.use("/oidc", oidc.callback());

// const serviceName = "nodejs-app-discovery-service.nodejs-app-namespace";
const serviceIP = "";

// dns.resolve4(serviceName, (err, addresses) => {
//   if (err) {
//     console.error("Error resolving DNS name:", err);
//     return;
//   }
//   console.log(`Resolved IP addresses: ${JSON.stringify(addresses)}`);
//   serviceIP = addresses[0];
// });

app.get("/", (req, res) => {
  res.send(`Hello, World! ${serviceIP}`);
});

app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`);
});
