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
const bcrypt = require('bcrypt');
const { type } = require('os');
require('dotenv').config(); // Load environment variables from .env file
app.use(express.json()); // To parse JSON bodies
app.use(bodyParser.json()); // Add this line to parse JSON requests
app.use(cors());
app.use(express.static(path.join(__dirname, 'assets')));



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
      categoryid:{type:Number},
      productid: { type: Number},
      size:{type: String},
      quantity: { type: Number, default: 1 },
  
    },
  ],

 wish: [
    {
      categoryid:{type:Number},
      productid: { type: Number},
    
     
  
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

const Contact = mongoose.model("contact", ContactSchema);



  

  const User = mongoose.model("newuser", registerSchema);


 
  
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

      const updatedData = jsonData.map(item => {
          // Update category_img
          if (item.category_img) {
              item.category_img = 'http://' + req.get('host') + item.category_img;
          }

          // Update product_container
          item.product_container = item.product_container.map(product => {
              return {
                  ...product,
                  product_img: 'http://' + req.get('host') + product.product_img,
                  side_img: product.side_img.map(sideImg => ({
                      ...sideImg,
                      img: 'http://' + req.get('host') + sideImg.img
                  })),
                  // Include any additional image fields that need updating
              };
          });
          return item;
      });

      res.json({ success: true, data: updatedData });
  });
});


  
  // for contact
  app.post("/contact", async(req, res)=>{
    const{name,mobile,email,message} = req.body;
  
  
    try{
  
      const exist =await Contact.findOne({email,message})
  
      if(exist){
        return res.json({success:false,error:'you have already messaged..'})
      }
  
      const result = await Contact.create({
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
    
  
      res.json({success: true, message: 'Thanks Your message has been sent!'});
      console.log(result);
    } catch (error){
      res.json({success: false, error:'Data not added'})
    }
  });

  // for contact data
  app.get("/contact-info", async (req, res) => {
    try {
      const contacts = await Contact.find();
      res.json({ success: true, data:contacts });
    } catch (error) {
      res.json({ success: false, error: 'Failed to retrieve contacts' });
    }
  });

  // for newslater

app.post('/newlater', async(req, res) =>{
  const {email} = req.body;
  

  
  
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
    res.json({ success: true, message: 'Thanks for subscribe' });
  } 
  
  
  
  
  catch (error) {
    console.error('Error during Subscribtion:', error);
  
    res.json({ success: false, error: 'Internal Server Error' });
  }
  
  
  });


  
 // for newslater data

  app.get('/newslatter-info', async (req, res) => {

    try {
      const emails = await News.find();
      
      res.json({ success: true, data:emails });
    } catch (error) {
      res.json({ success: false, error: 'Failed to retrieve Emails' });
    }
  });
  
 
// register data

app.post('/register', async(req, res) => {
const { name, email, mobile, password } = req.body;


try {

  // Check if the user with the given email already exists
  const existingUser = await User.findOne({ email });
  

  if (existingUser) {
    return res.json({ success: false, error: 'Email already registered, please login!' });
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
  res.json({ success: true, message: ' Thanks Registration successful' });
} 




catch (error) {
  console.error('Error during registration:', error);

  res.json({ success: false, error: 'Internal Server Error' });
}


        

          
});


// login post
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

 try {
  const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, error: 'Invalid username and pasword' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.json({ success: false, error: 'Invalid username and password' });
    }

    const token = jwt.sign({ email }, 'secret-key', { expiresIn: '24h' });

    console.log(token)
    



 const wishItems = user.wish;

 const shippingInfo = user.shippingInfo || {};

 const accountInfo = {
  name: user.name,
  email: user.email, 
  mobile: user.mobile,
  password: user.password,
};

 // Return user data and cart items
 res.json({success: true,message:'Thanks Shop here', data: token,cartInfo:user.cart,wishdata:wishItems,shipping:shippingInfo,accountInfo:accountInfo });
 } catch (error) {
  console.error('Error during login:', error);
 }
 
});


// get account data
app.get('/api/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ merror: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const accountInfo = {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        password: user.password,
      };

      res.json({ accountInfo:accountInfo });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// ACCOUNT INFORMATION UPDATE 

