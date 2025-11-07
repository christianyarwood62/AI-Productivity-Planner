import { GoogleGenAI } from "@google/genai";
import { useState } from "react";

// Import the API key
const API_KEY = import.meta.env.VITE_API_KEY;

function App() {
  // the state for the input bar where the user types their question
  const [searchInput, setSearchInput] = useState("");
  const [searchReply, setSearchReply] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    async function main() {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: searchInput,
      });
      console.log(response.text);
    }

    main();
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          type="text"
        ></input>
        <button>Submit</button>
      </form>
      <div></div>
    </>
  );
}

export default App;
