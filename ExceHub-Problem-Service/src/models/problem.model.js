const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title cannot be empty"],
    },
    description: {
      type: String,
      required: [true, "Description cannot be empty"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: [true, "Difficulty cannot be empty"],
      default: "easy",
    },
    testCases: [
      {
        input: {
          type: String,
          required: [true, "Input cannot be empty"],
        },
        output: {
          type: String,
          required: [true, "Output cannot be empty"],
        },
        explanation: {
          type: String,
        },
      },
    ],
    codeStubs: [
      {
        language: {
          type: String,
          enum: ["JAVA", "CPP", "PYTHON"],
          require: true,
        },
        startSnippet: {
          type: String,
        },
        endSnippet: {
          type: String,
        },
        userSnippet: {
          type: String,
        },
      },
    ],

    editorial: {
      type: String,
    },
  },
  { timestamps: true }
); // adds createdAt & updatedAt

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;