app.post('/update-account-data', async (req, res) => {
  const { name,email,mobile,password } = req.body;


  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({success: false,  alert: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({success: false, alert: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({success: false, alert: 'User not found' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
        user.name = name;
      user.email = email;
      user.mobile = mobile;

        user.password=hashedPassword
    await user.save();

    const accountInfo = {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      password: user.password,
    };

    res.json({ success: true, message: 'Thanks Your Information has Been Updated' ,accountInfo:accountInfo});  
    
    });
  } catch (error) {
    console.error('Error fetching user address:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
   

 
       });


// post for add to cart
app.post('/add-to-cart', async (req, res) => {
  const { categoryid,productid,size } = req.body;

  console.log(categoryid,productid,size)
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      
      // Check if the product already exists in the cart with the same categoryid, productid, and size
      const existingProduct = user.cart.find(
        item => item.categoryid === categoryid && item.productid === productid && item.size === size
      );

      if (existingProduct) {
        return res.json({ success:false,error: 'Product already in cart with the same size' });
      }

     
      user.cart.push({
        categoryid,
        productid,
       size
        
      });

      await user.save();

      console.log(user)

      res.json({ success: true, message: 'Thanks Product added to cart',cartInfo:user.cart});
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// for cart data get

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
      res.json({ cartInfo: user.cart });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
 
// for remove product 
app.post('/remove-from-cart', async (req, res) => {
  const { categoryid,productid,size } = req.body;

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
        { $pull: { cart: { categoryid,productid,size} } },
        { new: true }
      );

   
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

    

      res.json({ success: true, message: 'Thanks Product removed from cart', cartInfo: user.cart });
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// for increase quantity
app.post('/increase-quantity', async (req, res) => {
  const { categoryid, productid,size } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Find the user by email from the decoded token
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const productInCart = user.cart.find(item => item.categoryid === categoryid && item.productid === productid && item.size === size);
      if (productInCart) {
        
        if (productInCart.quantity < 10) {
          productInCart.quantity = productInCart.quantity + 1;
        } else {
          return res.json({success:false, error: 'Maximum quantity 10' });
        }
      } else {
        return res.json({success:false, error: 'Product not found in cart' });
      }

      
      await user.save();


      res.json({ success: true, message: 'Quantity increased', cartInfo: user.cart });
    });
  } catch (error) {
    console.error('Error increasing quantity:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



// for decrease quantity
app.post('/decrease-quantity', async (req, res) => {
  const { categoryid, productid,size } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Find the user by email from the decoded token
      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const productInCart = user.cart.find(item => item.categoryid === categoryid && item.productid === productid && item.size===size)
      if (productInCart) {
        
        if (productInCart.quantity > 1) {
          productInCart.quantity = productInCart.quantity - 1;
        } else {
          return res.json({success:false, error: '1 Minimum quantity required' });
        }
      } else {
        return res.json({success:false, error: 'Product not found in cart' });
      }

      
      await user.save();


      res.json({ success: true, message: 'Quantity increased', cartInfo: user.cart });
    });
  } catch (error) {
    console.error('Error increasing quantity:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// post for add to cart
app.post('/add-to-wish', async (req, res) => {
  const { categoryid,productid} = req.body;

  console.log(categoryid,productid)
  
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      
      // Check if the product already exists in the cart with the same categoryid, productid, and size
      const existingProduct = user.wish.find(
        item => item.categoryid === categoryid && item.productid === productid 
      );

      if (existingProduct) {
        return res.json({ success:false,error: 'Product already in wishlist' });
      }

     
      user.wish.push({
        categoryid,
        productid,
     
        
      });

      await user.save();

      console.log(user)

      res.json({ success: true, message: 'Thanks Product added to wishlist',wishInfo:user.wish});
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// for cart data get

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
      res.json({ wishInfo: user.wish });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
 
// for remove product 
app.post('/remove-from-wish', async (req, res) => {
  const { categoryid,productid } = req.body;

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
        { $pull: { wish: { categoryid,productid} } },
        { new: true }
      );

   
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

    

      res.json({ success: true, message: 'Thanks Product removed from wishlist', wishInfo: user.wish });
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



app.post('/save-shipping-info', async (req, res) => {
  const { name, mobile, email, address, state, pincode, landmark, city } = req.body;

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

      // Prepare the shipping information
      const shippingInfo = {
        name,
        mobile,
        email,
        address,
        state,
        pincode,
        landmark,
        city
      };

      // Update user's shipping information
      user.shippingInfo = shippingInfo;
      await user.save();

      console.log(user);

      res.json({
        success: true,
        message: 'Shipping information saved successfully',
        shippingInfo: user.shippingInfo
      });
    });
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