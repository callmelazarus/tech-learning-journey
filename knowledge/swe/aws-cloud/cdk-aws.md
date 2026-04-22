# AWS CDK (Cloud Development Kit): Complete Overview

The **AWS Cloud Development Kit (CDK)** is an open-source framework that lets you define cloud infrastructure using real programming languages — TypeScript, Python, Java, Go, and more — instead of raw YAML/JSON (like CloudFormation). Think of it like the difference between hand-drawing a blueprint versus writing a program that *generates* the blueprint: same result, but far more power, reuse, and flexibility.

Under the hood, CDK **synthesizes** your code into a CloudFormation template, which AWS then uses to provision resources. You write code; CDK + CloudFormation do the rest.

## Key Points

- **Infrastructure as Code (IaC):** Define AWS resources (S3, Lambda, VPC, etc.) in TypeScript/Python/etc.
- **Constructs:** The core building block — reusable, composable cloud components.
- **Stacks:** A deployable unit that maps 1:1 to a CloudFormation stack.
- **Apps:** The root of a CDK project; contains one or more stacks.
- **Synthesize → Deploy:** CDK compiles your code into CloudFormation, then deploys it.
- **CDK CLI:** The `cdk` command line tool drives synth, diff, deploy, and destroy operations.

---

## Project Structure

```
my-cdk-app/
├── bin/
│   └── my-cdk-app.ts        # App entry point — instantiates stacks
├── lib/
│   └── my-cdk-app-stack.ts  # Stack definition — your infrastructure lives here
├── test/
│   └── my-cdk-app.test.ts   # Infrastructure unit tests
├── cdk.json                 # CDK config — tells CDK how to run your app
├── package.json
└── tsconfig.json
```

> **Analogy:** `bin/` is like `index.js` — the entry point. `lib/` is where the actual logic lives. `cdk.json` is the config that ties it together.

---

## Core Concepts

### 1. App
The root of every CDK project. Instantiates and connects stacks.
```ts
// bin/my-cdk-app.ts
import * as cdk from 'aws-cdk-lib';
import { MyStack } from '../lib/my-cdk-app-stack';

const app = new cdk.App();
new MyStack(app, 'MyStack', { env: { region: 'us-east-1' } });
```

### 2. Stack
A deployable unit — maps to one CloudFormation stack. All resources defined inside are provisioned together.
```ts
// lib/my-cdk-app-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, 'MyBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
```

### 3. Constructs
The building blocks of CDK. There are 3 levels:

| Level | Name | Description | Example |
|-------|------|-------------|---------|
| L1 | **Cfn Resources** | 1:1 mapping to CloudFormation. Verbose, full control. | `CfnBucket` |
| L2 | **AWS Constructs** | Higher-level abstractions with sensible defaults. | `s3.Bucket` |
| L3 | **Patterns** | Full architecture patterns (e.g., load-balanced service). | `ApplicationLoadBalancedFargateService` |

> Most day-to-day CDK is written at **L2** — opinionated, less boilerplate, safer defaults.

---

## CDK Lifecycle & Key Commands

```bash
# Initialize a new CDK project (TypeScript)
cdk init app --language typescript

# Compile TypeScript
npm run build

# Synthesize CloudFormation template (outputs to cdk.out/)
cdk synth

# Show what will change before deploying
cdk diff

# Deploy stack to AWS
cdk deploy

# Tear down all provisioned resources
cdk destroy
```

> **Analogy:** `cdk synth` is like a dry run — it generates the CloudFormation blueprint without touching AWS. `cdk diff` is like `git diff` for your infrastructure.

---

## Step-by-Step Examples

1. **S3 Bucket with Lifecycle Rule**
   ```ts
   new s3.Bucket(this, 'DataBucket', {
     versioned: true,
     lifecycleRules: [{
       expiration: cdk.Duration.days(90),
     }],
     removalPolicy: cdk.RemovalPolicy.RETAIN,
   });
   ```

2. **Lambda Function**
   ```ts
   import * as lambda from 'aws-cdk-lib/aws-lambda';

   new lambda.Function(this, 'MyFunction', {
     runtime: lambda.Runtime.NODEJS_18_X,
     handler: 'index.handler',
     code: lambda.Code.fromAsset('lambda'),
     environment: {
       TABLE_NAME: 'my-table',
     },
   });
   ```

3. **DynamoDB Table**
   ```ts
   import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

   new dynamodb.Table(this, 'MyTable', {
     partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
     billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
     removalPolicy: cdk.RemovalPolicy.DESTROY,
   });
   ```

