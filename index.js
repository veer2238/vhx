//server.js
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
app.use(express.static('assets'));
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

const ContactSchema = new mongoose.Schema({
  name:{
    type: String,
    require: true,
  },
  mobile:{
    type: String,
    requre: true,
  },
  email:{
    type: String,
    requre: true,
  },
  message:{
    type: String,
    requre: true,
  },

});

const NewsSchema = new mongoose.Schema({
 
  email:{
    type: String,
    requre: true,
  },
 

});

const User1 = mongoose.model("data", ContactSchema);



  // Product Schema

  const User = mongoose.model("register", registerSchema);


 
  
  const News = mongoose.model("newlater", NewsSchema);


// get data from api
app.get('/api', (req, res) => {
  const filePath = path.join(__dirname, 'data.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error(err);
          return res.json({ success: false, error: 'Internal Server Error' });
      }

      const jsonData = JSON.parse(data);

      jsonData.forEach(item => {
          if (item.home_page_route_category_page_img) {
              item.home_page_route_category_page_img = req.protocol + '://' + req.get('host') + item.home_page_route_category_page_img;
          }
          item.product_container.forEach(product => {
              product.imgs = req.protocol + '://' + req.get('host') + product.imgs;
              product.first = req.protocol + '://' + req.get('host') + product.first;
              product.second = req.protocol + '://' + req.get('host') + product.second;
              product.third = req.protocol + '://' + req.get('host') + product.third;
          });
      });

      res.json({ success: true, data: jsonData });
  });
});

  
  
  app.post("/contact", async(req, res)=>{
    const{name,mobile,email,message} = req.body;
  
  
    try{
  
      const exist =await User1.findOne({email,message})
  
      if(exist){
        return res.json({success:false,error:'you have already messaged..'})
      }
  
      const result = await User1.create({
        name,
        mobile,
        email,
        message,
      });
  
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to VHX View',
        html: `
          <p>Hello ${name}</p>
          <p>Thank you for registering with VHX View. We are excited to have you on board!</p>
          <p>Best regards,</p>
          <p>VHX View Team</p>
        `,
    
    
      };
    
    
      
    
        const info =  await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    
  
      res.json({success: true, message: 'Your message has been sent!'});
      console.log(result);
    } catch (error){
      res.json({success: false, error:'Data not added'})
    }
  });

  //news later
app.post('/newlater', async(req, res) =>{
  const {email} = req.body;
  
  // console.log(email)
  
  
  try {
  
    const existingUserr = await News.findOne({ email });
    const existingRegister = await User.findOne({ email });
   
  
    if (existingUserr || existingRegister) {
      return res.json({ success: false, error: 'You are already a Subscriber!!' });
    }
  
  
  
  const result = await News.create({
      email,    
      });
                
      console.log(result);
    
     const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    
  
     const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank You For Subscribing!',
      html: `
        <p>Thank you for Subscrbing with VHX View. We are excited to have you on board!</p>
        <p>Best regards,</p>
        <p>VHX View Team</p>
        <img src="https://i.ibb.co/qnVVcMk/digital-camera-photo-1080x675.jpg">
      `,
    
    
    };
    
    
    
    const info =  await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.json({ success: true, message: 'thanks for subscribe' });
  } 
  
  
  
  
  catch (error) {
    console.error('Error during Subscribtion:', error);
  
    res.json({ success: false, error: 'Internal Server Error' });
  }
  
  
  });


  app.get('/newslatter-info', async (req, res) => {

    try {
      const emails = await News.find();
      console.log(emails)
      res.json({ success: true, data:emails });
    } catch (error) {
      res.json({ success: false, error: 'Failed to retrieve Emails' });
    }
  });
  
  app.get("/contact-info", async (req, res) => {
    try {
      const contacts = await User1.find();
      res.json({ success: true, data:contacts });
    } catch (error) {
      res.json({ success: false, error: 'Failed to retrieve contacts' });
    }
  });
//get register data

app.post('/register', async(req, res) => {
const { name, email, mobile, password } = req.body;


try {

  // Check if the user with the given email already exists
  const existingUser = await User.findOne({ email });
  
  
 

 
 

  if (existingUser) {
    // If user exists, return an error response
    return res.json({ success: false, error: 'Email already registered, please do login!' });
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

    // for newslatter
    const result1 = await News.create({
     
      email,
    
                
      });
                
      console.log(result1);
  
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

      

      res.json({ name: user.name,mobile:user.mobile,email:user.email, password:user.password , shipping:user.shippingInfo });
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


// ACCOUNT INFORMATION UPDATE 


app.post('/name_update', async (req, res) => {
  const { name } = req.body; // Destructure name, mobile, and password from req.body
  
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

      // Update user details
      user.name = name;
      
      await user.save();

      console.log(user.name);
      // console.log(user.mobile);
      

      res.json({ success: true, message: 'User details updated successfully' });
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.post('/mobile_update', async (req, res) => {
  const { mobile } = req.body; // Destructure name, mobile, and password from req.body
  
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

      // Update user details
      user.mobile = mobile;
      
      await user.save();

      console.log(user.mobile);
      // console.log(user.mobile);
      

      res.json({ success: true, message: 'User details updated successfully' });
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.post('/pass_update', async (req, res) => {
  const { password , oldpass } = req.body; // Destructure name, mobile, and password from req.body
  
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

     
      // Update user details
      console.log(oldpass)
      const passwordMatch = await bcrypt.compare(oldpass, user.password);

      if (!passwordMatch) {
        return res.json({ success: false, error: 'Invalid  password' });
      }
        console.log(password)
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword)
        user.password = hashedPassword;
      
        await user.save();

       console.log(user.password);

      
      
      

      res.json({ success: true, message: 'User password updated successfully' });
    });
  } catch (error) {
    console.error('Error updating user password:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}); 

app.post('/update-account-data', async (req, res) => {
  const { name,email,mobile } = req.body;

   

   
    const user = await User.findOne({email})

      

      user.name = name;
      user.email = email;
      user.mobile = mobile;
    await user.save();
     

      console.log(user)

      res.json({ success: true, message: 'Shipping information saved successfully' });  
      });


  




// schedule.scheduleJob('30 17 * 3 5', async () => {
//   try {
// const users = await News.find();

// for (const user of users) {

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const mailOptions = {
//   from: process.env.EMAIL_USER,
//   to: 'jalpunpatel95@gmail.com',
//   subject: ' V-Ex Tech Solution (Weekend Holiday Notice)',
//   html: 'hi',
// };


  
// const info = await transporter.sendMail(mailOptions);
// console.log('Email sent:', info.response);
// console.log('holiday emails sent successfully');
  
// }

   
//   } catch (error) {
// console.error("Error sending birthday emails:", error);
//   }
// });



app.listen(3034, () => {
console.log('Server connected');
});