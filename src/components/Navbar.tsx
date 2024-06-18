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
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="#" className="text-xl font-bold mb-4 md:mb-0">
          True Feedback
        </a>
        {session ? (
          <>
            <span className="mr-4">
              Welcome, {user.username || user.email}
            </span>
            <Button onClick={handleSignOut} className="w-full md:w-auto bg-slate-100 text-black" variant='outline'>
              Logout
            </Button>
          </>
        ) : (
          <>
          <div>
          <Link href="/sign-in">
            <Button className="mr-2 bg-slate-100 text-black" variant={'outline'}>Login</Button>
          </Link>
          <Button onClick={handleSignInTestUser} className="bg-slate-100 text-black" variant={'outline'}>
            Test User
          </Button>
          </div>
          
        </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;