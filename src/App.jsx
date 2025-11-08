import { GoogleGenAI } from "@google/genai";
import { useState, useReducer, useEffect } from "react";
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
    taskIcon: {
      description: "An icon that describes the task name, e.g. 🏃, ✂️, etc.",
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
  required: ["taskName", "taskStartTime", "taskEndTime", "taskIcon"],
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
  error: "",
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
  const [{ planner, isLoading, error, taskDetails }, dispatch] = useReducer(
    reducer,
    initialState
  );

  useEffect(() => {
    const planner = [];
    dispatch({ type: "AI_response/loaded", payload: planner });
  }, []);

  // Handles the user submitting their question in the input box
  async function handleSubmit(e) {
    e.preventDefault();
    // Set loading state while the AI thinks of a response
    dispatch({ type: "loading" });

    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Generates a response from Gemini based on the search that the user has requested
    try {
      const res = await fetch("http://localhost:5000/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: searchInput,
          schema: plannerResponseSchema,
        }),
      });

      // parses the string response from Gemini and constructs an object based on the data
      const parsedResponse = JSON.parse(res.text);
      const planner = parsedResponse.planner;

      console.log(planner);
      dispatch({ type: "AI_response/loaded", payload: planner });

      localStorage.setItem("planner", JSON.stringify(planner));
    } catch (err) {
      // Catches any errors when fetching data from the API
      console.error("Error:", err);
    }
  }

  return (
    <div className="page-content">
      <h1
        className="mb-4 text-4xl font-extrabold leading-none tracking-tight
        text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
      >
        AI Productivity App
      </h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            // type="search"
            id="default-search"
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search Mockups, Logos..."
            required
          />
          <button
            disabled={isLoading}
            type="submit"
            className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </div>
      </form>
      {planner.length === 0 ? (
        <div>Ask AI for a plan</div>
      ) : (
        <div className="task-list-container">
          {planner.map((task) => (
            <Task
              taskName={task.taskName}
              startTime={task.taskStartTime}
              endTime={task.taskEndTime}
              key={task.taskName}
              taskDetails={task.taskDetails}
              taskIcon={task.taskIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
