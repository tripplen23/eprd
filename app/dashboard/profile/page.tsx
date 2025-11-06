"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function Profile() {
  const defaultAvatar = "https://github.com/shadcn.png";
  
  // Mock user data - replace with your actual user management solution
  const user = {
    name: "John Doe",
    email: "john@example.com",
    image: defaultAvatar,
  };

  return (
    <div className="absolute inset-0 overflow-hidden flex flex-col items-center justify-center p-8 bg-white text-gray-900 dark:bg-transparent dark:text-foreground">
        <div className="flex flex-col items-center gap-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Account Information
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View details or logout.
        </p>
      </div>
      <Card className="relative w-full max-w-md border border-gray-200 bg-white shadow-lg dark:border-gray-800/50 dark:bg-gradient-to-b dark:from-black/80 dark:to-gray-900/90 backdrop-blur-md rounded-xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
        <CardContent className="pt-6 pb-8 px-6 relative z-10 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.image} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                {user.name}
              </h2>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;