"use client";

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
import { signUpSchema } from "@/schemas/signUpSchema";

export default function SignUpForm() {
  //state for storing username
  const [username, setUsername] = useState("");
  //state for storing the message received from the backend regarding whether
  //username is unique or not
  const [usernameMessage, setUsernameMessage] = useState("");
  //state for storing boolean regarding whether backend has responded yet or not
  //helps in keeping the loader alive till then
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  //similarly this is for the submition part
  const [isSubmitting, setIsSubmitting] = useState(false);
  //returns the debounced function which will update the username after 300ms and
  //if the user is typing, the value username needs to change to that value and the final value
  //it needs to change to keeps getting updated due to typing but once the typing stops for more than 300ms
  //, the state's value changes to the final value and triggers a re-render
  const debounced = useDebounceCallback(setUsername, 300);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signUpSchema>>({
    //uses Zod resolver using the signUpSchema we made earlier
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      //since anyways the username is getting updated after 300ms so
      if (username) {
        //mark the start of the loader
        setIsCheckingUsername(true);
        setUsernameMessage(""); // Reset message
        try {
          //make a call to the API
          const response = await axios.get<ApiResponse>(
            `/api/check-username-unique?username=${username}`
          );
          //get the message
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          );
        } finally {
          //either it works fine or error occurs, we gotta end the loader
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    //start the loader
    setIsSubmitting(true);
    try {
      //make the POST request to the API with the data
      const response = await axios.post<ApiResponse>("/api/sign-up", data);

      toast({
        title: "Success",
        description: response.data.message,
      });

      //on success, go for verification
      router.replace(`/verify/${username}`);

      //end the loader
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error during sign-up:", error);

      const axiosError = error as AxiosError<ApiResponse>;

      // Default error message
      let errorMessage = axiosError.response?.data.message;
      ("There was a problem with your sign-up. Please try again.");

      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });

      //end the loader
      setIsSubmitting(false);
    }
  };

  return (
<div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
  <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
    <div className="text-center">
      <h1 className="text-3xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Join the Feedback
      </h1>
      <p className="text-gray-400 mb-4">Sign up to get started</p>
    </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="username"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Username</FormLabel>
              <Input
                {...field}
                onChange={(e: any) => {
                  field.onChange(e);
                  debounced(e.target.value);
                }}
                className="bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
              {isCheckingUsername && <Loader2 className="animate-spin text-blue-500" />}
              {!isCheckingUsername && usernameMessage && (
                <p
                  className={`text-sm ${
                    usernameMessage === "Username is unique" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {usernameMessage}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Email</FormLabel>
              <Input
                {...field}
                name="email"
                className="bg-gray-700 border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
              <p className="text-gray-400 text-sm">
                We will send you a verification code
              </p>
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
              <Input
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>
    </Form>
    <div className="text-center mt-4">
      <p className="text-gray-400">
        Already a member?{" "}
        <Link href="/sign-in" className="text-blue-400 hover:text-blue-300">
          Sign in
        </Link>
      </p>
    </div>
  </div>
</div>

  );
}