'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';
import { link } from 'fs';
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast"; 
import { signInSchema } from "@/schemas/signInSchema";




function Navbar() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const user : User = session?.user;

  const handleSignInTestUser = async () => {
    const result = await signIn("credentials", {
     redirect: false,
     identifier: "test@test.com",
     password: "test1234",
     });
     if (result?.error) {
       toast({
         title: "Test user Sign in failed",
         description: result.error,
         variant: "destructive"
       });
 
     }
     if(result?.url){
       router.replace('/dashboard')
     }
    
   };

  const handleSignOut = async () => {
    await signOut({ redirect: false }); // Use { redirect: false } to prevent NextAuth default redirect behavior
    window.location.href = '/'; // Redirect manually to homepage
  };
  return (
    <nav className="py-4 md:py-6 shadow-md bg-gray-900 text-white">
  <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
    <div className="flex items-center">
      <a href="#" className="text-xl font-bold mb-2 md:mb-0">
        True Feedback
      </a>
      <span className="ml-2 md:hidden">
        {session && `Welcome, ${user.username || user.email}`}
      </span>
    </div>
    <div className="flex items-center mt-4 md:mt-0">
      {session ? (
        <>
          <span className="hidden md:inline-block mr-4">
            Welcome, {user.username || user.email}
          </span>
          <Button onClick={handleSignOut} className="mr-2 md:mr-4 bg-blue-600 text-white hover:bg-blue-700">
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link href="/sign-in">
            <Button className="mr-2 bg-blue-600 text-white hover:bg-blue-700">
              Login
            </Button>
          </Link>
          <Button onClick={handleSignInTestUser} className="bg-blue-600 text-white hover:bg-blue-700">
            Test User
          </Button>
        </>
      )}
    </div>
  </div>
</nav>

  );
}

export default Navbar;