const Page = ({ params }:   { params: {id: string}}) => {
    const { id } = params;
    console.log("User ID:", id);
  return (
    <div>
      <h1>User Page</h1>
      <p>This is the user page.</p>
        <p>User ID: {id}</p>
    </div>
  );
}       
export default Page;