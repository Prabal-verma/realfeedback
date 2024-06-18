'use client'

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';
import { link } from 'fs';

function Navbar() {
  const { data: session } = useSession();
  const user : User = session?.user;
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
          <Link href="/sign-in">
            <Button className="w-full md:w-auto bg-slate-100 text-black mr-2" variant={'outline'}>Login</Button>
            <Button className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>Test User</Button>
          </Link>
          
        )}
      </div>
    </nav>
  );
}

export default Navbar;