export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  starter_code: string;
  test_cases: Array<{
    input: string;
    expected_output: string;
  }>;
  tags: string[];
}

export const problems: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "Easy",
    starter_code: `def two_sum(nums, target):
    """
    Given an array of integers nums and an integer target,
    return indices of the two numbers such that they add up to target.
    
    Args:
        nums (List[int]): Array of integers
        target (int): Target sum
    
    Returns:
        List[int]: Indices of the two numbers that add up to target
    """
    # Your solution here
    pass

# Test your function
nums = [2, 7, 11, 15]
target = 9
result = two_sum(nums, target)
print(f"Input: nums = {nums}, target = {target}")
print(f"Output: {result}")
print(f"Expected: [0, 1]")
`,
    test_cases: [
      {
        input: "nums = [2, 7, 11, 15], target = 9",
        expected_output: "[0, 1]"
      },
      {
        input: "nums = [3, 2, 4], target = 6",
        expected_output: "[1, 2]"
      },
      {
        input: "nums = [3, 3], target = 6",
        expected_output: "[0, 1]"
      }
    ],
    tags: ["Array", "Hash Table", "Two Pointers"]
  },
  {
    id: "binary-search-tree",
    title: "Binary Search Tree Validation",
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as follows: The left subtree of a node contains only nodes with keys less than the node's key. The right subtree of a node contains only nodes with keys greater than the node's key. Both the left and right subtrees must also be binary search trees.",
    difficulty: "Medium",
    starter_code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def is_valid_bst(root):
    """
    Determine if a binary tree is a valid binary search tree.
    
    Args:
        root (TreeNode): Root of the binary tree
    
    Returns:
        bool: True if the tree is a valid BST, False otherwise
    """
    # Your solution here
    pass

# Test your function
# Example tree:    5
#                 / \\
#                2   6
#               / \\   \\
#              1   3   7

root = TreeNode(5)
root.left = TreeNode(2)
root.right = TreeNode(6)
root.left.left = TreeNode(1)
root.left.right = TreeNode(3)
root.right.right = TreeNode(7)

result = is_valid_bst(root)
print(f"Is valid BST: {result}")
print(f"Expected: True")
`,
    test_cases: [
      {
        input: "Tree: [5,2,6,1,3,null,7]",
        expected_output: "True"
      },
      {
        input: "Tree: [5,1,4,null,null,3,6]",
        expected_output: "False"
      },
      {
        input: "Tree: [2,1,3]",
        expected_output: "True"
      }
    ],
    tags: ["Tree", "Binary Search Tree", "Recursion", "Depth-First Search"]
  },
  {
    id: "dynamic-programming",
    title: "Fibonacci Sequence",
    description: "Write a function to compute the nth Fibonacci number. The Fibonacci sequence is defined as: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) for n > 1. Implement both recursive and dynamic programming solutions and compare their performance.",
    difficulty: "Medium",
    starter_code: `def fibonacci_recursive(n):
    """
    Compute the nth Fibonacci number using recursion.
    
    Args:
        n (int): The position in the Fibonacci sequence
    
    Returns:
        int: The nth Fibonacci number
    """
    # Your recursive solution here
    pass

def fibonacci_dp(n):
    """
    Compute the nth Fibonacci number using dynamic programming.
    
    Args:
        n (int): The position in the Fibonacci sequence
    
    Returns:
        int: The nth Fibonacci number
    """
    # Your dynamic programming solution here
    pass

# Test your functions
import time

n = 10
print(f"Computing Fibonacci({n}):")

# Test recursive solution
start_time = time.time()
result_recursive = fibonacci_recursive(n)
recursive_time = time.time() - start_time
print(f"Recursive result: {result_recursive}, Time: {recursive_time:.6f}s")

# Test DP solution
start_time = time.time()
result_dp = fibonacci_dp(n)
dp_time = time.time() - start_time
print(f"DP result: {result_dp}, Time: {dp_time:.6f}s")

print(f"Expected: 55")
`,
    test_cases: [
      {
        input: "n = 0",
        expected_output: "0"
      },
      {
        input: "n = 1",
        expected_output: "1"
      },
      {
        input: "n = 10",
        expected_output: "55"
      },
      {
        input: "n = 15",
        expected_output: "610"
      }
    ],
    tags: ["Dynamic Programming", "Recursion", "Math", "Memoization"]
  },
  {
    id: "graph-algorithms",
    title: "Graph Traversal - BFS and DFS",
    description: "Implement both Breadth-First Search (BFS) and Depth-First Search (DFS) algorithms for traversing a graph. Given an adjacency list representation of a graph and a starting node, return the order of nodes visited using each algorithm.",
    difficulty: "Hard",
    starter_code: `from collections import defaultdict, deque

class Graph:
    def __init__(self):
        self.graph = defaultdict(list)
    
    def add_edge(self, u, v):
        """Add an edge to the graph"""
        self.graph[u].append(v)
    
    def bfs(self, start):
        """
        Perform Breadth-First Search starting from the given node.
        
        Args:
            start: Starting node for BFS
        
        Returns:
            List: Order of nodes visited during BFS
        """
        # Your BFS implementation here
        pass
    
    def dfs(self, start):
        """
        Perform Depth-First Search starting from the given node.
        
        Args:
            start: Starting node for DFS
        
        Returns:
            List: Order of nodes visited during DFS
        """
        # Your DFS implementation here
        pass

# Test your implementation
g = Graph()
g.add_edge(0, 1)
g.add_edge(0, 2)
g.add_edge(1, 2)
g.add_edge(2, 0)
g.add_edge(2, 3)
g.add_edge(3, 3)

print("Graph edges:")
for node in g.graph:
    print(f"{node} -> {g.graph[node]}")

print("\\nBFS traversal starting from node 2:")
bfs_result = g.bfs(2)
print(bfs_result)
print("Expected: [2, 0, 3, 1]")

print("\\nDFS traversal starting from node 2:")
dfs_result = g.dfs(2)
print(dfs_result)
print("Expected: [2, 0, 1, 3] or [2, 3, 0, 1] (order may vary)")
`,
    test_cases: [
      {
        input: "Graph: 0->1,2 | 1->2 | 2->0,3 | 3->3, Start: 2",
        expected_output: "BFS: [2,0,3,1], DFS: [2,0,1,3] or similar"
      },
      {
        input: "Graph: 0->1 | 1->2 | 2->3, Start: 0",
        expected_output: "BFS: [0,1,2,3], DFS: [0,1,2,3]"
      }
    ],
    tags: ["Graph", "Breadth-First Search", "Depth-First Search", "Data Structures"]
  },
  {
    id: "array-manipulation",
    title: "Array Rotation",
    description: "Given an array, rotate the array to the right by k steps, where k is non-negative. Try to solve this problem with O(1) extra space if possible.",
    difficulty: "Easy",
    starter_code: `def rotate_array(nums, k):
    """
    Rotate the array to the right by k steps.
    
    Args:
        nums (List[int]): Array to rotate (modify in-place)
        k (int): Number of steps to rotate right
    
    Returns:
        None: Modify nums in-place
    """
    # Your solution here
    pass

# Test your function
nums1 = [1, 2, 3, 4, 5, 6, 7]
k1 = 3
print(f"Original array: {nums1}")
print(f"Rotate right by {k1} steps")
rotate_array(nums1, k1)
print(f"Result: {nums1}")
print(f"Expected: [5, 6, 7, 1, 2, 3, 4]")

print()

nums2 = [-1, -100, 3, 99]
k2 = 2
print(f"Original array: {nums2}")
print(f"Rotate right by {k2} steps")
rotate_array(nums2, k2)
print(f"Result: {nums2}")
print(f"Expected: [3, 99, -1, -100]")
`,
    test_cases: [
      {
        input: "nums = [1,2,3,4,5,6,7], k = 3",
        expected_output: "[5,6,7,1,2,3,4]"
      },
      {
        input: "nums = [-1,-100,3,99], k = 2",
        expected_output: "[3,99,-1,-100]"
      },
      {
        input: "nums = [1,2], k = 1",
        expected_output: "[2,1]"
      }
    ],
    tags: ["Array", "Math", "Two Pointers"]
  }
];

export const getProblemById = (id: string): Problem | undefined => {
  return problems.find(problem => problem.id === id);
};

export const getProblemsByDifficulty = (difficulty: 'Easy' | 'Medium' | 'Hard'): Problem[] => {
  return problems.filter(problem => problem.difficulty === difficulty);
};

export const getProblemsByTag = (tag: string): Problem[] => {
  return problems.filter(problem => problem.tags.includes(tag));
};
