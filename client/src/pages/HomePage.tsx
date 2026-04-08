export default function HomePage() {
  return (
    <div className="home_page_container flex h-full w-full flex-col items-center justify-center text-gray-800 dark:text-gray-200">
      <h1 className="primary_heading text-2xl md:text-4xl font-bold mb-4">
        Agent Workspace
      </h1>
      <p className="sub_heading text-sm md:text-base text-gray-500">
        Select a folder or agent to begin.
      </p>
    </div>
  );
}