# Graph Data Structures in JavaScript

A graph is a non-linear data structure consisting of nodes (vertices) and edges that connect them. Graphs model relationships and networks, making them essential for social networks, maps, recommendation systems, and dependency resolution.

## Key Points

- **Components:** Graphs consist of vertices (nodes) and edges (connections between nodes)
- **Types:** Directed vs undirected, weighted vs unweighted, cyclic vs acyclic
- **Representations:** Adjacency list (space-efficient) and adjacency matrix (fast lookups)
- **Common Operations:** Add/remove vertices and edges, check connectivity, find paths
- **Traversal Methods:** Depth-First Search (DFS) and Breadth-First Search (BFS)
- **Applications:** Social networks, routing algorithms, dependency graphs, recommendation engines
- **Complexity:** Space O(V + E), traversal O(V + E) where V = vertices, E = edges

## Step-by-Step Explanation & Examples

### 1. Basic Graph Implementation (Adjacency List)

Most practical implementation for sparse graphs:

```js
class Graph {
  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  addEdge(v1, v2) {
    this.adjacencyList[v1].push(v2);
    this.adjacencyList[v2].push(v1); // Undirected graph
  }

  removeEdge(v1, v2) {
    this.adjacencyList[v1] = this.adjacencyList[v1].filter(v => v !== v2);
    this.adjacencyList[v2] = this.adjacencyList[v2].filter(v => v !== v1);
  }

  removeVertex(vertex) {
    while (this.adjacencyList[vertex].length) {
      const adjacentVertex = this.adjacencyList[vertex].pop();
      this.removeEdge(vertex, adjacentVertex);
    }
    delete this.adjacencyList[vertex];
  }
}

// Usage
const graph = new Graph();
graph.addVertex('A');
graph.addVertex('B');
graph.addVertex('C');
graph.addEdge('A', 'B');
graph.addEdge('A', 'C');
// Result: A connects to B and C
```

### 2. Depth-First Search (DFS)

Anecdote: When building a file system explorer, I used DFS to recursively traverse directories. It naturally handles the "go deep before going wide" pattern - perfect for exploring nested structures.

```js
class Graph {
  // ... previous methods ...

  dfsRecursive(start) {
    const result = [];
    const visited = {};
    const adjacencyList = this.adjacencyList;

    function dfs(vertex) {
      if (!vertex) return null;
      visited[vertex] = true;
      result.push(vertex);

      adjacencyList[vertex].forEach(neighbor => {
        if (!visited[neighbor]) {
          return dfs(neighbor);
        }
      });
    }

    dfs(start);
    return result;
  }

  dfsIterative(start) {
    const stack = [start];
    const result = [];
    const visited = {};
    visited[start] = true;

    while (stack.length) {
      const vertex = stack.pop();
      result.push(vertex);

      this.adjacencyList[vertex].forEach(neighbor => {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          stack.push(neighbor);
        }
      });
    }

    return result;
  }
}
```

### 3. Breadth-First Search (BFS)

Used for finding shortest paths in unweighted graphs:

```js
class Graph {
  // ... previous methods ...

  bfs(start) {
    const queue = [start];
    const result = [];
    const visited = {};
    visited[start] = true;

    while (queue.length) {
      const vertex = queue.shift();
      result.push(vertex);

      this.adjacencyList[vertex].forEach(neighbor => {
        if (!visited[neighbor]) {
          visited[neighbor] = true;
          queue.push(neighbor);
        }
      });
    }

    return result;
  }
}

// Example: Social network "degrees of separation"
const social = new Graph();
['Alice', 'Bob', 'Charlie', 'David', 'Eve'].forEach(p => social.addVertex(p));
social.addEdge('Alice', 'Bob');
social.addEdge('Bob', 'Charlie');
social.addEdge('Charlie', 'David');
social.addEdge('Alice', 'Eve');

console.log(social.bfs('Alice'));
// Result: ['Alice', 'Bob', 'Eve', 'Charlie', 'David']
// Shows connections by proximity to Alice
```

### 4. Directed Graph Implementation

For one-way relationships (followers, dependencies):

