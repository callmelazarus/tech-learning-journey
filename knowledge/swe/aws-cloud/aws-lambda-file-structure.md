# AWS Lambda API Endpoint: Typical File Structure

A Lambda-based API endpoint connects API Gateway to a Lambda function, usually defined by a **handler** (execution logic), an **OpenAPI spec** (API contract), and a **config file** (infrastructure/environment settings). Your team's pattern of separating these three concerns is solid and aligns well with industry practice — though the specifics vary across teams and frameworks.

## Key Points

- **Handler:** The entry point Lambda executes — should be thin and delegate to services.
- **OpenAPI Spec:** Defines the API contract (routes, request/response schemas, validation). Often used by API Gateway directly.
- **Config:** Environment-specific settings, IAM, and infra definitions (SAM, Serverless Framework, CDK, etc.).
- **Is this standard?** Yes — separating handler, API spec, and config is a well-established pattern. The exact file names and locations vary, but the *separation of concerns* is the standard part.

## Typical Structure

```
my-api-endpoint/
├── src/
│   ├── handlers/
│   │   └── getUser.js            # Lambda handler (entry point)
│   ├── services/
│   │   └── userService.js        # Business logic
│   ├── utils/
│   │   └── response.js           # Standardized response helpers
│   └── middleware/
│       └── errorHandler.js       # Centralized error handling
├── api/
│   └── openapi.yaml              # OpenAPI 3.0 spec (API contract)
├── config/
│   ├── default.json              # Shared config values
│   └── production.json           # Environment overrides
├── tests/
│   ├── handlers/
│   │   └── getUser.test.js
│   └── services/
│       └── userService.test.js
├── template.yaml                 # SAM/CloudFormation (infra-as-code)
└── package.json
```

## Step-by-Step Breakdown

### 1. Handler File

The handler is what Lambda actually invokes. Think of it as a **receptionist** — it receives the request, routes it to the right department (service), and hands back the response.

```js
// src/handlers/getUser.js
const { getUser } = require("../services/userService");
const { success, error } = require("../utils/response");

exports.handler = async (event) => {
  try {
    const userId = event.pathParameters?.id;
    const user = await getUser(userId);
    return success(200, user);
  } catch (err) {
    return error(err.statusCode || 500, err.message);
  }
};
```

```js
// src/utils/response.js
const success = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const error = (statusCode, message) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ error: message }),
});

module.exports = { success, error };
```

### 2. OpenAPI Spec

Defines your API contract — routes, methods, parameters, request/response schemas. API Gateway can import this directly, and it doubles as living documentation.

```yaml
# api/openapi.yaml
openapi: 3.0.3
info:
  title: User API
  version: 1.0.0

paths:
  /users/{id}:
    get:
      summary: Get a user by ID
      operationId: getUser
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        "200":
          description: User found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"
        "404":
          description: User not found

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        email:
          type: string
```

**Why keep this?** API Gateway can validate requests against it *before* your Lambda even runs, saving you execution time and cost. It also enables auto-generated client SDKs and documentation.

### 3. Config File

Manages environment-specific values. Keeps secrets and environment differences out of your code.

```json
// config/default.json
{
  "dynamodb": {
    "tableName": "users-table",
    "region": "us-west-2"
  },
  "logging": {
    "level": "info"
  }
}
```

```yaml
# template.yaml (SAM)
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Runtime: nodejs20.x
    Timeout: 10
    Environment:
      Variables:
        TABLE_NAME: !Ref UsersTable

Resources:
  GetUserFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: src/handlers/getUser.handler
      CodeUri: .
      Events:
        GetUser:
          Type: Api
          Properties:
            Path: /users/{id}
            Method: get
            RestApiId: !Ref UserApi

  UserApi:
    Type: AWS::Serverless::Api
    Properties:
      StageName: prod
      DefinitionUri: api/openapi.yaml   # <-- references your OpenAPI spec

  UsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: users-table
      AttributeDefinitions:
        - AttributeName: id
          AttributeType: S
      KeySchema:
        - AttributeName: id
          KeyType: HASH
      BillingMode: PAY_PER_REQUEST
```

## How Your Team's Pattern Compares

| Concern | Your Team | Common Alternatives |
|---|---|---|
| **Handlers** | `handlers/` directory | Same — nearly universal |
| **OpenAPI** | OpenAPI spec file | Some teams skip this and define routes purely in SAM/Serverless config. Having it is a *better* practice. |
| **Config** | Config file | SAM `template.yaml`, `serverless.yml`, CDK stacks, or `.env` files. All valid. |

Your team's approach is actually **more disciplined than average**. Many teams skip the OpenAPI spec entirely and define routes inline in their IaC templates, losing the benefits of contract-first design.

## Common Pitfalls

- Putting business logic in the handler instead of a separate service layer — makes testing painful.
- Letting the OpenAPI spec drift out of sync with actual handler behavior. Automate validation in CI.
- Hardcoding environment values instead of pulling from config/environment variables.
- Defining routes in *both* the OpenAPI spec and the IaC template without a single source of truth.

## Practical Applications

- **Contract-First Development:** Write the OpenAPI spec first, then implement handlers to match — reduces miscommunication between frontend and backend teams.
- **Request Validation:** API Gateway validates against OpenAPI before invoking Lambda, rejecting malformed requests for free.
- **Auto-Generated Docs:** Tools like Swagger UI or Redoc render your OpenAPI spec as interactive API docs.
- **Multi-Environment Deploys:** Config files + SAM parameters let you deploy the same code to dev/staging/prod with different settings.

## References

- [API Gateway + OpenAPI Integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-import-api.html)
- [AWS SAM Template Reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification.html)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- [Best Practices for Lambda Functions](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

---

## Greater Detail

### Advanced Concepts

- **Contract-First vs Code-First:** Your team's OpenAPI file suggests contract-first design. The alternative (code-first) generates the spec from code annotations — faster to start, harder to maintain.
- **Middleware (middy):** Instead of try/catch in every handler, use `middy` to chain error handling, input parsing, and validation as reusable middleware. Keeps handlers to ~5 lines.
- **Shared Schemas:** Extract OpenAPI `components/schemas` into separate files and `$ref` them. Prevents schema duplication across endpoints.
- **Config Libraries:** Tools like `@aws-sdk/client-ssm` (Parameter Store) or `@aws-sdk/client-secrets-manager` let you pull sensitive config at runtime instead of baking it into deploy packages.