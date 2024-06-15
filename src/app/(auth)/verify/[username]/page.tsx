'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { verifySchema } from '@/schemas/verifySchema';

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username,
        code: data.code,
      });

      toast({
        title: 'Success',
        description: response.data.message,
      });

      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Verification Failed',
        description:
          axiosError.response?.data.message ??
          'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
<div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
  <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
    <div className="text-center">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Verify Your Account
      </h1>
      <p className="text-gray-400 mb-4">Enter the verification code sent to your email</p>
    </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="code"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Verification Code</FormLabel>
              <Input
                {...field}
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
          Verify
        </Button>
      </form>
    </Form>
  </div>
</div>

  );
}