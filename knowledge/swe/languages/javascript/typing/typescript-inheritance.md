# TypeScript Inheritance: Complete Overview

Inheritance in TypeScript allows a class (child/derived class) to inherit properties and methods from another class (parent/base class), enabling code reuse and creating hierarchical relationships between classes. It implements the "is-a" relationship where a derived class is a specialized version of its base class. Think of it like a family tree—children inherit traits from parents but can also have their own unique characteristics.

## Key Points

- **Syntax:** Use `extends` keyword to inherit from a base class
- **Access:** Child classes inherit public and protected members, not private
- **Override:** Child classes can override parent methods with their own implementation
- **Super:** Use `super` to call parent constructor or methods
- **Abstract Classes:** Define blueprints that child classes must implement

## Step-by-Step Explanation & Examples

1. **Basic Inheritance**

   ```typescript
   class Animal {
     name: string;
     
     constructor(name: string) {
       this.name = name;
     }
     
     makeSound(): void {
       console.log('Some generic sound');
     }
   }
   
   class Dog extends Animal {
     breed: string;
     
     constructor(name: string, breed: string) {
       super(name); // Call parent constructor
       this.breed = breed;
     }
     
     makeSound(): void {
       console.log('Woof! Woof!');
     }
   }
   
   const dog = new Dog('Max', 'Labrador');
   console.log(dog.name); // 'Max' (inherited)
   dog.makeSound(); // 'Woof! Woof!' (overridden)
   ```

2. **Access Modifiers (public, protected, private)**

   ```typescript
   class Vehicle {
     public brand: string;      // Accessible everywhere
     protected year: number;     // Accessible in class and subclasses
     private vin: string;        // Only accessible in this class
     
     constructor(brand: string, year: number, vin: string) {
       this.brand = brand;
       this.year = year;
       this.vin = vin;
     }
   }
   
   class Car extends Vehicle {
     getInfo(): string {
       return `${this.brand} (${this.year})`; // ✅ Can access protected
       // return this.vin; // ❌ Error: private property
     }
   }
   
   const car = new Car('Toyota', 2023, 'ABC123');
   console.log(car.brand); // ✅ 'Toyota'
   // console.log(car.year); // ❌ Error: protected property
   ```

3. **Using Super for Parent Methods**

   ```typescript
   class Employee {
     constructor(public name: string, public salary: number) {}
     
     getDetails(): string {
       return `${this.name}: $${this.salary}`;
     }
   }
   
   class Manager extends Employee {
     constructor(name: string, salary: number, public department: string) {
       super(name, salary);
     }
     
     getDetails(): string {
       return `${super.getDetails()} (Manager of ${this.department})`;
       // Calls parent method, then adds more info
     }
   }
   
   const manager = new Manager('Alice', 90000, 'Engineering');
   console.log(manager.getDetails());
   // 'Alice: $90000 (Manager of Engineering)'
   ```

4. **Abstract Classes (Cannot Instantiate)**

   ```typescript
   abstract class Shape {
     constructor(public color: string) {}
     
     abstract getArea(): number; // Must be implemented by child
     abstract getPerimeter(): number;
     
     describe(): void {
       console.log(`A ${this.color} shape with area ${this.getArea()}`);
     }
   }
   
   class Circle extends Shape {
     constructor(color: string, public radius: number) {
       super(color);
     }
     
     getArea(): number {
       return Math.PI * this.radius ** 2;
     }
     
     getPerimeter(): number {
       return 2 * Math.PI * this.radius;
     }
   }
   
   // const shape = new Shape('red'); // ❌ Error: cannot instantiate abstract
   const circle = new Circle('red', 5); // ✅
   circle.describe(); // 'A red shape with area 78.54...'
   ```

5. **Multiple Level Inheritance**

   ```typescript
   class LivingThing {
     breathe(): void {
       console.log('Breathing...');
     }
   }
   
   class Animal extends LivingThing {
     move(): void {
       console.log('Moving...');
     }
   }
   
   class Mammal extends Animal {
     feedYoung(): void {
       console.log('Feeding young with milk');
     }
   }
   
   const cat = new Mammal();
   cat.breathe();   // From LivingThing
   cat.move();      // From Animal
   cat.feedYoung(); // From Mammal
   ```

6. **Interfaces with Inheritance**

   ```typescript
   interface Printable {
     print(): void;
   }
   
   interface Scannable {
     scan(): void;
   }
   
   class Document implements Printable {
     print(): void {
       console.log('Printing document...');
     }
   }
   
   class MultiFunctionDevice extends Document implements Scannable {
     scan(): void {
       console.log('Scanning document...');
     }
   }
   
   const mfd = new MultiFunctionDevice();
   mfd.print(); // Inherited from Document
   mfd.scan();  // Implemented from Scannable
   ```

## Common Pitfalls

