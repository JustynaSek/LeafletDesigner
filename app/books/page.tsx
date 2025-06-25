async function Page() {
    const res = await fetch('http://localhost:3000/api/books');
    console.log("Fetching books from API..." + res.status);
 
    const books = await res.json();
    console.log("Books fetched:", books);
    
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Books List</h1>
            <ul className="list-disc pl-5">
                {books.map((book: { id: number; name: string }) => (
                    <li key={book.id}>
                        <a className="text-blue-500 hover:underline" href={`/books/${book.id}`}>
                            {book.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default Page;