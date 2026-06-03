# AWS Parameter Store: Overview

**AWS Systems Manager Parameter Store** is a managed service for storing configuration data and secrets — things like database URLs, API keys, feature flags, and environment-specific settings. It gives you a centralized, versioned, access-controlled place to store values your applications need at runtime, without hardcoding them.

> **Analogy:** Instead of taping sticky notes with passwords to everyone's monitors (`.env` files in your repo), you store them in a locked filing cabinet (Parameter Store). Each app has a key to only the drawers it needs, every change is logged, and you can roll back to any previous value.

---

## Key Concepts

- **Parameter** — a named key-value pair. Names use `/` as a path separator for hierarchy.
- **Types** — `String`, `StringList`, or `SecureString` (encrypted via KMS).
- **Versioning** — every update creates a new version. You can reference specific versions or always pull the latest.
- **Tiers** — Standard (free, up to 4KB per parameter) or Advanced (paid, up to 8KB, supports TTL/expiration policies).
- **Paths** — hierarchical naming (`/myapp/prod/db_url`) lets you organize by environment, service, or team and apply IAM policies at the path level.

---

## Parameter Types

| Type | Encrypted? | Use case |
|---|---|---|
| `String` | ❌ | Non-sensitive config (feature flags, region names, log levels) |
| `StringList` | ❌ | Comma-separated values (allowed IPs, list of S3 buckets) |
| `SecureString` | ✅ (KMS) | Passwords, API keys, connection strings, tokens |

---

## Naming Convention (Paths)

Use a consistent hierarchy — it makes IAM policies and bulk fetching by path much easier:

```
/[app]/[environment]/[key]

/myapp/prod/db_url
/myapp/prod/db_password
/myapp/staging/db_url
/myapp/staging/db_password
/shared/prod/stripe_api_key
```

---

## Creating Parameters

### AWS Console
Systems Manager → Parameter Store → Create parameter → fill in name, type, value.

### AWS CLI
```bash
# Plain string
aws ssm put-parameter \
  --name "/myapp/prod/log_level" \
  --value "info" \
  --type String

# Encrypted secret
aws ssm put-parameter \
  --name "/myapp/prod/db_password" \
  --value "super-secret-password" \
  --type SecureString

# Overwrite an existing parameter
aws ssm put-parameter \
  --name "/myapp/prod/db_password" \
  --value "new-password" \
  --type SecureString \
  --overwrite
```

### AWS CDK
```ts
import * as ssm from 'aws-cdk-lib/aws-ssm';

new ssm.StringParameter(this, 'DbUrl', {
  parameterName: '/myapp/prod/db_url',
  stringValue: 'postgres://host:5432/mydb',
});

// Reference an existing parameter (no value stored in CDK)
const dbUrl = ssm.StringParameter.valueForStringParameter(
  this, '/myapp/prod/db_url'
);
```

---

## Reading Parameters

### CLI
```bash
# Get a single parameter (decrypt SecureString automatically)
aws ssm get-parameter \
  --name "/myapp/prod/db_password" \
  --with-decryption

# Get all parameters under a path
aws ssm get-parameters-by-path \
  --path "/myapp/prod/" \
  --with-decryption \
  --recursive
```

### Node.js (AWS SDK v3)
```js
import { SSMClient, GetParameterCommand, GetParametersByPathCommand } from '@aws-sdk/client-ssm';

const client = new SSMClient({ region: 'us-east-1' });

// Single parameter
const { Parameter } = await client.send(new GetParameterCommand({
  Name: '/myapp/prod/db_password',
  WithDecryption: true,
}));
console.log(Parameter.Value); // "super-secret-password"

// All parameters under a path
const { Parameters } = await client.send(new GetParametersByPathCommand({
  Path: '/myapp/prod/',
  WithDecryption: true,
  Recursive: true,
}));
// Returns array of { Name, Value, Version, ... }
```

---

## Using with Lambda

Lambda functions can fetch parameters at cold start and cache them for the function's lifetime — avoiding a Parameter Store call on every invocation.

```js
let cachedConfig = null;

async function getConfig() {
  if (cachedConfig) return cachedConfig;

  const { Parameters } = await client.send(new GetParametersByPathCommand({
    Path: '/myapp/prod/',
    WithDecryption: true,
    Recursive: true,
  }));

  cachedConfig = Object.fromEntries(
    Parameters.map(p => [p.Name.split('/').pop(), p.Value])
  );
  return cachedConfig;
}

export const handler = async (event) => {
  const config = await getConfig(); // cached after first call
  // config.db_url, config.db_password, etc.
};
```

> AWS also offers the **Parameter Store Lambda Extension** — a sidecar that caches parameters locally and refreshes on a configurable TTL, so your function code doesn't need SDK calls at all.

---

## IAM — Least Privilege Access

The power of path-based naming: lock each service to only its own parameters.

```json
{
  "Effect": "Allow",
  "Action": [
    "ssm:GetParameter",
    "ssm:GetParametersByPath"
  ],
  "Resource": "arn:aws:ssm:us-east-1:123456789:parameter/myapp/prod/*"
}
```

For `SecureString`, the IAM role also needs KMS decrypt permission:
```json
{
  "Effect": "Allow",
  "Action": "kms:Decrypt",
  "Resource": "arn:aws:kms:us-east-1:123456789:key/<key-id>"
}
```

---

## Parameter Store vs. Secrets Manager

A common question — both store secrets, so which do you use?

| | Parameter Store | Secrets Manager |
|---|---|---|
| **Cost** | Free (Standard tier) | ~$0.40/secret/month |
| **Auto-rotation** | ❌ Manual | ✅ Built-in (RDS, Redshift, etc.) |
| **Cross-account access** | ❌ Limited | ✅ Native support |
| **Non-secret config** | ✅ Great fit | ❌ Overkill |
| **Best for** | App config + secrets in one place | Secrets requiring auto-rotation |

> **Rule of thumb:** Use Parameter Store for config values and secrets that don't need automatic rotation. Use Secrets Manager when you need built-in rotation — especially for database credentials.

---

## Common Pitfalls

- **Forgetting `--with-decryption`** — fetching a `SecureString` without this flag returns the encrypted ciphertext, not the plaintext value.
- **Hardcoding parameter names** — parameter names like `/myapp/prod/db_url` should themselves be configurable (e.g., via an environment variable), not hardcoded in application code.
- **Fetching on every request** — calling Parameter Store per-invocation in Lambda adds latency and cost. Cache at cold start or use the Lambda Extension.
- **Over-permissive IAM** — giving a service access to `/` (all parameters) instead of `/myapp/prod/*` defeats the purpose of least-privilege access control.
- **Not using versioning** — Parameter Store versions every change. Reference `parameter:version` in critical deployments so a parameter update doesn't silently change behavior mid-deploy.

---

## References

- [AWS Docs: Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [AWS Docs: Parameter Store Lambda Extension](https://docs.aws.amazon.com/systems-manager/latest/userguide/ps-integration-lambda-extensions.html)
- [AWS SDK v3: SSM Client](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ssm/)
- [AWS Docs: Secrets Manager vs Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/integration-ps-secretsmanager.html)