# Factory Design Pattern: Complete Overview

The Factory design pattern is a creational pattern that provides an interface for creating objects without specifying their exact classes. Instead of calling constructors directly with `new`, you call a factory method that decides which class to instantiate based on input parameters or application logic. Think of it like ordering food at a restaurant—you don't go into the kitchen and cook it yourself (direct instantiation); you tell the waiter what you want, and the kitchen (factory) prepares the right dish for you.

## Key Points

- **Purpose:** Creates objects without exposing creation logic to client
- **Flexibility:** Easy to add new types without changing existing code
- **Encapsulation:** Centralizes object creation in one place
- **Variants:** Simple Factory, Factory Method, Abstract Factory
- **Use When:** Object creation is complex or depends on conditions

## High-Level Overview

### What is the Factory Pattern?

The Factory pattern delegates object creation to a specialized method or class. Instead of your code knowing exactly which class to instantiate, you ask a factory to create the appropriate object for you. This decouples your code from specific implementations.

**Core concept:** Separate object creation logic from business logic. The factory knows how to create objects; your code just uses them.

### Why Use It?

```typescript
// ❌ Without Factory: Code tightly coupled to specific classes
function processPayment(type: string, amount: number) {
  let payment;
  
  if (type === 'credit_card') {
    payment = new CreditCardPayment();
  } else if (type === 'paypal') {
    payment = new PayPalPayment();
  } else if (type === 'crypto') {
    payment = new CryptoPayment();
  }
  
  payment.process(amount);
}
// Adding new payment type requires modifying this function

// ✅ With Factory: Clean separation
function processPayment(type: string, amount: number) {
  const payment = PaymentFactory.create(type);
  payment.process(amount);
}
// Adding new payment type only requires updating factory

Benefits:
- Single Responsibility: Each class does one thing
- Open/Closed Principle: Open for extension, closed for modification
- Easier testing: Mock the factory instead of multiple classes
- Centralized logic: All creation rules in one place
```

### Three Main Variants

```
1. Simple Factory (not official GoF pattern)
   - Single factory class with creation method
   - Simplest form
   - Good for basic use cases

2. Factory Method
   - Subclasses decide which class to instantiate
   - Uses inheritance
   - Official GoF pattern

3. Abstract Factory
   - Factory of factories
   - Creates families of related objects
   - Most complex, most flexible
```

## Simple Factory Pattern

The simplest form—a single class or function that creates objects.

### Basic Example: Shape Factory

```typescript
// Product interface
interface Shape {
  draw(): void;
  area(): number;
}

// Concrete products
class Circle implements Shape {
  constructor(private radius: number) {}
  
  draw(): void {
    console.log(`Drawing circle with radius ${this.radius}`);
  }
  
  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  
  draw(): void {
    console.log(`Drawing rectangle ${this.width}x${this.height}`);
  }
  
  area(): number {
    return this.width * this.height;
  }
}

class Triangle implements Shape {
  constructor(private base: number, private height: number) {}
  
  draw(): void {
    console.log(`Drawing triangle base=${this.base} height=${this.height}`);
  }
  
  area(): number {
    return (this.base * this.height) / 2;
  }
}

// Simple Factory
class ShapeFactory {
  static create(type: string, ...args: number[]): Shape {
    switch (type.toLowerCase()) {
      case 'circle':
        return new Circle(args[0]);
      case 'rectangle':
        return new Rectangle(args[0], args[1]);
      case 'triangle':
        return new Triangle(args[0], args[1]);
      default:
        throw new Error(`Unknown shape type: ${type}`);
    }
  }
}

// Usage
const circle = ShapeFactory.create('circle', 5);
circle.draw();  // Drawing circle with radius 5
console.log(circle.area());  // 78.54

const rectangle = ShapeFactory.create('rectangle', 4, 6);
rectangle.draw();  // Drawing rectangle 4x6
console.log(rectangle.area());  // 24

// Adding new shape only requires:
// 1. Create new class implementing Shape
// 2. Add case to factory
// Client code remains unchanged
```

### Real-World Example: Notification System

