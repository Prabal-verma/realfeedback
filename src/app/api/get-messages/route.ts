import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  const userId = new mongoose.Types.ObjectId(_user._id);
  console.log(userId);
  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true } }, // Unwind messages array
      { $sort: { 'messages.createdAt': -1 } }, // Sort messages by createdAt descending
      { $group: {
          _id: '$_id',
          messages: { $push: '$messages' }, // Push sorted messages into an array
          username: { $first: '$username' }, // Assuming you want to include username in the result
          email: { $first: '$email' }, // Assuming you want to include email in the result
          // Add other fields you want to include in the result
        }
      },
    ]);
    console.log("User");
    console.log(user);

    if (!user || user.length === 0) {
      console.log('User not found');
      return Response.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { messages: user[0].messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}