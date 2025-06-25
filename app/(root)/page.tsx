import Hello from "@/app/_components/hello";

const Homepage = () => {
  
  console.log("Hello from the homepage!");
  return (
    <div>
      <h1 className="text-3xl font-bold underline"> Hej </h1>
      <Hello />
    </div>
  );
}
export default Homepage;