```typescript
// Product interface
interface Notification {
  send(message: string, recipient: string): void;
}

// Concrete products
class EmailNotification implements Notification {
  send(message: string, recipient: string): void {
    console.log(`Sending email to ${recipient}: ${message}`);
    // Email sending logic...
  }
}

class SMSNotification implements Notification {
  send(message: string, recipient: string): void {
    console.log(`Sending SMS to ${recipient}: ${message}`);
    // SMS sending logic...
  }
}

class PushNotification implements Notification {
  send(message: string, recipient: string): void {
    console.log(`Sending push notification to ${recipient}: ${message}`);
    // Push notification logic...
  }
}

class SlackNotification implements Notification {
  send(message: string, recipient: string): void {
    console.log(`Sending Slack message to ${recipient}: ${message}`);
    // Slack API logic...
  }
}

// Simple Factory
class NotificationFactory {
  static create(type: string): Notification {
    switch (type.toLowerCase()) {
      case 'email':
        return new EmailNotification();
      case 'sms':
        return new SMSNotification();
      case 'push':
        return new PushNotification();
      case 'slack':
        return new SlackNotification();
      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }
  }
}

// Usage
function notifyUser(type: string, message: string, recipient: string) {
  const notification = NotificationFactory.create(type);
  notification.send(message, recipient);
}

notifyUser('email', 'Welcome!', 'user@example.com');
notifyUser('sms', 'Your code is 1234', '+1234567890');
notifyUser('slack', 'Deployment complete', '#deployments');
```

## Factory Method Pattern

Defines an interface for creating objects but lets subclasses decide which class to instantiate.

### Structure

```typescript
// Product interface
interface Product {
  operation(): string;
}

// Concrete products
class ConcreteProductA implements Product {
  operation(): string {
    return 'Result from Product A';
  }
}

class ConcreteProductB implements Product {
  operation(): string {
    return 'Result from Product B';
  }
}

// Creator (abstract class with factory method)
abstract class Creator {
  // Factory method - subclasses override this
  abstract factoryMethod(): Product;
  
  // Business logic that uses the factory method
  someOperation(): string {
    const product = this.factoryMethod();
    return `Creator: Working with ${product.operation()}`;
  }
}

// Concrete creators
class ConcreteCreatorA extends Creator {
  factoryMethod(): Product {
    return new ConcreteProductA();
  }
}

class ConcreteCreatorB extends Creator {
  factoryMethod(): Product {
    return new ConcreteProductB();
  }
}

// Usage
function clientCode(creator: Creator) {
  console.log(creator.someOperation());
}

clientCode(new ConcreteCreatorA());
// Output: Creator: Working with Result from Product A

clientCode(new ConcreteCreatorB());
// Output: Creator: Working with Result from Product B
```

### Real-World Example: Document Editor

```typescript
// Product interface
interface Document {
  open(): void;
  save(): void;
  close(): void;
}

// Concrete products
class PDFDocument implements Document {
  open(): void {
    console.log('Opening PDF document');
  }
  
  save(): void {
    console.log('Saving as PDF');
  }
  
  close(): void {
    console.log('Closing PDF document');
  }
}

class WordDocument implements Document {
  open(): void {
    console.log('Opening Word document');
  }
  
  save(): void {
    console.log('Saving as DOCX');
  }
  
  close(): void {
    console.log('Closing Word document');
  }
}

class SpreadsheetDocument implements Document {
  open(): void {
    console.log('Opening spreadsheet');
  }
  
  save(): void {
    console.log('Saving as XLSX');
  }
  
  close(): void {
    console.log('Closing spreadsheet');
  }
}

// Creator abstract class
abstract class Application {
  // Factory method
  abstract createDocument(): Document;
  
  // Uses factory method
  newDocument(): void {
    const doc = this.createDocument();
    doc.open();
    console.log('Document ready for editing');
  }
  
  openExisting(filename: string): void {
    const doc = this.createDocument();
    console.log(`Loading ${filename}`);
    doc.open();
  }
}

// Concrete creators
class PDFApplication extends Application {
  createDocument(): Document {
    return new PDFDocument();
  }
}

class WordApplication extends Application {
  createDocument(): Document {
    return new WordDocument();
  }
}

class SpreadsheetApplication extends Application {
  createDocument(): Document {
    return new SpreadsheetDocument();
  }
}

// Usage
function launchApp(app: Application) {
  app.newDocument();
}

launchApp(new PDFApplication());
// Opening PDF document
// Document ready for editing

launchApp(new WordApplication());
// Opening Word document
// Document ready for editing
```

