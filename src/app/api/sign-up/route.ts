import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request:Request) {
  //nextjs is edge timed so we will need to connect the database first
  await dbConnect();

  try {
    //we will get the user data from the request body
    const { username, email, password } = await request.json();

    //we are checking whether we can find any verified user based on username
    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingVerifiedUserByUsername) {
      //in case we do we simply return back and respond with the fact
      //that the username is already taken
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 },
      );
    }

    //if we don't find a verified user using username, we try it with email
    const existingUserByEmail = await UserModel.findOne({ email });

    //we prepare the OTP
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        //if we find verified user based on mail, we return back and respond
        //with email is already taken
        return Response.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 },
        );
      } else {
        //if we find an user with the email, but h/she is not verifed then
        // we will send him/her the OTP in his/her mail so we will store all the
        //data in the database
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.username = username;//hitesh sir missed this
        //the problem with the above line not being there is like:
        //the logic we are following in case there was an user who signed up but did  
        //not verify and now he signs up again but with different username,
        //since he did not verify last time so we update the details but if we do not 
        //update the username, then the verify page won't work, since it checks
        //the username and not the email, that would be a problem
        existingUserByEmail.password = hashedPassword; //storing the hashed password
        existingUserByEmail.verifyCode = verifyCode; //storing the OTP
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        //storing the time limit
        await existingUserByEmail.save(); //finally saving the updated user object
      }
    } else {
      //user doesn't exist at all so we will create a new user entry
      //in the database
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });

      //saving the new user entry with all the data
      await newUser.save();
    }

    // finally sending verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode,
    );
    if (!emailResponse.success) {
      //the email sending process was not successful
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 },
      );
    }

    //email successfully sent
    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your account.",
      },
      { status: 201 },
    );
  } catch (error) {
    //some error occured in the entire process
    console.error("Error registering user:", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 },
    );
  }
}