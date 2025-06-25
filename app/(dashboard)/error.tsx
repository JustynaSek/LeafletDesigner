"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Error occurred:", error);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-lg text-center max-w-2xl">
        An unexpected error has occurred. Please try again later.
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try Again
      </button>
    </div>
  );
}