## Abstract Factory Pattern

Creates families of related objects without specifying their concrete classes.

### Example: UI Theme Factory

```typescript
// Product interfaces (related products)
interface Button {
  render(): void;
  onClick(): void;
}

interface Checkbox {
  render(): void;
  toggle(): void;
}

interface Input {
  render(): void;
  getValue(): string;
}

// Concrete products - Dark theme
class DarkButton implements Button {
  render(): void {
    console.log('Rendering dark button');
  }
  
  onClick(): void {
    console.log('Dark button clicked');
  }
}

class DarkCheckbox implements Checkbox {
  render(): void {
    console.log('Rendering dark checkbox');
  }
  
  toggle(): void {
    console.log('Dark checkbox toggled');
  }
}

class DarkInput implements Input {
  render(): void {
    console.log('Rendering dark input');
  }
  
  getValue(): string {
    return 'dark-input-value';
  }
}

// Concrete products - Light theme
class LightButton implements Button {
  render(): void {
    console.log('Rendering light button');
  }
  
  onClick(): void {
    console.log('Light button clicked');
  }
}

class LightCheckbox implements Checkbox {
  render(): void {
    console.log('Rendering light checkbox');
  }
  
  toggle(): void {
    console.log('Light checkbox toggled');
  }
}

class LightInput implements Input {
  render(): void {
    console.log('Rendering light input');
  }
  
  getValue(): string {
    return 'light-input-value';
  }
}

// Abstract Factory interface
interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
  createInput(): Input;
}

// Concrete factories
class DarkThemeFactory implements UIFactory {
  createButton(): Button {
    return new DarkButton();
  }
  
  createCheckbox(): Checkbox {
    return new DarkCheckbox();
  }
  
  createInput(): Input {
    return new DarkInput();
  }
}

class LightThemeFactory implements UIFactory {
  createButton(): Button {
    return new LightButton();
  }
  
  createCheckbox(): Checkbox {
    return new LightCheckbox();
  }
  
  createInput(): Input {
    return new LightInput();
  }
}

// Client code
class Application {
  private button: Button;
  private checkbox: Checkbox;
  private input: Input;
  
  constructor(factory: UIFactory) {
    this.button = factory.createButton();
    this.checkbox = factory.createCheckbox();
    this.input = factory.createInput();
  }
  
  render(): void {
    this.button.render();
    this.checkbox.render();
    this.input.render();
  }
}

// Usage
const userPrefersDark = true;

const factory = userPrefersDark
  ? new DarkThemeFactory()
  : new LightThemeFactory();

const app = new Application(factory);
app.render();
// Rendering dark button
// Rendering dark checkbox
// Rendering dark input

// Switching themes just requires changing the factory
// All UI components automatically match the theme
```

## Similarities Across Factory Patterns

### 1. Core Principle

All factory patterns share the same fundamental goal:

```typescript
// All variants encapsulate object creation
// Instead of: new ConcreteClass()
// Use: Factory.create()

Simple Factory:     ShapeFactory.create('circle')
Factory Method:     creator.factoryMethod()
Abstract Factory:   factory.createButton()

Common benefit: Client code doesn't know concrete classes
```

### 2. Dependency Inversion

```typescript
// All patterns follow Dependency Inversion Principle
// Depend on abstractions, not concrete classes

// Client depends on interface, not implementation
function processShape(shape: Shape) {  // Interface
  shape.draw();
  // Doesn't care if Circle, Rectangle, or Triangle
}

// Factory provides the concrete instance
const shape = ShapeFactory.create('circle', 5);
processShape(shape);
```

### 3. Open/Closed Principle

```typescript
// All patterns allow adding new types without modifying existing code

// Adding new shape:
// 1. Create class implementing Shape
class Hexagon implements Shape {
  draw() { console.log('Drawing hexagon'); }
  area() { return 100; }
}

// 2. Update factory
// Client code unchanged ✅

// Open for extension (new types)
// Closed for modification (existing code)
```

