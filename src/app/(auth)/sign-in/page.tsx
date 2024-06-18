'use client';

import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDebounceCallback } from "usehooks-ts";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";

export default function SignInForm() {

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signInSchema>>({
    //uses Zod resolver using the signUpSchema we made earlier
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });


  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
   const result = await signIn("credentials", {
    redirect: false,
    identifier: data.identifier,
    password: data.password,
    });
    if (result?.error) {
      console.log("hello")
      toast({
        title: "Sign in failed",
        description: result.error,
        variant: "destructive"
      });

    }
    if(result?.url){
      router.replace('/dashboard')
    }
   
  };

  return (
<div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
  <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
    <div className="text-center">
      <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Join the Feedback
      </h1>
      <p className="text-gray-400 mb-4">Sign In to get started</p>
    </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        <FormField
          name="identifier"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Email/Username</FormLabel>
              <Input placeholder="Email or Username"
                {...field}
                name="identifier"
                className="bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="password"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Password</FormLabel>
              <Input placeholder="Password"
                type="password"
                {...field}
                name="password"
                className="bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign in
        </Button>
      </form>
    </Form>
    <div className="text-center mt-4">
      <p className="text-gray-400">
        Already a member?{" "}
        <Link href="/sign-up" className="text-blue-400 hover:text-blue-300">
          Sign up
        </Link>
      </p>
    </div>
  </div>
</div>

  );
}