"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  const handleCreateProject = () => {
    router.push("/dashboard/projects/[id]");
  };

  return (
    <div className="flex flex-col gap-8 mt-14">
      {/* Main Content */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Projects</h1>
          <Button
            onClick={handleCreateProject}
            className="cursor-pointer h-12 px-6 font-medium bg-black/5 text-black hover:bg-black/10 border border-black/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:border-white/10 backdrop-blur-sm transition-all duration-300 rounded-lg shadow-lg relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000"></div>
            <span className="flex items-center gap-2 relative z-10">
              <Plus className="w-5 h-5" />
              Create New Project
            </span>
          </Button>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Empty State */}
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-gray-100 border border-dashed border-gray-300 rounded-xl shadow-sm dark:bg-black/20 dark:border-gray-700">
            <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <Plus className="w-8 h-8 text-indigo-400/80" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first project to get started
            </p>
            <Button
              onClick={handleCreateProject}
              className="cursor-pointer h-10 px-4 font-medium bg-black/5 text-black hover:bg-black/10 border border-black/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:border-white/10 backdrop-blur-sm transition-all duration-300 rounded-lg shadow-lg relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000"></div>
              <span className="flex items-center gap-2 relative z-10">
                <Plus className="w-4 h-4" />
                Create Project
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}