### 4. Testing Benefits

```typescript
// All patterns improve testability

// Mock the factory in tests
class MockShapeFactory {
  static create(): Shape {
    return {
      draw: jest.fn(),
      area: () => 100
    };
  }
}

// Test without real implementations
test('processShape calls draw', () => {
  const shape = MockShapeFactory.create();
  processShape(shape);
  expect(shape.draw).toHaveBeenCalled();
});
```

## Differences Between Factory Patterns

### 1. Complexity Level

```
Simple Factory:
└─ Single class/function
└─ Easiest to understand
└─ Good for basic scenarios

Factory Method:
└─ Abstract class + subclasses
└─ Moderate complexity
└─ Uses inheritance

Abstract Factory:
└─ Multiple related products
└─ Most complex
└─ Creates product families

Complexity: Simple Factory < Factory Method < Abstract Factory
```

### 2. Structure

```typescript
// Simple Factory: Static method or standalone function
class Factory {
  static create(type: string): Product {
    if (type === 'A') return new ProductA();
    if (type === 'B') return new ProductB();
  }
}

// Factory Method: Abstract class with override
abstract class Creator {
  abstract factoryMethod(): Product;
}

class ConcreteCreator extends Creator {
  factoryMethod(): Product {
    return new ConcreteProduct();
  }
}

// Abstract Factory: Multiple creation methods
interface AbstractFactory {
  createProductA(): ProductA;
  createProductB(): ProductB;
  createProductC(): ProductC;
}
```

### 3. When to Use Each

```typescript
// Simple Factory: Basic object creation
// Use when: Simple conditional logic, few types
class LoggerFactory {
  static create(level: string): Logger {
    switch (level) {
      case 'console': return new ConsoleLogger();
      case 'file': return new FileLogger();
      default: return new ConsoleLogger();
    }
  }
}

// Factory Method: Subclasses determine type
// Use when: Framework with extension points
abstract class Game {
  abstract createPlayer(): Player;
  
  startGame() {
    const player = this.createPlayer();
    player.spawn();
  }
}

class ChessGame extends Game {
  createPlayer(): Player {
    return new ChessPlayer();
  }
}

// Abstract Factory: Families of related objects
// Use when: Multiple related products that must work together
interface DatabaseFactory {
  createConnection(): Connection;
  createQuery(): Query;
  createTransaction(): Transaction;
}

class PostgresFactory implements DatabaseFactory {
  createConnection() { return new PostgresConnection(); }
  createQuery() { return new PostgresQuery(); }
  createTransaction() { return new PostgresTransaction(); }
}
// All products work together (same database)
```

### 4. Flexibility

```typescript
// Simple Factory: Least flexible
// Adding new type requires modifying factory switch/if statement
class Factory {
  static create(type: string) {
    switch (type) {
      case 'A': return new A();
      case 'B': return new B();
      // Must modify this code for new types ⚠️
    }
  }
}

// Factory Method: More flexible
// Adding new type requires new subclass (no modification)
class NewCreator extends Creator {
  factoryMethod() {
    return new NewProduct();  // New product without changing existing code ✅
  }
}

// Abstract Factory: Most flexible for product families
// Adding new family requires new factory
class NewThemeFactory implements UIFactory {
  createButton() { return new NewButton(); }
  createCheckbox() { return new NewCheckbox(); }
  // Entire new theme without changing existing themes ✅
}
```

### 5. Use Cases

```
Simple Factory:
✅ Logger creation (console, file, remote)
✅ Shape generation (circle, square, triangle)
✅ Payment processing (credit card, PayPal, crypto)
❌ Complex inheritance hierarchies
❌ Related product families

Factory Method:
✅ Frameworks with plugin systems
✅ Document editors (PDF, Word, Excel)
✅ Game character creation
✅ Template Method pattern integration
❌ Unrelated products
❌ Very simple scenarios

Abstract Factory:
✅ UI themes (dark mode, light mode)
✅ Cross-platform UIs (Windows, Mac, Linux)
✅ Database drivers (Postgres, MySQL, SQLite)
✅ Related product families that must match
❌ Single product creation
❌ Unrelated products
```