```js
class DirectedGraph {
  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  addEdge(from, to) {
    this.adjacencyList[from].push(to); // Only one direction
  }

  hasPath(start, end) {
    const visited = new Set();
    
    function dfs(vertex) {
      if (vertex === end) return true;
      if (visited.has(vertex)) return false;
      
      visited.add(vertex);
      
      for (let neighbor of this.adjacencyList[vertex] || []) {
        if (dfs.call(this, neighbor)) return true;
      }
      
      return false;
    }
    
    return dfs.call(this, start);
  }
}

// Example: Course prerequisites
const courses = new DirectedGraph();
['Intro', 'DataStructures', 'Algorithms', 'Systems'].forEach(c => courses.addVertex(c));
courses.addEdge('Intro', 'DataStructures');
courses.addEdge('DataStructures', 'Algorithms');
courses.addEdge('Algorithms', 'Systems');

console.log(courses.hasPath('Intro', 'Systems')); // true
console.log(courses.hasPath('Systems', 'Intro')); // false
```

### 5. Weighted Graph

For scenarios with costs/distances:

```js
class WeightedGraph {
  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex) {
    if (!this.adjacencyList[vertex]) {
      this.adjacencyList[vertex] = [];
    }
  }

  addEdge(v1, v2, weight) {
    this.adjacencyList[v1].push({ node: v2, weight });
    this.adjacencyList[v2].push({ node: v1, weight });
  }
}

// Example: City connections with distances
const map = new WeightedGraph();
['LA', 'SF', 'Vegas', 'Phoenix'].forEach(city => map.addVertex(city));
map.addEdge('LA', 'SF', 380);
map.addEdge('LA', 'Vegas', 270);
map.addEdge('LA', 'Phoenix', 370);
map.addEdge('Vegas', 'Phoenix', 300);
```

### 6. Finding Shortest Path (BFS for Unweighted)

```js
class Graph {
  // ... previous methods ...

  shortestPath(start, end) {
    const queue = [[start]];
    const visited = new Set([start]);

    while (queue.length) {
      const path = queue.shift();
      const vertex = path[path.length - 1];

      if (vertex === end) {
        return path;
      }

      for (let neighbor of this.adjacencyList[vertex]) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    return null; // No path found
  }
}

// Example
const network = new Graph();
['A', 'B', 'C', 'D', 'E'].forEach(n => network.addVertex(n));
network.addEdge('A', 'B');
network.addEdge('A', 'C');
network.addEdge('B', 'D');
network.addEdge('C', 'E');
network.addEdge('D', 'E');

console.log(network.shortestPath('A', 'E'));
// Result: ['A', 'C', 'E'] (shortest path)
```

### 7. Cycle Detection

Important for dependency resolution:

```js
class DirectedGraph {
  // ... previous methods ...

  hasCycle() {
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycleUtil = (vertex) => {
      visited.add(vertex);
      recursionStack.add(vertex);

      for (let neighbor of this.adjacencyList[vertex] || []) {
        if (!visited.has(neighbor)) {
          if (hasCycleUtil(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true; // Cycle detected
        }
      }

      recursionStack.delete(vertex);
      return false;
    };

    for (let vertex in this.adjacencyList) {
      if (!visited.has(vertex)) {
        if (hasCycleUtil(vertex)) return true;
      }
    }

    return false;
  }
}
```

## Common Pitfalls

- **Not tracking visited nodes:** Causes infinite loops in cyclic graphs
- **Wrong data structure choice:** Using adjacency matrix for sparse graphs wastes memory
- **Forgetting edge direction:** Mixing directed/undirected operations
- **Stack overflow with recursive DFS:** Use iterative approach for very deep graphs
- **Not handling disconnected graphs:** Some vertices may be unreachable from start node
- **Modifying graph during traversal:** Can cause unexpected behavior or missed nodes

## Practical Applications

- **Social Networks:** Friend recommendations, finding connections between users
- **Maps and Navigation:** Route finding (GPS), shortest path algorithms
- **Web Crawling:** Traversing links between web pages
- **Dependency Resolution:** Package managers (npm), build systems, task scheduling
- **Network Analysis:** Computer networks, communication protocols
- **Recommendation Systems:** "People who liked X also liked Y"
- **Game Development:** Pathfinding for AI characters, game state graphs

## References

- [MDN: Data Structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)
- [Graph Theory Basics](https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/)
- [Introduction to Algorithms (CLRS)](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/)

---

## Greater Detail: Advanced Concepts

### Adjacency Matrix Implementation

Better for dense graphs with fast edge lookup requirements:

