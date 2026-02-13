# TSOA: Complete Overview

TSOA is a TypeScript framework that generates OpenAPI (Swagger) specs and Express/Koa routes from TypeScript decorators and types. You write typed controllers with decorators, and TSOA automatically creates API documentation and runtime validation. Think of TSOA as a contract-first API builder—your TypeScript types become both the implementation and the documentation, eliminating drift between code and docs.

## Key Points

- **Purpose:** Type-safe REST APIs with auto-generated OpenAPI docs
- **Decorators:** `@Route`, `@Get`, `@Post`, `@Body`, `@Query`, etc.
- **Generates:** Routes, validation, Swagger/OpenAPI spec
- **Frameworks:** Works with Express, Koa, Hapi
- **Type Safety:** Request/response types enforced at compile time

## Installation

```bash
# Install TSOA and dependencies
npm install tsoa express
npm install --save-dev @types/express typescript

# Initialize tsoa.json config
npx tsoa spec-and-routes
```

## Basic Setup

### tsoa.json

```json
{
  "entryFile": "src/app.ts",
  "noImplicitAdditionalProperties": "throw-on-extras",
  "controllerPathGlobs": ["src/controllers/**/*.ts"],
  "spec": {
    "outputDirectory": "build",
    "specVersion": 3
  },
  "routes": {
    "routesDir": "build",
    "middleware": "express"
  }
}
```

### package.json Scripts

```json
{
  "scripts": {
    "build": "tsoa spec-and-routes && tsc",
    "dev": "tsoa spec-and-routes && ts-node src/app.ts",
    "generate": "tsoa spec-and-routes"
  }
}
```

## Basic Controller

```typescript
// src/controllers/userController.ts
import { Controller, Get, Post, Route, Body, Path, Tags, Example } from 'tsoa';

interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

@Route('users')
@Tags('Users')
export class UserController extends Controller {
  
  @Get()
  public async getUsers(): Promise<User[]> {
    return [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' }
    ];
  }

  @Get('{userId}')
  public async getUser(@Path() userId: number): Promise<User> {
    return { id: userId, name: 'Alice', email: 'alice@example.com' };
  }

  @Post()
  public async createUser(@Body() body: CreateUserRequest): Promise<User> {
    return {
      id: 3,
      ...body
    };
  }
}
```

## Route Decorators

### HTTP Methods

```typescript
@Route('items')
export class ItemController extends Controller {
  
  @Get()
  async getAll(): Promise<Item[]> { }

  @Get('{id}')
  async getOne(@Path() id: string): Promise<Item> { }

  @Post()
  async create(@Body() item: CreateItemRequest): Promise<Item> { }

  @Put('{id}')
  async update(@Path() id: string, @Body() item: UpdateItemRequest): Promise<Item> { }

  @Patch('{id}')
  async partialUpdate(@Path() id: string, @Body() updates: Partial<Item>): Promise<Item> { }

  @Delete('{id}')
  async delete(@Path() id: string): Promise<void> { }
}
```

### Parameters

```typescript
@Route('products')
export class ProductController extends Controller {
  
  // Path parameter
  @Get('{productId}')
  async getProduct(@Path() productId: number): Promise<Product> { }

  // Query parameters
  @Get('search')
  async search(
    @Query() query: string,
    @Query() category?: string,
    @Query() limit: number = 10
  ): Promise<Product[]> { }

  // Request body
  @Post()
  async create(@Body() product: CreateProductRequest): Promise<Product> { }

  // Header
  @Get('me')
  async getCurrentUser(@Header() authorization: string): Promise<User> { }

  // Request object
  @Post('upload')
  async upload(@Request() request: Express.Request): Promise<UploadResponse> { }
}
```

## Response Types

### Status Codes

```typescript
import { SuccessResponse } from 'tsoa';

@Route('orders')
export class OrderController extends Controller {
  
  @Post()
  @SuccessResponse(201, 'Created')
  public async createOrder(@Body() order: CreateOrderRequest): Promise<Order> {
    this.setStatus(201);
    return createdOrder;
  }

  @Delete('{orderId}')
  @SuccessResponse(204, 'No Content')
  public async deleteOrder(@Path() orderId: string): Promise<void> {
    this.setStatus(204);
  }
}
```

