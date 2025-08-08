// import ThemeButton from "@/components/ThemeButton";

const BaseLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full min-h-[100dvh] flex flex-col bg-secondary dark:bg-primary text-primary dark:text-secondary">
      {/* <header className="p-4 shadow flex justify-between items-center rounded-lg">
        <h1 className="text-xl font-bold">My App</h1>
        <ThemeButton />
      </header> */}

      <main className="flex-1">{children}</main>

      {/* <footer className="p-4 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} My App
      </footer> */}
    </div>
  );
};

export default BaseLayout;