```js
class GraphMatrix {
  constructor(size) {
    this.size = size;
    this.matrix = Array(size).fill(null).map(() => Array(size).fill(0));
    this.vertices = {};
    this.vertexCount = 0;
  }

  addVertex(vertex) {
    if (this.vertexCount >= this.size) {
      throw new Error('Graph is full');
    }
    this.vertices[vertex] = this.vertexCount;
    this.vertexCount++;
  }

  addEdge(v1, v2, weight = 1) {
    const i = this.vertices[v1];
    const j = this.vertices[v2];
    this.matrix[i][j] = weight;
    this.matrix[j][i] = weight; // Undirected
  }

  hasEdge(v1, v2) {
    const i = this.vertices[v1];
    const j = this.vertices[v2];
    return this.matrix[i][j] !== 0;
  }

  getWeight(v1, v2) {
    const i = this.vertices[v1];
    const j = this.vertices[v2];
    return this.matrix[i][j];
  }
}

// Comparison:
// Adjacency List: Space O(V + E), Edge check O(V)
// Adjacency Matrix: Space O(V²), Edge check O(1)
```

### Dijkstra's Algorithm (Shortest Path in Weighted Graphs)

Real-world scenario: Finding fastest route considering traffic/distance:

```js
class WeightedGraph {
  // ... previous methods ...

  dijkstra(start, end) {
    const distances = {};
    const previous = {};
    const pq = new PriorityQueue();
    
    // Initialize
    for (let vertex in this.adjacencyList) {
      if (vertex === start) {
        distances[vertex] = 0;
        pq.enqueue(vertex, 0);
      } else {
        distances[vertex] = Infinity;
        pq.enqueue(vertex, Infinity);
      }
      previous[vertex] = null;
    }

    while (!pq.isEmpty()) {
      const smallest = pq.dequeue().value;
      
      if (smallest === end) {
        // Build path
        const path = [];
        let current = end;
        while (current) {
          path.push(current);
          current = previous[current];
        }
        return {
          path: path.reverse(),
          distance: distances[end]
        };
      }

      if (distances[smallest] !== Infinity) {
        for (let neighbor of this.adjacencyList[smallest]) {
          const distance = distances[smallest] + neighbor.weight;
          
          if (distance < distances[neighbor.node]) {
            distances[neighbor.node] = distance;
            previous[neighbor.node] = smallest;
            pq.enqueue(neighbor.node, distance);
          }
        }
      }
    }

    return { path: [], distance: Infinity };
  }
}

// Simple Priority Queue implementation
class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(value, priority) {
    this.values.push({ value, priority });
    this.sort();
  }

  dequeue() {
    return this.values.shift();
  }

  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }

  isEmpty() {
    return this.values.length === 0;
  }
}
```

### Topological Sort (Dependency Ordering)

Essential for build systems and task scheduling:

```js
class DirectedGraph {
  // ... previous methods ...

  topologicalSort() {
    const visited = new Set();
    const stack = [];

    const dfsUtil = (vertex) => {
      visited.add(vertex);

      for (let neighbor of this.adjacencyList[vertex] || []) {
        if (!visited.has(neighbor)) {
          dfsUtil(neighbor);
        }
      }

      stack.push(vertex);
    };

    for (let vertex in this.adjacencyList) {
      if (!visited.has(vertex)) {
        dfsUtil(vertex);
      }
    }

    return stack.reverse();
  }
}

// Example: Build order for tasks
const tasks = new DirectedGraph();
['A', 'B', 'C', 'D', 'E'].forEach(t => tasks.addVertex(t));
tasks.addEdge('A', 'C'); // A must complete before C
tasks.addEdge('B', 'C');
tasks.addEdge('B', 'D');
tasks.addEdge('C', 'E');
tasks.addEdge('D', 'E');

console.log(tasks.topologicalSort());
// Result: ['B', 'D', 'A', 'C', 'E'] or ['A', 'B', 'D', 'C', 'E']
// Valid execution orders
```

### Strongly Connected Components (Kosaraju's Algorithm)

Finding clusters in directed graphs:

```js
class DirectedGraph {
  // ... previous methods ...

  getTranspose() {
    const transposed = new DirectedGraph();
    
    for (let vertex in this.adjacencyList) {
      transposed.addVertex(vertex);
    }
    
    for (let vertex in this.adjacencyList) {
      for (let neighbor of this.adjacencyList[vertex]) {
        transposed.addEdge(neighbor, vertex); // Reverse edge
      }
    }
    
    return transposed;
  }

  findSCCs() {
    const visited = new Set();
    const stack = [];

    // First DFS to fill stack
    const fillOrder = (vertex) => {
      visited.add(vertex);
      for (let neighbor of this.adjacencyList[vertex] || []) {
        if (!visited.has(neighbor)) {
          fillOrder(neighbor);
        }
      }
      stack.push(vertex);
    };

    for (let vertex in this.adjacencyList) {
      if (!visited.has(vertex)) {
        fillOrder(vertex);
      }
    }

    // Get transposed graph
    const transposed = this.getTranspose();
    visited.clear();
    const sccs = [];

    // Second DFS on transposed graph
    const dfs = (vertex, component) => {
      visited.add(vertex);
      component.push(vertex);
      for (let neighbor of transposed.adjacencyList[vertex] || []) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, component);
        }
      }
    };

    while (stack.length) {
      const vertex = stack.pop();
      if (!visited.has(vertex)) {
        const component = [];
        dfs(vertex, component);
        sccs.push(component);
      }
    }

    return sccs;
  }
}
```

