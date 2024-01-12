//server.js
const express = require('express');
const app = express();
const cors = require('cors'); 
const mongoose = require('mongoose')
const bodyParser = require('body-parser'); // Add this line
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt')
require('dotenv').config(); // Load environment variables from .env file
app.use(express.json()); // To parse JSON bodies
app.use(bodyParser.json()); // Add this line to parse JSON requests
app.use(cors());

mongoose
.connect(
  "mongodb+srv://hundlanijay:hVFEqU8iumiSowXL@registerdata.pqv1sbi.mongodb.net/?retryWrites=true&w=majority"
)
.then(() => console.log("mongo connected"))
.catch((err) => console.log("mongo error", err));


const registerSchema = new mongoose.Schema({
  name: {
  type: String,
  require: true,
  },
  email: {
  type: String,
  require: true,
  },
  mobile: {
  type: String,
  require: true,
  },
  password: {
  type: String,
  require: true,
  },
  });

  const User = mongoose.model("register", registerSchema);

//get register data

app.post('/register', async(req, res) => {
const { name, email, mobile, password } = req.body;


try {

  // Check if the user with the given email already exists
  const existingUser = await User.findOne({ email });
 

  if (existingUser) {
    // If user exists, return an error response
    return res.json({ success: false, error: 'Email already registered, please do login' });
  }


  const hashedPassword = await bcrypt.hash(password, 10);



  
  
  // add data
const result = await User.create({
    name,
    email,
    mobile,
    password:hashedPassword,
              
    });
              
    console.log(result);
  
   // Create a Nodemailer transporter
   const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  
  
  
   // Define email options
   const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to VHX View',
    html: `
      <p>Hello ${name}</p>
      <p>Thank you for registering with VHX View. We are excited to have you on board!</p>
      <p>Best regards,</p>
      <p>VHX View Team</p>
      <img src="https://i.ibb.co/qnVVcMk/digital-camera-photo-1080x675.jpg">
    `,
  
  
  };
  
  
  
  const info =  await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.response);
  res.json({ success: true, message: 'Registration successful' });
} 




catch (error) {
  console.error('Error during registration:', error);

  res.json({ success: false, error: 'Internal Server Error' });
}








          

          

// console.log('User Registration Data:', { name, email, mobile, password });
          
});

// Update your login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

 try {
  const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, error: 'Invalid email' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.json({ success: false, error: 'Invalid  password' });
    }

    // Return user data (in this case, just the name)
    res.json({ success: true,data:user.name});
 } catch (error) {
  console.error('Error during login:', error);
 }
    // Check if the user with the given email exists
    
 
   
    
  
});

app.get('/user/:username', async (req, res) => {
  const { username } = req.params;


    const user = await User.findOne({ name: username });

   

const userData = {
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  password:user.password
  
  // Avoid sending sensitive information like passwords to the client
};

res.json({ success: true, data: userData });


});



          
app.listen(3034, () => {
console.log('Server connected');
});