- Forgetting to call `super()` in child constructor (causes runtime error)
- Calling `super()` after using `this` in constructor (must be first)
- Overriding parent methods without using same signature
- Using `private` when `protected` is needed for inheritance
- Creating deep inheritance hierarchies (prefer composition over inheritance)
- Not marking base classes as `abstract` when they shouldn't be instantiated

## Practical Applications

- UI Component libraries (BaseComponent → Button, Input, Modal)
- Error handling hierarchies (Error → ValidationError → EmailValidationError)
- Database models (BaseModel → User, Product with common CRUD methods)
- Game development (GameObject → Player, Enemy, NPC)
- Authentication systems (BaseAuthProvider → GoogleAuth, GitHubAuth)

## References

- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [TypeScript Handbook: Inheritance](https://www.typescriptlang.org/docs/handbook/2/classes.html#extends-clauses)
- [MDN: Inheritance in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
- [TypeScript Deep Dive: Classes](https://basarat.gitbook.io/typescript/future-javascript/classes)

---

## Greater Detail

### Advanced Concepts

- **Method Override Rules:**
  ```typescript
  class Base {
    greet(name: string): string {
      return `Hello, ${name}`;
    }
  }
  
  class Derived extends Base {
    // ✅ Valid: Same signature
    greet(name: string): string {
      return `Hi, ${name}!`;
    }
    
    // ❌ Error: Different signature not allowed
    // greet(name: string, age: number): string { }
  }
  ```

- **Constructor Parameter Properties (Shorthand):**
  ```typescript
  class Person {
    // Traditional way
    name: string;
    age: number;
    
    constructor(name: string, age: number) {
      this.name = name;
      this.age = age;
    }
  }
  
  // Shorthand with access modifiers
  class PersonShort {
    constructor(public name: string, public age: number) {}
    // Automatically creates and assigns properties
  }
  ```

- **Polymorphism:**
  ```typescript
  abstract class PaymentMethod {
    abstract processPayment(amount: number): void;
  }
  
  class CreditCard extends PaymentMethod {
    processPayment(amount: number): void {
      console.log(`Charging $${amount} to credit card`);
    }
  }
  
  class PayPal extends PaymentMethod {
    processPayment(amount: number): void {
      console.log(`Processing $${amount} via PayPal`);
    }
  }
  
  function checkout(method: PaymentMethod, amount: number) {
    method.processPayment(amount); // Works with any payment method
  }
  
  checkout(new CreditCard(), 100);
  checkout(new PayPal(), 50);
  ```

- **Composition vs Inheritance (Prefer Composition):**
  ```typescript
  // ❌ Inheritance can get complex
  class FlyingSwimmingAnimal extends Animal { }
  
  // ✅ Composition is more flexible
  interface Flyable {
    fly(): void;
  }
  
  interface Swimmable {
    swim(): void;
  }
  
  class Duck implements Flyable, Swimmable {
    fly(): void { console.log('Flying...'); }
    swim(): void { console.log('Swimming...'); }
  }
  ```

- **Generic Classes with Inheritance:**
  ```typescript
  abstract class Repository<T> {
    protected items: T[] = [];
    
    add(item: T): void {
      this.items.push(item);
    }
    
    abstract findById(id: number): T | undefined;
  }
  
  interface User {
    id: number;
    name: string;
  }
  
  class UserRepository extends Repository<User> {
    findById(id: number): User | undefined {
      return this.items.find(user => user.id === id);
    }
  }
  ```

- **Static Members and Inheritance:**
  ```typescript
  class Base {
    static count = 0;
    static increment(): void {
      this.count++;
    }
  }
  
  class Derived extends Base {}
  
  Base.increment();
  console.log(Base.count); // 1
  console.log(Derived.count); // 0 (separate static members)
  ```

- **Mixins Pattern (Multiple Inheritance Alternative):**
  ```typescript
  type Constructor<T = {}> = new (...args: any[]) => T;
  
  function Timestamped<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
      createdAt = new Date();
    };
  }
  
  function Tagged<TBase extends Constructor>(Base: TBase) {
    return class extends Base {
      tags: string[] = [];
      addTag(tag: string) { this.tags.push(tag); }
    };
  }
  
  class User {
    constructor(public name: string) {}
  }
  
  const TaggedTimestampedUser = Tagged(Timestamped(User));
  const user = new TaggedTimestampedUser('Alice');
  user.addTag('admin');
  console.log(user.createdAt);
  ```

- **Best Practices:**
  - Favor composition over deep inheritance hierarchies (max 2-3 levels)
  - Use abstract classes when you need shared implementation
  - Use interfaces when you only need type contracts
  - Mark classes `final` conceptually if they shouldn't be extended (use TypeScript ESLint rules)
  - Keep the Liskov Substitution Principle in mind: child classes should be substitutable for parent classes