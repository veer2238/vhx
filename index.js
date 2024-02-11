//server.js
const express = require('express');
const app = express();
const cors = require('cors'); 
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
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
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: [
    {
      
        productId: { type: Number },
        quantity: { type: Number, default: 1 },
       productimg:{type:String},
        productname: { type: String },
        productprice: { type: Number }
      
    },
  ],
});



  // Product Schema

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
   
    const token = jwt.sign({ email }, 'secret-key', { expiresIn: '2h' });

    console.log(token)
    
 // Fetch user's cart items
 const cartItems = user.cart;

 // Return user data and cart items
 res.json({ success: true, data: token,cartdata:cartItems});
 } catch (error) {
  console.error('Error during login:', error);
 }
    // Check if the user with the given email exists
    
 
   
    
  
});

app.get('/api/user', async (req, res) => {
  try {
    // Extract token from request headers
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    // Verify token
    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          
          return res.status(401).json({ message: 'Token expired' });
        } else {
          return res.status(401).json({ message: 'Invalid token' });
        }
      }

      // Find user based on decoded email
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send user data
      res.status(200).json({ name: user.name,mobile:user.mobile });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/add-to-cart', async (req, res) => {
  const { productId,productname,productimg,productprice, quantity } = req.body;
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      

      // Add the product to the user's cart
      user.cart.push({
        productId,
        quantity,
        productname,
        productimg,
        productprice
        
      });

      await user.save();

      console.log(user)

      res.json({ success: true, message: 'Product added to cart' });
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/cart', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Send the user's cart items
      res.json({ cartItems: user.cart });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
 

app.post('/remove-from-cart', async (req, res) => {
  const { productId } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOneAndUpdate(
        { email: decoded.email },
        { $pull: { cart: { productId: productId } } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch the updated cart items
      const updatedCartItems = user.cart;

      res.json({ success: true, message: 'Product removed from cart', cartItems: updatedCartItems });
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/increase-quantity', async (req, res) => {
  const { productId } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOneAndUpdate(
        { email: decoded.email, 'cart.productId': productId },
        { $inc: { 'cart.$.quantity': 1 } }, // Increment quantity by 1
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch the updated cart items
      const updatedCartItems = user.cart;

      res.json({ success: true, message: 'Quantity added', cartItems: updatedCartItems });
    });
   
  } catch (error) {
    console.error('Error increasing quantity:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/decrease-quantity', async (req, res) => {
  const { productId } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const user = await User.findOneAndUpdate(
        { email: decoded.email, 'cart.productId': productId },
        { $inc: { 'cart.$.quantity': -1 } }, // Increment quantity by 1
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch the updated cart items
      const updatedCartItems = user.cart;

      res.json({ success: true, message: 'Quantity added', cartItems: updatedCartItems });
    });
   
  } catch (error) {
    console.error('Error increasing quantity:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});









          
app.listen(3034, () => {
console.log('Server connected');
});