4. **Granting Permissions (IAM the CDK way)**
   ```ts
   const bucket = new s3.Bucket(this, 'MyBucket');
   const fn = new lambda.Function(this, 'MyFn', { /* ... */ });

   // CDK automatically creates the right IAM policy
   bucket.grantReadWrite(fn);
   ```

5. **Sharing Values Between Stacks**
   ```ts
   // Stack A — exports a value
   export class InfraStack extends cdk.Stack {
     public readonly bucket: s3.Bucket;
     constructor(scope: Construct, id: string, props?: cdk.StackProps) {
       super(scope, id, props);
       this.bucket = new s3.Bucket(this, 'SharedBucket');
     }
   }

   // Stack B — consumes it
   export class AppStack extends cdk.Stack {
     constructor(scope: Construct, id: string, bucket: s3.Bucket, props?: cdk.StackProps) {
       super(scope, id, props);
       bucket.grantRead(new iam.AccountRootPrincipal());
     }
   }
   ```

---

## cdk.json

The CDK configuration file at the project root. Tells the CDK CLI how to run your app.

```json
{
  "app": "npx ts-node --prefer-ts-exts bin/my-cdk-app.ts",
  "watch": {
    "include": ["**"],
    "exclude": ["README.md", "cdk*.json", "node_modules"]
  },
  "context": {
    "@aws-cdk/aws-apigateway:usagePlanKeyOrderInsensitiveId": true,
    "@aws-cdk/core:stackRelativeExports": true
  }
}
```

- **`app`:** The command CDK runs to execute your app.
- **`context`:** Feature flags that control CDK behavior — usually auto-populated on `cdk init`.

---

## Common Pitfalls

- **Forgetting `cdk bootstrap`** — Before first deploy in a new account/region, you must run `cdk bootstrap` to provision CDK's staging infrastructure (S3 bucket, IAM roles).
- **`DESTROY` removal policy in production** — `RemovalPolicy.DESTROY` deletes resources (like S3 buckets or DynamoDB tables) on `cdk destroy`. Use `RETAIN` for anything stateful in prod.
- **Logical ID drift** — Renaming a construct changes its CloudFormation Logical ID, which causes the old resource to be deleted and a new one created. Dangerous for stateful resources.
- **Hardcoding account/region** — Use `env: { account: process.env.CDK_DEFAULT_ACCOUNT }` for portability.
- **Not running `cdk diff` before deploy** — Always diff first; surprises in infrastructure changes can be costly.
- **L1 vs L2 confusion** — Mixing `CfnBucket` (L1) with `s3.Bucket` (L2) for the same resource causes conflicts.

---

## Practical Applications

- Provisioning full-stack AWS environments (Lambda + API Gateway + DynamoDB + S3)
- Managing multi-account, multi-region infrastructure with environment-aware stacks
- Reusable internal construct libraries shared across teams
- CI/CD pipeline infrastructure (CodePipeline, CodeBuild) defined as code
- Replacing hand-written CloudFormation with maintainable, testable code

---

## References

- [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
- [AWS CDK API Reference](https://docs.aws.amazon.com/cdk/api/v2/)
- [CDK Construct Hub](https://constructs.dev/) — community and AWS construct libraries
- [AWS CDK GitHub](https://github.com/aws/aws-cdk)
- [CDK Patterns](https://cdkpatterns.com/) — real-world serverless CDK patterns

---

## Greater Detail

### Advanced Concepts

- **Aspects:** Apply logic across all constructs in a scope — useful for enforcing tagging policies, encryption standards, or compliance rules across an entire stack.
  ```ts
  cdk.Aspects.of(app).add(new cdk.Tag('Environment', 'Production'));
  ```

- **Custom Constructs:** Package reusable infrastructure as a class. A team can publish an internal `SecureBucket` construct that enforces encryption, logging, and lifecycle policies by default — consumers just `new SecureBucket(this, 'Bucket')`.

- **CDK Pipelines:** A high-level L3 construct (`pipelines.CodePipeline`) for self-mutating CI/CD pipelines — the pipeline updates itself when you push infrastructure changes.

- **Testing with `aws-cdk-lib/assertions`:** CDK supports unit tests against synthesized CloudFormation templates:
  ```ts
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::S3::Bucket', { VersioningConfiguration: { Status: 'Enabled' } });
  ```

- **Tokens & Lazy Values:** CDK uses tokens (like `${Token[TOKEN.123]}`) to represent values not yet known at synthesis time (e.g., a resource ARN). Avoid `.toString()` on tokens — use CDK-aware methods like `cdk.Fn.ref()` instead.

- **`cdk watch`:** Monitors your code for changes and hot-deploys — especially useful for Lambda development loops where you want near-instant feedback without a full `cdk deploy`.