const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen flex-col">
      <h1 className="text-3xl font-bold underline text-center my-4"> Dashboard Layout </h1>
        {children}
    </div>
  );
}
export default Layout;