import { GoogleGenAI } from "@google/genai";
import { useState, useReducer } from "react";
import Task from "./components/Task";

// Your Vite environment variable
const API_KEY = import.meta.env.VITE_API_KEY;

// A scheme for the AI to produce a task object with the desired properties
const taskSchema = {
  title: "Task schema",
  type: "object",
  properties: {
    taskName: {
      description: "Task name",
      type: "string",
    },
    taskDetails: {
      description: "a short sentence explaining the task in more detail",
      type: "string",
    },
    taskStartTime: {
      description: "The starting time of the task, in HH:MM format, 24 hours",
      type: "string",
      pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$",
    },
    taskEndTime: {
      description: "The finish time of the task, in HH:MM format, 24 hours",
      type: "string",
      pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$",
    },
  },
  required: ["taskName", "taskStartTime", "taskEndTime"],
};

// A scheme for the AI to produce a planner object with the desired properties
const plannerResponseSchema = {
  title: "Planner response scheme",
  type: "object",
  properties: {
    planner: {
      description: "A list of all of the tasks to do",
      type: "array",
      items: taskSchema,
    },
  },
  required: ["planner"],
};

const initialState = {
  planner: [],
  isLoading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "AI_response/loaded":
      return {
        ...state,
        isLoading: false,
        planner: action.payload,
      };

    default:
      return state;
  }
}

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [searchReply, setSearchReply] = useState("");
  const [{ planner, isLoading, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // Handles the user submitting their question in the input box
  async function handleSubmit(e) {
    e.preventDefault();
    // Set loading state while the AI thinks of a response
    dispatch({ type: "loading" });

    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Generates a response from Gemini based on the search that the user has requested
    try {
      const res = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: searchInput,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: plannerResponseSchema,
        },
      });

      // parses the string response from Gemini and constructs an object based on the data
      const parsedResponse = JSON.parse(res.text);
      const planner = parsedResponse.planner;

      console.log(planner);
      dispatch({ type: "AI_response/loaded", payload: planner });
    } catch (err) {
      // Catches any errors when fetching data from the API
      console.error("Error:", err);
    }
  }

  return (
    <div>
      <h1>AI Productivity Planner</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
      {planner.length === 0 ? (
        <div>Ask AI for a plan</div>
      ) : (
        planner.map((task) => (
          <Task
            taskName={task.taskName}
            startTime={task.taskStartTime}
            endTime={task.taskEndTime}
            key={task.taskName}
          />
        ))
      )}
    </div>
  );
}

export default App;
