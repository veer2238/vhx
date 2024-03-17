//server.js
const express = require('express');
const app = express();
const cors = require('cors'); 
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const stripe = require('stripe')('sk_test_51OqCilSEUqhlDKWTeud3OkR5sYXHBSgXlCaNEorkAJ3jSsZAtFnLwrem8AV28wJgbUPOLubgBHjxWdEF9ap47EbM00A2T7AKDA');
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

  wish: [
    {
      
        productId: { type: Number },
        quantity: { type: Number, default: 1 },
       productimg:{type:String},
        productname: { type: String },
        productprice: { type: Number }
       
      
    },
  ],

  shippingInfo: {
    name: String,
    mobile: String,
    email: String,
    address: String,
    state: String,
    pincode: String,
    landmark: String,
    city: String,
    alternate: String
  }

 
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
   
    const token = jwt.sign({ email }, 'secret-key', { expiresIn: '10h' });

    console.log(token)
    console.log(user.name)
    
 // Fetch user's cart items
 const cartItems = user.cart;

 const wishItems = user.wish;

 const shippingInfo = user.shippingInfo || {};

 // Return user data and cart items
 res.json({ success: true, data: token,cartdata:cartItems,wishdata:wishItems,shipping:shippingInfo });
 } catch (error) {
  console.error('Error during login:', error);
 }
    // Check if the user with the given email exists
    
 
   
    
  
});

app.get('/api/user', async (req, res) => {
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

      console.log(user.name)

      // Send the user's cart items
      res.json({ name: user.name,mobile:user.mobile });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
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

      res.json({ success: true, message: 'Product added to cart',cartItems: user.cart,wishItems: user.wish });
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

app.post('/add-to-wish', async (req, res) => {
  const { productId,productname,productimg,productprice,quantity } = req.body;
  
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
      user.wish.push({
        productId,
        productname,
        productimg,
        productprice,
        quantity
       
        
      });

      await user.save();

      console.log(user)

      res.json({ success: true, message: 'Product added to Wish',wishItems: user.wish });
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/wish', async (req, res) => {
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
      res.json({ wishItems: user.wish ,cartItems:user.cart});
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/remove-from-wish', async (req, res) => {
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
        { $pull: { wish: { productId: productId } } },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch the updated cart items
      const updatedWishItems = user.wish;

      res.json({ success: true, message: 'Product removed from cart', wishItems: updatedWishItems });
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/save-shipping-info', async (req, res) => {
  const { shippingInfo } = req.body;
  
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

      

      user.shippingInfo = shippingInfo;
    await user.save();
     

      console.log(user)

      res.json({ success: true, message: 'Shipping information saved successfully' });    });
  } catch (error) {
    console.error('Error saving shipping information:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.get('/get-user-address', async (req, res) => {
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

      // You can directly send the shipping information in the response
      const shippingInfo = user.shippingInfo || {};

      res.json({ success: true, data:shippingInfo });
      console.log(shippingInfo)
    });
  } catch (error) {
    console.error('Error fetching user address:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});






        




app.listen(3034, () => {
console.log('Server connected');
});