# AWS CodeBuild: buildspec.yml Complete Overview

The `buildspec.yml` is a **build specification file** used by **AWS CodeBuild** to define how your project is built, tested, and packaged. Think of it like a recipe card handed to a chef (CodeBuild) — it lists every step, in order, so the build environment knows exactly what to do from start to finish. It lives at the root of your project repository and is written in YAML.

## Key Points

- **YAML Format:** Indentation-sensitive; a misplaced space can break the entire build.
- **Phases-Based:** Build logic is split into ordered phases — `install`, `pre_build`, `build`, `post_build`.
- **Environment Agnostic:** CodeBuild spins up a fresh container for each build — no state persists between runs unless explicitly cached or stored.
- **Artifacts:** Defines what files to package and send to S3 or downstream pipeline stages.
- **Env Variables:** Supports plaintext, SSM Parameter Store, and Secrets Manager references.
- **Optional File:** If omitted, you can define build commands directly in the CodeBuild console — but the file is best practice.

---

## Structure Overview

```yaml
version: 0.2

env:
  variables:
    ENV_NAME: "production"
  parameter-store:
    DB_PASSWORD: "/myapp/db/password"
  secrets-manager:
    API_KEY: "myapp/secrets:apiKey"

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - echo "Installing dependencies..."
      - npm ci

  pre_build:
    commands:
      - echo "Running pre-build checks..."
      - npm run lint
      - npm test

  build:
    commands:
      - echo "Building the app..."
      - npm run build

  post_build:
    commands:
      - echo "Build complete. Pushing Docker image or notifying..."

artifacts:
  files:
    - '**/*'
  base-directory: dist

cache:
  paths:
    - node_modules/**/*
```

---

## Phase Breakdown

Each phase runs sequentially. If a phase fails, subsequent phases are skipped.

| Phase        | Purpose                                               | Example Use                          |
|--------------|-------------------------------------------------------|--------------------------------------|
| `install`    | Set up the environment                                | Install runtimes, tools, dependencies|
| `pre_build`  | Prep work before the main build                       | Linting, testing, Docker login       |
| `build`      | The core compilation/packaging step                   | `npm run build`, `mvn package`       |
| `post_build` | Cleanup or follow-up actions after a successful build | Push Docker image, send notification |

> **Analogy:** Think of phases like a pre-game routine for an athlete — warm-up (`install`), stretch (`pre_build`), play the game (`build`), cool-down (`post_build`).

---

## Step-by-Step Examples

1. **Node.js App Build**
   ```yaml
   phases:
     install:
       runtime-versions:
         nodejs: 18
       commands:
         - npm ci
     build:
       commands:
         - npm run build
   artifacts:
     files:
       - '**/*'
     base-directory: dist
   ```

2. **Docker Image Build & Push to ECR**
   ```yaml
   phases:
     pre_build:
       commands:
         - aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI
     build:
       commands:
         - docker build -t my-app .
         - docker tag my-app:latest $ECR_URI/my-app:latest
     post_build:
       commands:
         - docker push $ECR_URI/my-app:latest
   ```

3. **Using SSM Parameter Store for Secrets**
   ```yaml
   env:
     parameter-store:
       DB_HOST: "/myapp/prod/db_host"
       DB_PASS: "/myapp/prod/db_pass"
   phases:
     build:
       commands:
         - echo "Connecting to $DB_HOST"
   ```

4. **Caching node_modules to Speed Up Builds**
   ```yaml
   cache:
     paths:
       - node_modules/**/*
   ```
   > Cache is stored in S3 and reused across builds — can significantly cut build times for large dependency trees.

5. **Export Artifacts for CodePipeline**
   ```yaml
   artifacts:
     files:
       - appspec.yml
       - scripts/**/*
       - dist/**/*
   ```

---

## Common Pitfalls

- **YAML indentation errors** — YAML is whitespace-sensitive; use spaces, never tabs. A single misaligned line silently breaks the file.
- **Wrong version** — Always use `version: 0.2`. Version `0.1` is deprecated and behaves differently with env vars.
- **Secrets in plaintext** — Never hardcode credentials. Use `parameter-store` or `secrets-manager` blocks instead.
- **Forgetting IAM permissions** — CodeBuild needs the correct IAM role to access ECR, S3, SSM, etc. The buildspec itself doesn't grant permissions.
- **Artifacts path mismatch** — If your `base-directory` doesn't match your actual output folder, artifacts will be empty.
- **Assuming state persists** — Each build runs in a clean container. Files from previous builds are gone unless cached or stored externally.

---

## Practical Applications

- CI/CD pipelines with **AWS CodePipeline**
- Building and pushing **Docker images to ECR**
- Running **automated tests** before deployment
- Compiling and packaging **frontend apps** (React, Vue, etc.)
- Deploying **Lambda functions** via SAM or CDK

---

## References

- [AWS Docs: Build Specification Reference](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)
- [AWS Docs: CodeBuild Environment Variables](https://docs.aws.amazon.com/codebuild/latest/userguide/build-env-ref-env-vars.html)
- [AWS Docs: CodeBuild with CodePipeline](https://docs.aws.amazon.com/codepipeline/latest/userguide/action-reference-CodeBuild.html)
- [AWS Docs: Caching in CodeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/build-caching.html)

---

## Greater Detail

### Advanced Concepts

- **Multiple Buildspecs:** You can specify a custom buildspec file path in the CodeBuild project config (e.g., `infra/buildspec.prod.yml`) — useful for monorepos with separate build configs per service.
- **Runtime Versions:** The `runtime-versions` block under `install` pins language runtimes (Node, Python, Java, etc.). Omitting it uses the image's default, which can cause non-deterministic builds if the base image updates.
- **finally Block:** Each phase supports a `finally` block that runs even if the phase fails — useful for cleanup tasks:
  ```yaml
  build:
    commands:
      - npm run build
    finally:
      - echo "This runs even if build fails"
  ```
- **Secondary Artifacts:** CodeBuild supports outputting multiple artifact sets simultaneously — useful for publishing both a build report and the deployable bundle.
- **Batch Builds:** CodeBuild supports fan-out builds using `batch` config in the buildspec, allowing parallel builds across environments or configurations in a single pipeline trigger.
- **exported-variables:** You can export environment variables from one CodeBuild action and consume them downstream in CodePipeline:
  ```yaml
  env:
    exported-variables:
      - MY_IMAGE_TAG
  ```