### Error Responses

```typescript
import { ValidateError } from 'tsoa';

@Route('users')
export class UserController extends Controller {
  
  @Get('{userId}')
  public async getUser(@Path() userId: number): Promise<User> {
    const user = await userService.find(userId);
    
    if (!user) {
      this.setStatus(404);
      throw new Error('User not found');
    }
    
    return user;
  }

  @Post()
  public async createUser(@Body() body: CreateUserRequest): Promise<User> {
    if (!body.email.includes('@')) {
      throw new ValidateError({
        email: { message: 'Invalid email format', value: body.email }
      }, 'Validation failed');
    }
    
    return await userService.create(body);
  }
}
```

## Validation

### Built-in Validation

```typescript
interface CreateUserRequest {
  /** @minLength 2 @maxLength 50 */
  name: string;
  
  /** @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ */
  email: string;
  
  /** @minimum 18 @maximum 120 */
  age: number;
  
  /** @isInt */
  score: number;
}

@Route('users')
export class UserController extends Controller {
  @Post()
  public async create(@Body() body: CreateUserRequest): Promise<User> {
    // TSOA validates automatically based on JSDoc comments
    return await userService.create(body);
  }
}
```

### Custom Validation

```typescript
// src/validators/customValidators.ts
import { ValidateError } from 'tsoa';

export function validateEmail(email: string): void {
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new ValidateError({
      email: { message: 'Invalid email', value: email }
    }, 'Validation error');
  }
}

// Controller
@Post()
public async createUser(@Body() body: CreateUserRequest): Promise<User> {
  validateEmail(body.email);
  return await userService.create(body);
}
```

## Authentication

```typescript
// src/authentication.ts
import { Request } from 'express';

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === 'jwt') {
    const token = request.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new Error('No token provided');
    }
    
    try {
      const decoded = verifyJWT(token);
      
      if (scopes) {
        const hasScopes = scopes.every(scope => 
          decoded.scopes.includes(scope)
        );
        if (!hasScopes) {
          throw new Error('Insufficient permissions');
        }
      }
      
      return decoded;
    } catch (err) {
      throw new Error('Invalid token');
    }
  }
}
```

```typescript
// tsoa.json - define security
{
  "spec": {
    "securityDefinitions": {
      "jwt": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    }
  }
}
```

```typescript
// Controller with auth
import { Security } from 'tsoa';

@Route('admin')
@Security('jwt', ['admin'])
export class AdminController extends Controller {
  
  @Get('users')
  public async getUsers(): Promise<User[]> {
    // Only accessible with valid JWT token with 'admin' scope
    return await userService.getAll();
  }
}

@Route('profile')
export class ProfileController extends Controller {
  
  @Get()
  @Security('jwt')
  public async getProfile(): Promise<UserProfile> {
    // Accessible with any valid JWT token
    return await profileService.get();
  }
}
```

## OpenAPI/Swagger

### Generated Spec

```yaml
# build/swagger.json (auto-generated)
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      tags:
        - Users
      responses:
        '200':
          description: Ok
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '200':
          description: Ok
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

### Documentation Decorators

```typescript
import { Example, Tags, Response } from 'tsoa';

interface User {
  id: number;
  name: string;
  email: string;
}

@Route('users')
@Tags('User Management')
export class UserController extends Controller {
  
  /**
   * Retrieves all users from the database
   * @summary Get all users
   */
  @Get()
  @Example<User[]>([
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ])
  public async getUsers(): Promise<User[]> { }

  /**
   * Creates a new user
   * @summary Create user
   */
  @Post()
  @Response<ValidateErrorJSON>(422, 'Validation Failed')
  @Example<User>({ id: 1, name: 'Alice', email: 'alice@example.com' })
  public async createUser(@Body() body: CreateUserRequest): Promise<User> { }
}
```

## Server Setup

### Express

```typescript
// src/app.ts
import express from 'express';
import { RegisterRoutes } from '../build/routes';
import swaggerUi from 'swagger-ui-express';

const app = express();

app.use(express.json());

// Register TSOA routes
RegisterRoutes(app);

