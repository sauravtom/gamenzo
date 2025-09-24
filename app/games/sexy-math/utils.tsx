import type { Difficulty } from "./math-game"

// Function to generate a random integer between min and max (inclusive)
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Function to generate a math question based on difficulty
export function generateQuestion(difficulty: Difficulty) {
  let num1: number, num2: number, operation: string, answer: number

  switch (difficulty) {
    case "easy":
      // Addition and subtraction with numbers 1-10
      num1 = getRandomInt(1, 10)
      num2 = getRandomInt(1, 10)
      operation = Math.random() < 0.5 ? "+" : "-"

      // Ensure subtraction doesn't result in negative numbers
      if (operation === "-" && num2 > num1) {
        ;[num1, num2] = [num2, num1]
      }

      answer = operation === "+" ? num1 + num2 : num1 - num2
      break

    case "medium":
      // Addition, subtraction, and multiplication with numbers 1-20
      num1 = getRandomInt(1, 20)
      num2 = getRandomInt(1, 20)
      const randomOp = Math.random()

      if (randomOp < 0.33) {
        operation = "+"
        answer = num1 + num2
      } else if (randomOp < 0.66) {
        operation = "-"
        // Ensure subtraction doesn't result in negative numbers
        if (num2 > num1) {
          ;[num1, num2] = [num2, num1]
        }
        answer = num1 - num2
      } else {
        operation = "×"
        // Use smaller numbers for multiplication
        num1 = getRandomInt(1, 10)
        num2 = getRandomInt(1, 10)
        answer = num1 * num2
      }
      break

    case "hard":
      // Addition, subtraction, multiplication, and division with numbers 1-50
      const randomOperation = Math.random()

      if (randomOperation < 0.25) {
        operation = "+"
        num1 = getRandomInt(10, 50)
        num2 = getRandomInt(10, 50)
        answer = num1 + num2
      } else if (randomOperation < 0.5) {
        operation = "-"
        num1 = getRandomInt(10, 50)
        num2 = getRandomInt(1, num1)
        answer = num1 - num2
      } else if (randomOperation < 0.75) {
        operation = "×"
        num1 = getRandomInt(5, 15)
        num2 = getRandomInt(5, 15)
        answer = num1 * num2
      } else {
        operation = "÷"
        // Ensure clean division (no remainders)
        num2 = getRandomInt(1, 10)
        answer = getRandomInt(1, 10)
        num1 = num2 * answer

        // Format the question differently for division
        return {
          question: `${num1} ${operation} ${num2} = ?`,
          options: generateOptions(answer, difficulty),
          answer,
        }
      }
      break

    default:
      // Default to easy
      num1 = getRandomInt(1, 10)
      num2 = getRandomInt(1, 10)
      operation = "+"
      answer = num1 + num2
  }

  return {
    question: `${num1} ${operation} ${num2} = ?`,
    options: generateOptions(answer, difficulty),
    answer,
  }
}

// Function to generate options for the question
function generateOptions(answer: number, difficulty: Difficulty): number[] {
  const options = [answer]

  // Generate 3 wrong options
  while (options.length < 4) {
    let wrongAnswer: number

    switch (difficulty) {
      case "easy":
        wrongAnswer = getRandomInt(Math.max(1, answer - 5), answer + 5)
        break
      case "medium":
        wrongAnswer = getRandomInt(Math.max(1, answer - 10), answer + 10)
        break
      case "hard":
        wrongAnswer = getRandomInt(Math.max(1, answer - 20), answer + 20)
        break
      default:
        wrongAnswer = getRandomInt(Math.max(1, answer - 5), answer + 5)
    }

    // Ensure no duplicate options
    if (!options.includes(wrongAnswer)) {
      options.push(wrongAnswer)
    }
  }

  // Shuffle options
  return shuffleArray(options)
}
