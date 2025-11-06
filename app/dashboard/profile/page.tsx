"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { signOut } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import LoadingDots from "@/components/ui/loading-dots";

function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const defaultAvatar = "https://github.com/shadcn.png";

  if (status === "loading") {
    return <LoadingDots />;
  }
  if (!session) {
    return router.push("/auth");
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth' });
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
              <AvatarImage src={session.user?.image || defaultAvatar} />
              <AvatarFallback>{session.user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-semibold text-black dark:text-white">
                {session.user?.name}
              </h2>
              <p className="text-sm text-gray-400">{session.user?.email}</p>
            </div>
          </div>
          <Button
            className="cursor-pointer w-full h-12 font-medium bg-black/5 text-black hover:bg-black/10 border border-black/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:border-white/10 backdrop-blur-sm transition-all duration-300 rounded-lg shadow-lg relative group overflow-hidden"
            onClick={handleLogout}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-red-500/20 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-full transition-all duration-1000"></div>
            <span className="relative z-10">Logout</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;