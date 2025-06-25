async function Home() {
    const respone = await fetch("https://jsonplaceholder.typicode.com/users", {
        next: { revalidate: 60 },
    }); 
    if(!respone.ok) {
        throw new Error("Failed to fetch users");
    }
    const users = await respone.json();
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Users List</h1>
            <ul className="list-disc pl-5">
                {users.map((user: { id: number; name: string }) => (
                    <li key={user.id}>
                        <a className="text-blue-500 hover:underline" href={`/dashboard/users/${user.id}`}>
                            {user.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default Home;