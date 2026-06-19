import Sidebar from "../components/Sidebar";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-slate-50 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden p-4 md:p-6 w-full max-w-7xl mx-auto animate-fade-in">
        {children}
      </main>
    </div>
  );
}
