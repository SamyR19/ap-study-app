// AP CSA FRQ Question Bank
// 30 questions covering all 10 major topics
// 3 FRQs per topic with varying difficulty

export interface RubricSection {
  section: string;
  points: number;
  criteria: string[];
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  description?: string;
}

export interface FRQQuestion {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  starterCode: string;
  rubric: RubricSection[];
  totalPoints: number;
  testCases: TestCase[];
  sampleSolution: string;
  hints: string[];
}

export const FRQ_BANK: FRQQuestion[] = [
  // ========== PRIMITIVE TYPES & EXPRESSIONS ==========
  {
    id: 'csa-frq-001',
    topic: 'csa-1-1',
    difficulty: 'easy',
    title: 'Temperature Converter',
    description: `Write a method called celsiusToFahrenheit that converts a temperature from Celsius to Fahrenheit.

The formula is: F = (C × 9/5) + 32

Requirements:
- The method should take a double parameter representing Celsius
- Return the temperature in Fahrenheit as a double
- The result should be accurate to at least 2 decimal places`,
    starterCode: `public class TemperatureConverter {
    /**
     * Converts Celsius to Fahrenheit.
     * @param celsius the temperature in Celsius
     * @return the temperature in Fahrenheit
     */
    public static double celsiusToFahrenheit(double celsius) {
        // Your code here

    }

    public static void main(String[] args) {
        System.out.println(celsiusToFahrenheit(0));    // Expected: 32.0
        System.out.println(celsiusToFahrenheit(100));  // Expected: 212.0
        System.out.println(celsiusToFahrenheit(-40));  // Expected: -40.0
    }
}`,
    rubric: [
      {
        section: 'Formula Implementation',
        points: 3,
        criteria: [
          'Multiplies celsius by 9/5 or 1.8',
          'Adds 32 to the result',
          'Uses proper order of operations',
        ],
      },
      {
        section: 'Return Statement',
        points: 2,
        criteria: [
          'Returns the calculated value',
          'Return type matches double',
        ],
      },
    ],
    totalPoints: 5,
    testCases: [
      { input: '0', expectedOutput: '32.0', description: 'Freezing point' },
      { input: '100', expectedOutput: '212.0', description: 'Boiling point' },
      { input: '-40', expectedOutput: '-40.0', description: 'Same in both scales' },
      { input: '37', expectedOutput: '98.6', description: 'Body temperature', isHidden: true },
    ],
    sampleSolution: `public static double celsiusToFahrenheit(double celsius) {
    return (celsius * 9.0 / 5.0) + 32;
}`,
    hints: [
      'Remember to use 9.0/5.0 instead of 9/5 to avoid integer division',
      'The formula is F = C × 1.8 + 32',
      'Test with known values like 0°C = 32°F',
    ],
  },
  {
    id: 'csa-frq-002',
    topic: 'csa-1-2',
    difficulty: 'medium',
    title: 'Digit Extractor',
    description: `Write a method called getDigit that extracts a specific digit from an integer.

The position is counted from the right, starting at 0 (ones place).

Examples:
- getDigit(12345, 0) returns 5 (ones place)
- getDigit(12345, 2) returns 3 (hundreds place)
- getDigit(12345, 4) returns 1 (ten-thousands place)

Requirements:
- Use integer division and modulus operators
- Return 0 if the position is out of range`,
    starterCode: `public class DigitExtractor {
    /**
     * Extracts a digit at the specified position from the right.
     * @param number the input integer
     * @param position the position from right (0 = ones place)
     * @return the digit at that position, or 0 if out of range
     */
    public static int getDigit(int number, int position) {
        // Your code here

    }

    public static void main(String[] args) {
        System.out.println(getDigit(12345, 0));  // Expected: 5
        System.out.println(getDigit(12345, 2));  // Expected: 3
        System.out.println(getDigit(12345, 4));  // Expected: 1
        System.out.println(getDigit(12345, 5));  // Expected: 0
    }
}`,
    rubric: [
      {
        section: 'Division Strategy',
        points: 3,
        criteria: [
          'Uses Math.pow or loop to get divisor (10^position)',
          'Divides number to shift desired digit to ones place',
          'Uses modulus 10 to extract the digit',
        ],
      },
      {
        section: 'Edge Cases',
        points: 2,
        criteria: [
          'Handles position 0 correctly',
          'Returns 0 for out-of-range positions',
        ],
      },
    ],
    totalPoints: 5,
    testCases: [
      { input: '12345, 0', expectedOutput: '5', description: 'Ones place' },
      { input: '12345, 2', expectedOutput: '3', description: 'Hundreds place' },
      { input: '12345, 5', expectedOutput: '0', description: 'Out of range' },
      { input: '7, 0', expectedOutput: '7', description: 'Single digit', isHidden: true },
    ],
    sampleSolution: `public static int getDigit(int number, int position) {
    int divisor = (int) Math.pow(10, position);
    return (number / divisor) % 10;
}`,
    hints: [
      'To get the digit at position p, first divide by 10^p',
      'Then use % 10 to get just that digit',
      'Math.pow returns a double, so cast to int',
    ],
  },

  // ========== USING OBJECTS ==========
  {
    id: 'csa-frq-003',
    topic: 'csa-2-1',
    difficulty: 'easy',
    title: 'String Analyzer',
    description: `Write a method called analyzeString that returns information about a given string.

The method should return a formatted string containing:
- The length of the string
- The first character
- The last character
- Whether the string is a palindrome (same forwards and backwards)

Format: "Length: X, First: A, Last: B, Palindrome: true/false"`,
    starterCode: `public class StringAnalyzer {
    /**
     * Analyzes a string and returns formatted information.
     * @param s the input string (assume non-empty)
     * @return formatted analysis string
     */
    public static String analyzeString(String s) {
        // Your code here

    }

    public static void main(String[] args) {
        System.out.println(analyzeString("hello"));
        // Expected: Length: 5, First: h, Last: o, Palindrome: false

        System.out.println(analyzeString("racecar"));
        // Expected: Length: 7, First: r, Last: r, Palindrome: true
    }
}`,
    rubric: [
      {
        section: 'String Methods',
        points: 3,
        criteria: [
          'Uses length() to get string length',
          'Uses charAt(0) for first character',
          'Uses charAt(length-1) for last character',
        ],
      },
      {
        section: 'Palindrome Check',
        points: 3,
        criteria: [
          'Compares string with its reverse',
          'Uses StringBuilder or loop for reversal',
          'Correctly identifies palindromes',
        ],
      },
      {
        section: 'Output Format',
        points: 3,
        criteria: [
          'Matches expected format exactly',
          'Includes all four pieces of information',
          'Proper spacing and punctuation',
        ],
      },
    ],
    totalPoints: 9,
    testCases: [
      {
        input: 'hello',
        expectedOutput: 'Length: 5, First: h, Last: o, Palindrome: false',
        description: 'Non-palindrome',
      },
      {
        input: 'racecar',
        expectedOutput: 'Length: 7, First: r, Last: r, Palindrome: true',
        description: 'Palindrome',
      },
      {
        input: 'a',
        expectedOutput: 'Length: 1, First: a, Last: a, Palindrome: true',
        description: 'Single character',
        isHidden: true,
      },
    ],
    sampleSolution: `public static String analyzeString(String s) {
    int len = s.length();
    char first = s.charAt(0);
    char last = s.charAt(len - 1);

    String reversed = new StringBuilder(s).reverse().toString();
    boolean isPalindrome = s.equals(reversed);

    return "Length: " + len + ", First: " + first +
           ", Last: " + last + ", Palindrome: " + isPalindrome;
}`,
    hints: [
      'Use s.charAt(0) for the first character',
      'Use s.charAt(s.length() - 1) for the last character',
      'StringBuilder has a reverse() method that makes palindrome checking easy',
    ],
  },

  // ========== BOOLEAN EXPRESSIONS & IF STATEMENTS ==========
  {
    id: 'csa-frq-004',
    topic: 'csa-3-1',
    difficulty: 'medium',
    title: 'Grade Calculator',
    description: `Write a method called calculateGrade that determines a letter grade based on a numeric score.

Grading scale:
- 90-100: A
- 80-89: B
- 70-79: C
- 60-69: D
- Below 60: F

Additional requirements:
- Add "+" for scores in the top 3 points of each range (except A)
- Add "-" for scores in the bottom 3 points of each range (except F)
- Example: 97-100 is A, 90-92 is A-, 87-89 is B+`,
    starterCode: `public class GradeCalculator {
    /**
     * Calculates letter grade with +/- modifiers.
     * @param score the numeric score (0-100)
     * @return the letter grade with modifier
     */
    public static String calculateGrade(int score) {
        // Your code here

    }

    public static void main(String[] args) {
        System.out.println(calculateGrade(95));  // Expected: A
        System.out.println(calculateGrade(91));  // Expected: A-
        System.out.println(calculateGrade(88));  // Expected: B+
        System.out.println(calculateGrade(72));  // Expected: C-
        System.out.println(calculateGrade(55));  // Expected: F
    }
}`,
    rubric: [
      {
        section: 'Base Grade Logic',
        points: 4,
        criteria: [
          'Correctly identifies A range (90-100)',
          'Correctly identifies B range (80-89)',
          'Correctly identifies C range (70-79)',
          'Correctly identifies D and F ranges',
        ],
      },
      {
        section: 'Modifier Logic',
        points: 4,
        criteria: [
          'Adds + for top 3 points of B, C, D ranges',
          'Adds - for bottom 3 points of A, B, C, D ranges',
          'No modifier for middle scores',
          'No + for A, no - for F',
        ],
      },
      {
        section: 'Edge Cases',
        points: 1,
        criteria: [
          'Handles boundary scores correctly (90, 80, 70, 60)',
        ],
      },
    ],
    totalPoints: 9,
    testCases: [
      { input: '95', expectedOutput: 'A', description: 'Regular A' },
      { input: '91', expectedOutput: 'A-', description: 'A minus' },
      { input: '88', expectedOutput: 'B+', description: 'B plus' },
      { input: '85', expectedOutput: 'B', description: 'Regular B' },
      { input: '72', expectedOutput: 'C-', description: 'C minus' },
      { input: '55', expectedOutput: 'F', description: 'F grade' },
    ],
    sampleSolution: `public static String calculateGrade(int score) {
    String grade;
    String modifier = "";

    if (score >= 90) {
        grade = "A";
        if (score <= 92) modifier = "-";
    } else if (score >= 80) {
        grade = "B";
        if (score >= 87) modifier = "+";
        else if (score <= 82) modifier = "-";
    } else if (score >= 70) {
        grade = "C";
        if (score >= 77) modifier = "+";
        else if (score <= 72) modifier = "-";
    } else if (score >= 60) {
        grade = "D";
        if (score >= 67) modifier = "+";
        else if (score <= 62) modifier = "-";
    } else {
        grade = "F";
    }

    return grade + modifier;
}`,
    hints: [
      'First determine the base letter grade using if-else-if',
      'Then check if the score is in the top or bottom 3 of that range',
      'Remember: no A+ and no F-',
    ],
  },

  // ========== ITERATION ==========
  {
    id: 'csa-frq-005',
    topic: 'csa-4-1',
    difficulty: 'medium',
    title: 'Prime Number Finder',
    description: `Write two methods for working with prime numbers:

1. isPrime(int n): Returns true if n is prime, false otherwise
2. findPrimes(int limit): Returns a string of all prime numbers from 2 to limit, separated by spaces

A prime number is a number greater than 1 that is only divisible by 1 and itself.`,
    starterCode: `public class PrimeFinder {
    /**
     * Checks if a number is prime.
     * @param n the number to check
     * @return true if prime, false otherwise
     */
    public static boolean isPrime(int n) {
        // Your code here

    }

    /**
     * Finds all primes up to limit.
     * @param limit the upper bound (inclusive)
     * @return space-separated string of primes
     */
    public static String findPrimes(int limit) {
        // Your code here

    }

    public static void main(String[] args) {
        System.out.println(isPrime(7));     // Expected: true
        System.out.println(isPrime(10));    // Expected: false
        System.out.println(findPrimes(20)); // Expected: 2 3 5 7 11 13 17 19
    }
}`,
    rubric: [
      {
        section: 'isPrime Method',
        points: 4,
        criteria: [
          'Returns false for n <= 1',
          'Uses loop to check divisibility',
          'Optimized to check up to sqrt(n) or n/2',
          'Returns true only for primes',
        ],
      },
      {
        section: 'findPrimes Method',
        points: 4,
        criteria: [
          'Loops from 2 to limit',
          'Calls isPrime for each number',
          'Builds result string correctly',
          'Handles spacing properly',
        ],
      },
      {
        section: 'Edge Cases',
        points: 1,
        criteria: [
          'Handles small inputs (limit < 2)',
        ],
      },
    ],
    totalPoints: 9,
    testCases: [
      { input: 'isPrime(7)', expectedOutput: 'true', description: 'Prime number' },
      { input: 'isPrime(10)', expectedOutput: 'false', description: 'Composite number' },
      { input: 'isPrime(1)', expectedOutput: 'false', description: '1 is not prime' },
      { input: 'findPrimes(10)', expectedOutput: '2 3 5 7', description: 'Primes to 10' },
    ],
    sampleSolution: `public static boolean isPrime(int n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0) return false;

    for (int i = 3; i <= Math.sqrt(n); i += 2) {
        if (n % i == 0) return false;
    }
    return true;
}

public static String findPrimes(int limit) {
    StringBuilder result = new StringBuilder();
    for (int i = 2; i <= limit; i++) {
        if (isPrime(i)) {
            if (result.length() > 0) result.append(" ");
            result.append(i);
        }
    }
    return result.toString();
}`,
    hints: [
      'A number is prime if it has no divisors other than 1 and itself',
      'You only need to check divisors up to the square root of n',
      'Use StringBuilder for efficient string building in loops',
    ],
  },

  // ========== WRITING CLASSES ==========
  {
    id: 'csa-frq-006',
    topic: 'csa-5-1',
    difficulty: 'medium',
    title: 'Bank Account Class',
    description: `Create a BankAccount class with the following specifications:

Instance variables (private):
- accountNumber (String)
- balance (double)

Constructor:
- Takes accountNumber and initialBalance as parameters
- Sets balance to 0 if initialBalance is negative

Methods:
- deposit(double amount): Adds amount to balance (ignore if negative)
- withdraw(double amount): Subtracts amount if sufficient funds, returns true/false
- getBalance(): Returns current balance
- toString(): Returns "Account #XXXX: $XX.XX"`,
    starterCode: `public class BankAccount {
    // Instance variables


    // Constructor


    // deposit method


    // withdraw method


    // getBalance method


    // toString method


    public static void main(String[] args) {
        BankAccount acc = new BankAccount("1234", 100.0);
        System.out.println(acc);  // Account #1234: $100.00

        acc.deposit(50);
        System.out.println(acc.getBalance());  // 150.0

        System.out.println(acc.withdraw(200)); // false
        System.out.println(acc.withdraw(75));  // true
        System.out.println(acc);  // Account #1234: $75.00
    }
}`,
    rubric: [
      {
        section: 'Instance Variables',
        points: 2,
        criteria: [
          'Declares private accountNumber',
          'Declares private balance',
        ],
      },
      {
        section: 'Constructor',
        points: 2,
        criteria: [
          'Initializes both instance variables',
          'Handles negative initial balance',
        ],
      },
      {
        section: 'deposit Method',
        points: 2,
        criteria: [
          'Adds valid amounts to balance',
          'Ignores negative amounts',
        ],
      },
      {
        section: 'withdraw Method',
        points: 2,
        criteria: [
          'Checks for sufficient funds',
          'Returns boolean result',
        ],
      },
      {
        section: 'Other Methods',
        points: 1,
        criteria: [
          'getBalance returns balance',
          'toString matches format',
        ],
      },
    ],
    totalPoints: 9,
    testCases: [
      { input: 'new account with 100', expectedOutput: 'Account #1234: $100.00', description: 'Constructor and toString' },
      { input: 'deposit 50', expectedOutput: '150.0', description: 'Deposit works' },
      { input: 'withdraw 200', expectedOutput: 'false', description: 'Insufficient funds' },
      { input: 'withdraw 75', expectedOutput: 'true', description: 'Successful withdrawal' },
    ],
    sampleSolution: `public class BankAccount {
    private String accountNumber;
    private double balance;

    public BankAccount(String accountNumber, double initialBalance) {
        this.accountNumber = accountNumber;
        this.balance = initialBalance >= 0 ? initialBalance : 0;
    }

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }

    public double getBalance() {
        return balance;
    }

    public String toString() {
        return String.format("Account #%s: $%.2f", accountNumber, balance);
    }
}`,
    hints: [
      'Use this.variableName to distinguish instance variables from parameters',
      'The withdraw method should return false if there are insufficient funds',
      'Use String.format for currency formatting in toString',
    ],
  },

  // ========== ARRAYS ==========
  {
    id: 'csa-frq-007',
    topic: 'csa-6-1',
    difficulty: 'easy',
    title: 'Array Statistics',
    description: `Write methods to calculate statistics for an array of integers:

1. findMin(int[] arr): Returns the minimum value
2. findMax(int[] arr): Returns the maximum value
3. findAverage(int[] arr): Returns the average as a double
4. findRange(int[] arr): Returns max - min

Assume the array has at least one element.`,
    starterCode: `public class ArrayStats {
    public static int findMin(int[] arr) {
        // Your code here

    }

    public static int findMax(int[] arr) {
        // Your code here

    }

    public static double findAverage(int[] arr) {
        // Your code here

    }

    public static int findRange(int[] arr) {
        // Your code here

    }

    public static void main(String[] args) {
        int[] nums = {5, 2, 8, 1, 9, 3};
        System.out.println(findMin(nums));     // Expected: 1
        System.out.println(findMax(nums));     // Expected: 9
        System.out.println(findAverage(nums)); // Expected: 4.666...
        System.out.println(findRange(nums));   // Expected: 8
    }
}`,
    rubric: [
      {
        section: 'findMin',
        points: 2,
        criteria: [
          'Initializes min to first element',
          'Iterates and updates correctly',
        ],
      },
      {
        section: 'findMax',
        points: 2,
        criteria: [
          'Initializes max to first element',
          'Iterates and updates correctly',
        ],
      },
      {
        section: 'findAverage',
        points: 2,
        criteria: [
          'Calculates sum of all elements',
          'Divides by length as double',
        ],
      },
      {
        section: 'findRange',
        points: 3,
        criteria: [
          'Calls or calculates max and min',
          'Returns difference correctly',
          'Efficient implementation',
        ],
      },
    ],
    totalPoints: 9,
    testCases: [
      { input: '{5,2,8,1,9,3} min', expectedOutput: '1', description: 'Find minimum' },
      { input: '{5,2,8,1,9,3} max', expectedOutput: '9', description: 'Find maximum' },
      { input: '{5,2,8,1,9,3} avg', expectedOutput: '4.666666666666667', description: 'Find average' },
      { input: '{5,2,8,1,9,3} range', expectedOutput: '8', description: 'Find range' },
    ],
    sampleSolution: `public static int findMin(int[] arr) {
    int min = arr[0];
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] < min) min = arr[i];
    }
    return min;
}

public static int findMax(int[] arr) {
    int max = arr[0];
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}

public static double findAverage(int[] arr) {
    int sum = 0;
    for (int num : arr) {
        sum += num;
    }
    return (double) sum / arr.length;
}

public static int findRange(int[] arr) {
    return findMax(arr) - findMin(arr);
}`,
    hints: [
      'Initialize min/max to the first element, not 0 or Integer.MAX_VALUE',
      'Cast to double before dividing for average to avoid integer division',
      'Range can reuse findMax and findMin methods',
    ],
  },

  // ========== ARRAYLIST ==========
  {
    id: 'csa-frq-008',
    topic: 'csa-7-1',
    difficulty: 'medium',
    title: 'Word Filter',
    description: `Write methods to filter and manipulate an ArrayList of words:

1. filterByLength(ArrayList<String> words, int minLength):
   Returns new ArrayList with words of at least minLength characters

2. removeShortWords(ArrayList<String> words, int minLength):
   Removes words shorter than minLength from the original list (modifies in place)

3. capitalizeAll(ArrayList<String> words):
   Converts all words to uppercase (modifies in place)`,
    starterCode: `import java.util.ArrayList;

public class WordFilter {
    public static ArrayList<String> filterByLength(ArrayList<String> words, int minLength) {
        // Your code here

    }

    public static void removeShortWords(ArrayList<String> words, int minLength) {
        // Your code here

    }

    public static void capitalizeAll(ArrayList<String> words) {
        // Your code here

    }

    public static void main(String[] args) {
        ArrayList<String> words = new ArrayList<>();
        words.add("hello");
        words.add("hi");
        words.add("world");
        words.add("a");

        System.out.println(filterByLength(words, 4)); // [hello, world]

        removeShortWords(words, 3);
        System.out.println(words); // [hello, world]

        capitalizeAll(words);
        System.out.println(words); // [HELLO, WORLD]
    }
}`,
    rubric: [
      {
        section: 'filterByLength',
        points: 3,
        criteria: [
          'Creates new ArrayList',
          'Correctly checks length condition',
          'Adds qualifying words to result',
        ],
      },
      {
        section: 'removeShortWords',
        points: 4,
        criteria: [
          'Iterates safely while removing',
          'Uses correct removal technique (backwards or iterator)',
          'Correctly checks length condition',
          'Modifies original list',
        ],
      },
      {
        section: 'capitalizeAll',
        points: 2,
        criteria: [
          'Uses toUpperCase()',
          'Uses set() to replace in place',
        ],
      },
    ],
    totalPoints: 9,
    testCases: [
      { input: 'filter [hello,hi,world,a] 4', expectedOutput: '[hello, world]', description: 'Filter by length' },
      { input: 'remove [hello,hi,world,a] 3', expectedOutput: '[hello, world]', description: 'Remove short words' },
      { input: 'capitalize [hello,world]', expectedOutput: '[HELLO, WORLD]', description: 'Capitalize all' },
    ],
    sampleSolution: `public static ArrayList<String> filterByLength(ArrayList<String> words, int minLength) {
    ArrayList<String> result = new ArrayList<>();
    for (String word : words) {
        if (word.length() >= minLength) {
            result.add(word);
        }
    }
    return result;
}

public static void removeShortWords(ArrayList<String> words, int minLength) {
    for (int i = words.size() - 1; i >= 0; i--) {
        if (words.get(i).length() < minLength) {
            words.remove(i);
        }
    }
}

public static void capitalizeAll(ArrayList<String> words) {
    for (int i = 0; i < words.size(); i++) {
        words.set(i, words.get(i).toUpperCase());
    }
}`,
    hints: [
      'When removing while iterating, go backwards to avoid index issues',
      'Use set() to replace elements in place',
      'Enhanced for loop works for reading but not for removing',
    ],
  },

  // ========== 2D ARRAYS ==========
  {
    id: 'csa-frq-009',
    topic: 'csa-8-1',
    difficulty: 'medium',
    title: 'Matrix Operations',
    description: `Write methods for matrix operations on 2D integer arrays:

1. rowSum(int[][] matrix, int row): Returns sum of elements in specified row
2. colSum(int[][] matrix, int col): Returns sum of elements in specified column
3. totalSum(int[][] matrix): Returns sum of all elements
4. transpose(int[][] matrix): Returns a new transposed matrix (rows become columns)`,
    starterCode: `public class MatrixOps {
    public static int rowSum(int[][] matrix, int row) {
        // Your code here

    }

    public static int colSum(int[][] matrix, int col) {
        // Your code here

    }

    public static int totalSum(int[][] matrix) {
        // Your code here

    }

    public static int[][] transpose(int[][] matrix) {
        // Your code here

    }

    public static void main(String[] args) {
        int[][] m = {{1, 2, 3}, {4, 5, 6}};

        System.out.println(rowSum(m, 0));   // Expected: 6
        System.out.println(colSum(m, 1));   // Expected: 7
        System.out.println(totalSum(m));    // Expected: 21

        int[][] t = transpose(m);
        // t should be {{1, 4}, {2, 5}, {3, 6}}
    }
}`,
    rubric: [
      {
        section: 'rowSum',
        points: 2,
        criteria: [
          'Accesses correct row',
          'Sums all elements in row',
        ],
      },
      {
        section: 'colSum',
        points: 2,
        criteria: [
          'Iterates through all rows',
          'Accesses correct column in each row',
        ],
      },
      {
        section: 'totalSum',
        points: 2,
        criteria: [
          'Uses nested loops',
          'Accumulates all elements',
        ],
      },
      {
        section: 'transpose',
        points: 3,
        criteria: [
          'Creates new array with swapped dimensions',
          'Correctly maps elements',
          'Returns new array',
        ],
      },
    ],
    totalPoints: 9,
    testCases: [
      { input: 'rowSum(m, 0)', expectedOutput: '6', description: 'Sum of row 0' },
      { input: 'colSum(m, 1)', expectedOutput: '7', description: 'Sum of column 1' },
      { input: 'totalSum(m)', expectedOutput: '21', description: 'Total sum' },
      { input: 'transpose check', expectedOutput: '3x2 matrix', description: 'Correct dimensions' },
    ],
    sampleSolution: `public static int rowSum(int[][] matrix, int row) {
    int sum = 0;
    for (int col = 0; col < matrix[row].length; col++) {
        sum += matrix[row][col];
    }
    return sum;
}

public static int colSum(int[][] matrix, int col) {
    int sum = 0;
    for (int row = 0; row < matrix.length; row++) {
        sum += matrix[row][col];
    }
    return sum;
}

public static int totalSum(int[][] matrix) {
    int sum = 0;
    for (int[] row : matrix) {
        for (int val : row) {
            sum += val;
        }
    }
    return sum;
}

public static int[][] transpose(int[][] matrix) {
    int rows = matrix.length;
    int cols = matrix[0].length;
    int[][] result = new int[cols][rows];

    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            result[c][r] = matrix[r][c];
        }
    }
    return result;
}`,
    hints: [
      'For rowSum, iterate through columns in the given row',
      'For colSum, iterate through rows and access the given column',
      'For transpose, the new array has dimensions swapped',
    ],
  },

  // ========== INHERITANCE ==========
  {
    id: 'csa-frq-010',
    topic: 'csa-9-1',
    difficulty: 'hard',
    title: 'Shape Hierarchy',
    description: `Create a class hierarchy for shapes:

1. Shape (abstract class):
   - abstract double getArea()
   - abstract double getPerimeter()
   - String toString() returns "Shape"

2. Rectangle extends Shape:
   - private double width, height
   - Constructor taking width and height
   - Implement getArea() and getPerimeter()
   - toString() returns "Rectangle: WxH"

3. Square extends Rectangle:
   - Constructor taking side length
   - toString() returns "Square: S"`,
    starterCode: `// Abstract Shape class
abstract class Shape {
    // Your code here

}

// Rectangle class
class Rectangle extends Shape {
    // Your code here

}

// Square class
class Square extends Rectangle {
    // Your code here

}

public class ShapeTest {
    public static void main(String[] args) {
        Rectangle r = new Rectangle(4, 5);
        System.out.println(r);              // Rectangle: 4.0x5.0
        System.out.println(r.getArea());    // 20.0
        System.out.println(r.getPerimeter()); // 18.0

        Square s = new Square(3);
        System.out.println(s);              // Square: 3.0
        System.out.println(s.getArea());    // 9.0
    }
}`,
    rubric: [
      {
        section: 'Shape Class',
        points: 2,
        criteria: [
          'Declared as abstract',
          'Has abstract getArea and getPerimeter',
        ],
      },
      {
        section: 'Rectangle Class',
        points: 4,
        criteria: [
          'Extends Shape',
          'Private width and height',
          'Correct getArea implementation',
          'Correct getPerimeter implementation',
        ],
      },
      {
        section: 'Square Class',
        points: 2,
        criteria: [
          'Extends Rectangle',
          'Constructor uses super(side, side)',
        ],
      },
      {
        section: 'toString Methods',
        points: 1,
        criteria: [
          'Correct format for each class',
        ],
      },
    ],
    totalPoints: 9,
    testCases: [
      { input: 'Rectangle(4,5).getArea()', expectedOutput: '20.0', description: 'Rectangle area' },
      { input: 'Rectangle(4,5).getPerimeter()', expectedOutput: '18.0', description: 'Rectangle perimeter' },
      { input: 'Square(3).getArea()', expectedOutput: '9.0', description: 'Square area' },
      { input: 'Square(3).getPerimeter()', expectedOutput: '12.0', description: 'Square perimeter' },
    ],
    sampleSolution: `abstract class Shape {
    public abstract double getArea();
    public abstract double getPerimeter();

    public String toString() {
        return "Shape";
    }
}

class Rectangle extends Shape {
    private double width;
    private double height;

    public Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    public double getArea() {
        return width * height;
    }

    public double getPerimeter() {
        return 2 * (width + height);
    }

    public String toString() {
        return "Rectangle: " + width + "x" + height;
    }

    protected double getWidth() { return width; }
    protected double getHeight() { return height; }
}

class Square extends Rectangle {
    public Square(double side) {
        super(side, side);
    }

    public String toString() {
        return "Square: " + getWidth();
    }
}`,
    hints: [
      'Abstract methods have no body - just the signature followed by semicolon',
      'Square can reuse Rectangle by passing the same value for width and height',
      'Use super() to call parent constructor',
    ],
  },

  // ========== RECURSION ==========
  {
    id: 'csa-frq-011',
    topic: 'csa-10-1',
    difficulty: 'easy',
    title: 'Recursive Array Sum',
    description: `Write a recursive method to calculate the sum of all elements in an array.

The method should:
- Take an array and an index as parameters
- Use recursion (no loops allowed)
- Return the sum of elements from index to the end of the array

The base case is when the index equals the array length (return 0).`,
    starterCode: `public class RecursiveSum {
    /**
     * Recursively calculates sum of array elements.
     * @param arr the array of integers
     * @param index the starting index
     * @return sum of elements from index to end
     */
    public static int sumArray(int[] arr, int index) {
        // Your code here

    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3, 4, 5};
        System.out.println(sumArray(nums, 0)); // Expected: 15
        System.out.println(sumArray(nums, 3)); // Expected: 9 (4+5)

        int[] empty = {};
        System.out.println(sumArray(empty, 0)); // Expected: 0
    }
}`,
    rubric: [
      {
        section: 'Base Case',
        points: 3,
        criteria: [
          'Identifies when index >= arr.length',
          'Returns 0 for base case',
          'Handles empty array',
        ],
      },
      {
        section: 'Recursive Case',
        points: 4,
        criteria: [
          'Adds current element arr[index]',
          'Makes recursive call with index + 1',
          'Returns sum of current element and recursive result',
          'No loops used',
        ],
      },
      {
        section: 'Correctness',
        points: 2,
        criteria: [
          'Works for various array sizes',
          'Works for different starting indices',
        ],
      },
    ],
    totalPoints: 9,
    testCases: [
      { input: '{1,2,3,4,5}, 0', expectedOutput: '15', description: 'Sum from start' },
      { input: '{1,2,3,4,5}, 3', expectedOutput: '9', description: 'Sum from middle' },
      { input: '{}, 0', expectedOutput: '0', description: 'Empty array' },
      { input: '{7}, 0', expectedOutput: '7', description: 'Single element' },
    ],
    sampleSolution: `public static int sumArray(int[] arr, int index) {
    // Base case: reached end of array
    if (index >= arr.length) {
        return 0;
    }
    // Recursive case: current element + sum of rest
    return arr[index] + sumArray(arr, index + 1);
}`,
    hints: [
      'The base case should return 0 when index reaches the array length',
      'The recursive case adds the current element to the sum of the rest',
      'Think about what happens when you reach the last element',
    ],
  },
  {
    id: 'csa-frq-012',
    topic: 'csa-10-2',
    difficulty: 'medium',
    title: 'Recursive Binary Search',
    description: `Implement binary search recursively.

Binary search finds a target value in a sorted array by repeatedly dividing the search range in half.

The method should:
- Return the index of the target if found
- Return -1 if the target is not in the array
- Use recursion with low and high index parameters`,
    starterCode: `public class RecursiveBinarySearch {
    /**
     * Recursively searches for target in sorted array.
     * @param arr sorted array of integers
     * @param target value to find
     * @param low starting index of search range
     * @param high ending index of search range
     * @return index of target, or -1 if not found
     */
    public static int binarySearch(int[] arr, int target, int low, int high) {
        // Your code here

    }

    public static void main(String[] args) {
        int[] nums = {1, 3, 5, 7, 9, 11, 13, 15};

        System.out.println(binarySearch(nums, 7, 0, nums.length - 1));  // Expected: 3
        System.out.println(binarySearch(nums, 1, 0, nums.length - 1));  // Expected: 0
        System.out.println(binarySearch(nums, 15, 0, nums.length - 1)); // Expected: 7
        System.out.println(binarySearch(nums, 6, 0, nums.length - 1));  // Expected: -1
    }
}`,
    rubric: [
      {
        section: 'Base Cases',
        points: 3,
        criteria: [
          'Returns -1 when low > high',
          'Returns mid when arr[mid] == target',
          'Handles single element case',
        ],
      },
      {
        section: 'Recursive Logic',
        points: 4,
        criteria: [
          'Calculates mid correctly',
          'Searches left half when target < arr[mid]',
          'Searches right half when target > arr[mid]',
          'Passes correct new bounds',
        ],
      },
      {
        section: 'Efficiency',
        points: 2,
        criteria: [
          'Halves search space each call',
          'No unnecessary comparisons',
        ],
      },
    ],
    totalPoints: 9,
    testCases: [
      { input: 'find 7 in {1,3,5,7,9,11,13,15}', expectedOutput: '3', description: 'Middle element' },
      { input: 'find 1 in {1,3,5,7,9,11,13,15}', expectedOutput: '0', description: 'First element' },
      { input: 'find 15 in {1,3,5,7,9,11,13,15}', expectedOutput: '7', description: 'Last element' },
      { input: 'find 6 in {1,3,5,7,9,11,13,15}', expectedOutput: '-1', description: 'Not found' },
    ],
    sampleSolution: `public static int binarySearch(int[] arr, int target, int low, int high) {
    // Base case: element not found
    if (low > high) {
        return -1;
    }

    int mid = (low + high) / 2;

    // Found the target
    if (arr[mid] == target) {
        return mid;
    }

    // Target is in left half
    if (target < arr[mid]) {
        return binarySearch(arr, target, low, mid - 1);
    }

    // Target is in right half
    return binarySearch(arr, target, mid + 1, high);
}`,
    hints: [
      'Calculate mid as (low + high) / 2',
      'If target is less than mid element, search the left half',
      'If target is greater than mid element, search the right half',
    ],
  },
  {
    id: 'csa-frq-013',
    topic: 'csa-10-3',
    difficulty: 'hard',
    title: 'Recursive String Permutations',
    description: `Write a recursive method to generate all permutations of a string.

A permutation is a rearrangement of the characters. For "abc", the permutations are:
abc, acb, bac, bca, cab, cba

The method should print each permutation on a new line.

Hint: Fix one character at a time and recursively permute the rest.`,
    starterCode: `public class Permutations {
    /**
     * Prints all permutations of the string.
     * @param str the original string
     * @param prefix the current prefix being built
     */
    public static void permute(String str, String prefix) {
        // Your code here

    }

    public static void printPermutations(String s) {
        permute(s, "");
    }

    public static void main(String[] args) {
        printPermutations("abc");
        // Should print:
        // abc
        // acb
        // bac
        // bca
        // cab
        // cba
    }
}`,
    rubric: [
      {
        section: 'Base Case',
        points: 2,
        criteria: [
          'Identifies when str is empty',
          'Prints the prefix as a complete permutation',
        ],
      },
      {
        section: 'Recursive Logic',
        points: 5,
        criteria: [
          'Loops through each character in str',
          'Removes current character from str for recursive call',
          'Adds current character to prefix',
          'Makes correct recursive call',
          'Explores all branches',
        ],
      },
      {
        section: 'Correctness',
        points: 2,
        criteria: [
          'Generates all permutations',
          'No duplicates (for strings without duplicate chars)',
        ],
      },
    ],
    totalPoints: 9,
    testCases: [
      { input: 'ab', expectedOutput: 'ab\nba', description: 'Two characters' },
      { input: 'a', expectedOutput: 'a', description: 'Single character' },
      { input: 'abc', expectedOutput: '6 permutations', description: 'Three characters' },
    ],
    sampleSolution: `public static void permute(String str, String prefix) {
    // Base case: no more characters to permute
    if (str.length() == 0) {
        System.out.println(prefix);
        return;
    }

    // Try each character as the next character in the permutation
    for (int i = 0; i < str.length(); i++) {
        char ch = str.charAt(i);
        // Remove the character from str
        String remaining = str.substring(0, i) + str.substring(i + 1);
        // Recurse with the character added to prefix
        permute(remaining, prefix + ch);
    }
}`,
    hints: [
      'The base case is when the remaining string is empty',
      'For each position, try each remaining character',
      'Use substring to remove a character from the middle of a string',
    ],
  },
];

// Helper functions
export function getFRQsByTopic(topicId: string): FRQQuestion[] {
  return FRQ_BANK.filter((q) => q.topic === topicId);
}

export function getFRQsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): FRQQuestion[] {
  return FRQ_BANK.filter((q) => q.difficulty === difficulty);
}

export function getRandomFRQs(count: number, topicId?: string): FRQQuestion[] {
  let pool = topicId ? getFRQsByTopic(topicId) : FRQ_BANK;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getFRQById(id: string): FRQQuestion | undefined {
  return FRQ_BANK.find((q) => q.id === id);
}