// Swagger UI
app.use('/docs', swaggerUi.serve, async (_req, res) => {
  return res.send(
    swaggerUi.generateHTML(await import('../build/swagger.json'))
  );
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  if (err.name === 'ValidateError') {
    return res.status(422).json({
      message: 'Validation Failed',
      details: err.fields
    });
  }
  
  return res.status(500).json({
    message: 'Internal Server Error'
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('API docs at http://localhost:3000/docs');
});
```

## Advanced Patterns

### Dependency Injection

```typescript
// src/services/userService.ts
export class UserService {
  async getAll(): Promise<User[]> { }
  async getById(id: number): Promise<User> { }
  async create(data: CreateUserRequest): Promise<User> { }
}

// src/controllers/userController.ts
import { inject } from 'tsyringe';

@Route('users')
export class UserController extends Controller {
  constructor(@inject(UserService) private userService: UserService) {
    super();
  }

  @Get()
  public async getUsers(): Promise<User[]> {
    return this.userService.getAll();
  }
}
```

### File Uploads

```typescript
import { UploadedFile } from 'tsoa';

interface UploadResponse {
  filename: string;
  size: number;
  url: string;
}

@Route('upload')
export class UploadController extends Controller {
  
  @Post()
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File
  ): Promise<UploadResponse> {
    return {
      filename: file.originalname,
      size: file.size,
      url: `/uploads/${file.filename}`
    };
  }
}
```

### Pagination

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Route('products')
export class ProductController extends Controller {
  
  @Get()
  public async getProducts(
    @Query() page: number = 1,
    @Query() pageSize: number = 10
  ): Promise<PaginatedResponse<Product>> {
    const offset = (page - 1) * pageSize;
    const [data, total] = await productService.findAndCount(offset, pageSize);
    
    return { data, total, page, pageSize };
  }
}
```

## Best Practices

```typescript
// ✅ Use specific types, not 'any'
interface CreateUserRequest {
  name: string;
  email: string;
}

@Post()
async create(@Body() body: CreateUserRequest): Promise<User> { }

// ✅ Add JSDoc for documentation
/**
 * Retrieves user by ID
 * @param userId The user's unique identifier
 */
@Get('{userId}')
async getUser(@Path() userId: number): Promise<User> { }

// ✅ Use validation decorators
interface UpdateUserRequest {
  /** @minLength 2 */
  name?: string;
  
  /** @pattern ^[^\s@]+@[^\s@]+\.[^\s@]+$ */
  email?: string;
}

// ✅ Set proper status codes
@Post()
@SuccessResponse(201, 'Created')
async create(@Body() body: CreateUserRequest): Promise<User> {
  this.setStatus(201);
  return result;
}

// ✅ Use security decorators
@Security('jwt', ['admin'])
@Delete('{userId}')
async deleteUser(@Path() userId: number): Promise<void> { }

// ❌ Don't use 'any' for request/response types
async getData(): Promise<any> { }  // Bad

// ❌ Don't skip validation
@Post()
async create(@Body() body: any): Promise<User> { }  // Bad

// ❌ Don't ignore error handling
@Get('{id}')
async get(@Path() id: number): Promise<User> {
  return await db.findOne(id);  // Can return undefined!
}
```

## References

- [TSOA Documentation](https://tsoa-community.github.io/docs/)
- [TSOA GitHub](https://github.com/lukeautry/tsoa)
- [OpenAPI Specification](https://swagger.io/specification/)

---

## Summary

**TSOA:** TypeScript framework for type-safe REST APIs with auto-generated OpenAPI docs.

**Key Features:**
- Decorators for routes: `@Get`, `@Post`, `@Body`, `@Query`
- Auto-generates: Routes, validation, Swagger spec
- Type-safe: Request/response types enforced

**Basic Controller:**
```typescript
@Route('users')
export class UserController extends Controller {
  @Get('{id}')
  async getUser(@Path() id: number): Promise<User> { }
  
  @Post()
  async create(@Body() user: CreateUserRequest): Promise<User> { }
}
```

**Setup:**
```bash
npm install tsoa express
npx tsoa spec-and-routes
```

**Rule of thumb:** Define types first, add decorators, run `tsoa spec-and-routes`. Types become documentation. Use JSDoc for validation (`@minLength`, `@pattern`). Always set proper status codes. Enable authentication with `@Security`.