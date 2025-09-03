"use client";
import { useState } from "react";

export default function HelloButton() {
  const [result, setResult] = useState("");

  async function handleClick() {
    const res = await fetch("http://127.0.0.1:8000/hello");
    const data = await res.json();
    setResult(data.output);
  }

  return (
    <div className="p-4">
      <button
        onClick={handleClick}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Run Hello World
      </button>
      {result && <p className="mt-2">Output: {result}</p>}
    </div>
  );
}