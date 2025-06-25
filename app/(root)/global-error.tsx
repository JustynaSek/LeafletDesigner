"use client";

const GlobalError = ({ error }: { error: Error }) => {
  console.error("Global error occurred:", error);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Global Error</h1>
      <p className="text-lg text-center max-w-2xl">
        An unexpected error has occurred. Please try again later.
      </p>
    </div>
  );
}
export default GlobalError;