### Graph Coloring (Scheduling Problems)

Anecdote: Used this for exam scheduling - ensuring no student has conflicting exams at the same time. Each color represents a time slot.

```js
class Graph {
  // ... previous methods ...

  greedyColoring() {
    const colors = {};
    const available = new Set();

    for (let vertex in this.adjacencyList) {
      // Mark colors of adjacent vertices as unavailable
      for (let neighbor of this.adjacencyList[vertex]) {
        if (colors[neighbor] !== undefined) {
          available.add(colors[neighbor]);
        }
      }

      // Find first available color
      let color = 0;
      while (available.has(color)) {
        color++;
      }

      colors[vertex] = color;
      available.clear();
    }

    return colors;
  }

  getChromaticNumber() {
    const colors = this.greedyColoring();
    return Math.max(...Object.values(colors)) + 1;
  }
}
```

### Minimum Spanning Tree (Prim's Algorithm)

Finding minimum cost to connect all nodes:

```js
class WeightedGraph {
  // ... previous methods ...

  primsMST() {
    const visited = new Set();
    const mst = [];
    let totalWeight = 0;

    const start = Object.keys(this.adjacencyList)[0];
    visited.add(start);

    while (visited.size < Object.keys(this.adjacencyList).length) {
      let minEdge = null;
      let minWeight = Infinity;

      // Find minimum edge from visited to unvisited
      for (let vertex of visited) {
        for (let edge of this.adjacencyList[vertex]) {
          if (!visited.has(edge.node) && edge.weight < minWeight) {
            minWeight = edge.weight;
            minEdge = { from: vertex, to: edge.node, weight: edge.weight };
          }
        }
      }

      if (minEdge) {
        mst.push(minEdge);
        totalWeight += minWeight;
        visited.add(minEdge.to);
      }
    }

    return { edges: mst, totalWeight };
  }
}

// Example: Connecting cities with minimum cable cost
const network = new WeightedGraph();
['A', 'B', 'C', 'D'].forEach(n => network.addVertex(n));
network.addEdge('A', 'B', 4);
network.addEdge('A', 'C', 2);
network.addEdge('B', 'C', 1);
network.addEdge('B', 'D', 5);
network.addEdge('C', 'D', 3);

const mst = network.primsMS T();
// Returns minimum edges to connect all nodes
```

### Bidirectional Search (Faster Path Finding)

Search from both start and end simultaneously:

```js
class Graph {
  // ... previous methods ...

  bidirectionalSearch(start, end) {
    if (start === end) return [start];

    const visitedFromStart = new Map([[start, null]]);
    const visitedFromEnd = new Map([[end, null]]);
    const queueStart = [start];
    const queueEnd = [end];

    const buildPath = (meeting, fromStart, fromEnd) => {
      const path = [];
      let current = meeting;
      
      // Build path from start to meeting
      while (current !== null) {
        path.unshift(current);
        current = fromStart.get(current);
      }
      
      // Build path from meeting to end
      current = fromEnd.get(meeting);
      while (current !== null) {
        path.push(current);
        current = fromEnd.get(current);
      }
      
      return path;
    };

    while (queueStart.length && queueEnd.length) {
      // Search from start
      const vertexStart = queueStart.shift();
      for (let neighbor of this.adjacencyList[vertexStart]) {
        if (visitedFromEnd.has(neighbor)) {
          return buildPath(neighbor, visitedFromStart, visitedFromEnd);
        }
        if (!visitedFromStart.has(neighbor)) {
          visitedFromStart.set(neighbor, vertexStart);
          queueStart.push(neighbor);
        }
      }

      // Search from end
      const vertexEnd = queueEnd.shift();
      for (let neighbor of this.adjacencyList[vertexEnd]) {
        if (visitedFromStart.has(neighbor)) {
          return buildPath(neighbor, visitedFromStart, visitedFromEnd);
        }
        if (!visitedFromEnd.has(neighbor)) {
          visitedFromEnd.set(neighbor, vertexEnd);
          queueEnd.push(neighbor);
        }
      }
    }

    return null;
  }
}
```