## Common Pitfalls

- Overusing factories for trivial object creation (not everything needs a factory)
- Simple Factory with too many conditionals (consider Factory Method instead)
- Not using dependency injection (factories become global state)
- Creating "God factories" that do too much (split into focused factories)
- Forgetting to handle unknown types (always throw or return default)
- Not considering configuration-based factories (can be more maintainable)

## Practical Applications

- **Dependency Injection Containers:** Spring, Angular create objects via factories
- **ORMs:** Sequelize, TypeORM create model instances
- **Testing Frameworks:** Jest, Mocha create test doubles
- **UI Libraries:** React.createElement, Vue component factories
- **Game Development:** Character, enemy, item creation
- **Plugin Systems:** WordPress, VS Code extension loading

## References

- [Gang of Four Design Patterns](https://en.wikipedia.org/wiki/Design_Patterns) - Original pattern catalog
- [Refactoring.Guru: Factory Pattern](https://refactoring.guru/design-patterns/factory-method)
- [Head First Design Patterns](https://www.oreilly.com/library/view/head-first-design/0596007124/)
- [TypeScript Design Patterns](https://www.patterns.dev/posts/factory-pattern/)

---

## Greater Detail

### Configuration-Based Factory

```typescript
// Instead of hardcoding types, use configuration
interface ShapeConfig {
  type: string;
  params: number[];
}

class ConfigurableShapeFactory {
  private creators = new Map<string, (params: number[]) => Shape>();
  
  register(type: string, creator: (params: number[]) => Shape): void {
    this.creators.set(type, creator);
  }
  
  create(config: ShapeConfig): Shape {
    const creator = this.creators.get(config.type);
    if (!creator) {
      throw new Error(`Unknown shape type: ${config.type}`);
    }
    return creator(config.params);
  }
}

// Setup
const factory = new ConfigurableShapeFactory();
factory.register('circle', ([radius]) => new Circle(radius));
factory.register('rectangle', ([w, h]) => new Rectangle(w, h));
factory.register('triangle', ([b, h]) => new Triangle(b, h));

// Usage with configuration
const configs: ShapeConfig[] = [
  { type: 'circle', params: [5] },
  { type: 'rectangle', params: [4, 6] },
  { type: 'triangle', params: [3, 4] }
];

const shapes = configs.map(config => factory.create(config));

// Benefits:
// - Configuration can come from database, JSON, API
// - Easy to add new shapes without modifying factory
// - Registration can happen at runtime
```

### Factory with Dependency Injection

```typescript
// Inject dependencies into factory
interface Logger {
  log(message: string): void;
}

class PaymentFactory {
  constructor(
    private logger: Logger,
    private apiKey: string
  ) {}
  
  create(type: string): Payment {
    this.logger.log(`Creating payment of type: ${type}`);
    
    switch (type) {
      case 'stripe':
        return new StripePayment(this.apiKey, this.logger);
      case 'paypal':
        return new PayPalPayment(this.apiKey, this.logger);
      default:
        throw new Error(`Unknown payment type: ${type}`);
    }
  }
}

// Usage
const logger = new ConsoleLogger();
const apiKey = process.env.PAYMENT_API_KEY;
const factory = new PaymentFactory(logger, apiKey);

const payment = factory.create('stripe');
// All created objects have necessary dependencies
```

### Factory with Validation

```typescript
class ValidatedUserFactory {
  private validators = {
    email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    age: (age: number) => age >= 0 && age <= 150,
    username: (username: string) => username.length >= 3
  };
  
  create(userData: UserData): User {
    // Validate before creation
    if (!this.validators.email(userData.email)) {
      throw new Error('Invalid email');
    }
    
    if (!this.validators.age(userData.age)) {
      throw new Error('Invalid age');
    }
    
    if (!this.validators.username(userData.username)) {
      throw new Error('Username too short');
    }
    
    // All validations passed, create user
    return new User(userData);
  }
}

// Usage
const factory = new ValidatedUserFactory();

try {
  const user = factory.create({
    email: 'invalid-email',
    age: 25,
    username: 'john'
  });
} catch (error) {
  console.error(error.message); // Invalid email
}
```

### Async Factory

```typescript
// Factory that performs async operations
class AsyncUserFactory {
  async create(email: string): Promise<User> {
    // Check if user already exists
    const existing = await database.findByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }
    
    // Fetch additional data from API
    const profileData = await api.fetchProfile(email);
    
    // Create and save user
    const user = new User({
      email,
      profile: profileData
    });
    
    await database.save(user);
    return user;
  }
}

// Usage
const factory = new AsyncUserFactory();
const user = await factory.create('user@example.com');
```

### Factory with Caching/Pooling

```typescript
// Reuse expensive objects
class ConnectionFactory {
  private pool: Connection[] = [];
  private maxPoolSize = 10;
  
  create(): Connection {
    // Return existing connection from pool
    if (this.pool.length > 0) {
      const connection = this.pool.pop()!;
      console.log('Reusing connection from pool');
      return connection;
    }
    
    // Create new connection
    console.log('Creating new connection');
    return new Connection();
  }
  
  release(connection: Connection): void {
    // Return connection to pool
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(connection);
      console.log('Connection returned to pool');
    } else {
      connection.close();
      console.log('Pool full, closing connection');
    }
  }
}

// Usage
const factory = new ConnectionFactory();

const conn1 = factory.create();  // Creating new connection
factory.release(conn1);           // Connection returned to pool

const conn2 = factory.create();  // Reusing connection from pool
```

### Real-World React Example

```typescript
// Factory pattern in React component library
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'danger';
}

class ButtonFactory {
  static create(props: ButtonProps): JSX.Element {
    switch (props.variant) {
      case 'primary':
        return (
          <button
            className="btn-primary"
            onClick={props.onClick}
          >
            {props.label}
          </button>
        );
      
      case 'secondary':
        return (
          <button
            className="btn-secondary"
            onClick={props.onClick}
          >
            {props.label}
          </button>
        );
      
      case 'danger':
        return (
          <button
            className="btn-danger"
            onClick={props.onClick}
          >
            {props.label}
          </button>
        );
    }
  }
}

// Usage in component
function App() {
  return (
    <div>
      {ButtonFactory.create({
        label: 'Save',
        variant: 'primary',
        onClick: () => console.log('Saved')
      })}
      
      {ButtonFactory.create({
        label: 'Delete',
        variant: 'danger',
        onClick: () => console.log('Deleted')
      })}
    </div>
  );
}
```

### Best Practices Summary

```typescript
// ✅ Good practices:

// 1. Return interfaces, not concrete classes
interface Payment { }
class PaymentFactory {
  create(): Payment {  // Return interface
    return new ConcretePayment();
  }
}

// 2. Use descriptive factory method names
createFromConfig(config: Config)
createForEnvironment(env: string)
createWithDefaults()

// 3. Handle invalid types gracefully
create(type: string): Product {
  if (!this.supports(type)) {
    throw new Error(`Unsupported type: ${type}`);
  }
  return this.instantiate(type);
}

// 4. Consider lazy initialization
private instance?: Product;

get(): Product {
  if (!this.instance) {
    this.instance = this.create();
  }
  return this.instance;
}

// 5. Document factory purpose and usage
/**
 * Creates notification senders based on channel type.
 * 
 * @param type - Notification channel (email, sms, push)
 * @returns Notification sender instance
 * @throws Error if type is unsupported
 */
static create(type: string): Notification { }

// 6. Use TypeScript unions for type safety
type NotificationType = 'email' | 'sms' | 'push';

create(type: NotificationType): Notification {
  // TypeScript ensures only valid types
}
```

### When NOT to Use Factory Pattern

```typescript
// ❌ Don't use factory for simple object creation
// Simple case: Direct instantiation is clearer
const user = new User('Alice', 25);

// ❌ No need for factory
const user = UserFactory.create('Alice', 25);

// ❌ Don't use when only one concrete class exists
// Just use the constructor directly
const logger = new Logger();

// ❌ No benefit
const logger = LoggerFactory.create();

// ✅ DO use factory when:
// - Multiple implementations exist
// - Creation logic is complex
// - Need runtime type determination
// - Want to centralize creation logic
// - Adding new types frequently
```