import Home from "./home";
import  Link from "next/link";

const Page = () => {
  return (
    <div>
      <h1>Dashboard users</h1>
      <ul className="list-disc pl-5">
        <li>
          <Link className="text-blue-500 hover:underline" href="/dashboard/users/1"> User 1</Link>
        </li>
        <li>
          <Link className="text-blue-500 hover:underline" href="/dashboard/users/2"> User 2</Link>
        </li>
        <li>
          <Link className="text-blue-500 hover:underline" href="/dashboard/users/3"> User 3</Link>
        </li>
        </ul>
        <Home/>
    </div>
  );
}

export default Page;