"use client";
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, RefreshCcw } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCard } from '@/components/MessageCard';
import { Separator } from '@/components/ui/separator';

function UserDashboard() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    setIsSwitchLoading(false);
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(response.data.messages || []);
      if (refresh) {
        toast({
          title: 'Refreshed Messages',
          description: 'Showing latest messages',
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsSwitchLoading(false);
    }
  }, [setIsLoading, setMessages, toast]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: response.data.message,
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ??
          'Failed to update message settings',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();
    fetchAcceptMessages();
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

  if (!session || !session.user) {
    return <div></div>; // Placeholder or redirect logic for non-authenticated users
  }

  const { username } = session.user;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
<>
  <div className="flex flex-col md:flex-row items-stretch w-full h-screen">

    {/* User Dashboard Section */}
    <div className="md:w-1/3 bg-white rounded-lg shadow-lg overflow-y-auto">
      <div className="p-6">
        <h1 className="text-4xl font-bold mb-8 text-center">User Dashboard</h1>

        {/* Copy Link Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Your Profile Link</h2>
          <div className="flex items-center border-b-2 border-gray-300 pb-2">
            <input
              id="profileUrl"
              type="text"
              value={profileUrl}
              disabled
              className="input input-bordered w-full p-2 mr-2 focus:outline-none"
              placeholder="https://example.com/profile/username"
            />
            <Button onClick={copyToClipboard} className="bg-blue-600 text-white hover:bg-blue-700">
              Copy
            </Button>
          </div>
        </div>

        {/* Accept Messages Switch */}
        <div className="mb-8 flex items-center">
          <span className="text-lg mr-4">Accept Messages:</span>
          <Switch
            {...register('acceptMessages')}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChange}
            className="mr-2"
          />
          <span className={`font-semibold ${acceptMessages ? 'text-green-600' : 'text-red-600'}`}>
            {acceptMessages ? 'On' : 'Off'}
          </span>
        </div>

        <Separator className="my-8" />

        {/* Refresh Button */}
        <div className="flex items-center justify-center mb-8">
          <Button
            className="flex items-center"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              fetchMessages(true);
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCcw className="h-4 w-4 mr-2" />
            )}
            Refresh Messages
          </Button>
        </div>

      </div>
    </div>

    {/* Messages Section */}
    <div className="md:w-2/3 bg-white rounded-lg shadow-lg overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Messages</h2>
        <div className="overflow-y-auto max-h-full">
          {messages.length > 0 ? (
            messages.map((message) => (
              <MessageCard
                key={message._id as string}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-gray-500">No messages to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>

  </div>
</>



  );
}

export default UserDashboard;
