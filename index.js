//server.js
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const axios = require('axios')
app.use(express.static('assets'));
const cors = require('cors'); 
const crypto=require('crypto')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
require('dotenv').config(); 
app.use(express.json());
app.use(bodyParser.json()); 
app.use(cors());
app.use(express.static(path.join(__dirname, 'assets')));

const merchantId = process.env.MERCHANT_ID;
const saltKey = process.env.SALT_KEY;
const saltIndex = process.env.SALT_INDEX;
const frontendUrl = 'https://vhxview.com/confirm';


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
      categoryid:{
        type:Number,
        required:true
      },
      productid: {
         type: Number,
         required:true
        },
      size:{
        type: String,
        required:true
      },
      productimg:{
        type: String,
        required:true
      },
      productname:{
        type: String,
        required:true
      },
      productprice:{
        type: Number,
        required:true
      },
      quantity: {
         type: Number,
          default: 1 
        },
  
    },
  ],

  wish: [
    {

      categoryid: {
        type: Number,
        // required:true,
      },
      productid:
      {
        type: Number,
        // required:true,
      },
      productimg:
      {
        type: String,
        // required:true
      },
      productname:
      {
        type: String,
        // required:true
      },
      productprice:
      {
        type:Number,
        // required:true
      },
   


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
   
  },

  order: [
      
    {

      orderDate:{ 
        type: String

       },

      categoryid: {
        type: Number,
        required:true,
      },
      productid:
      {
        type: Number,
        required:true,
       
      },
      productimg:
      {
        type: String,
        
        
       
      },
      productname:
      {
        type: String,
       
       
      },
      productprice:
      {
        type:String,
     
       
      },
      size:
      {
        type: String,
        
      },
      quantity:
      {
        type: Number,
        default: 1
      }


    },
  ],

 

 
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
          console.error('Error reading file:', err);
          return res.json({ success: false, error: 'Internal Server Error' });
      }

      try {
          const jsonData = JSON.parse(data);

          const updatedData = jsonData.map(item => {
              if (item.category_img) {
                  item.category_img = `${req.protocol}://${req.get('host')}${item.category_img}`;
              }

              // Update product_container
              item.product_container = item.product_container.map(product => ({
                  ...product,
                  product_img: `${req.protocol}://${req.get('host')}${product.product_img}`,
                  side_img: product.side_img.map(sideImg => ({
                      ...sideImg,
                      img: `${req.protocol}://${req.get('host')}${sideImg.img}`,
                  })),
              }));

              return item;
          });

          res.json({ success: true, data: updatedData });
      } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          res.json({ success: false, error: 'Internal Server Error' });
      }
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

  res.status(500).json({ success: false, error: 'Internal Server Error' });

}


        

          
});


// login post
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.json({ success: false, error: 'Invalid username and password' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
          return res.json({ success: false, error: 'Invalid username and password' });
      }

      const token = jwt.sign({ email }, 'secret-key', { expiresIn: '24h' });

      const accountInfo = {
          name: user.name,
          email: user.email,
          mobile: user.mobile,
      };

      res.json({
          success: true,
          message: 'Thanks for logging in!',
          data: token,
          cartInfo: user.cart,
          wishInfo: user.wish,
          shippingInfo: user.shippingInfo,
          accountInfo: accountInfo,
          orderInfo: user.order
      });
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// get account data
app.get('/account-details', async (req, res) => {
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

      const accountInfo = {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
    
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
      return res.status(401).json({success: false,  error: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({success: false, error: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({success: false, error: 'User not found' });
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
  const { categoryid,productid,size,productimg,productname,productprice } = req.body;

  // console.log(categoryid,productid,size,productname,productprice,productimg)
  
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
        categoryid,productid,size,productname,productprice,productimg
        
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



// post for add to wish
app.post('/add-to-wish', async (req, res) => {
  const { categoryid, productid,productimg,productname,productprice} = req.body;

  console.log(categoryid, productid,productimg,productname,productprice)

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const existingProduct = user.wish.find(
        item => item.categoryid === categoryid && item.productid === productid 
      );
      if (existingProduct) {
        return res.json({ success: false, error: 'Product  already in the wishlist' });
      }

      // Add the product to the user's wish
      user.wish.push({
        categoryid,
        productid,
        productimg,
        productname,
        productprice,
        
      });

      const result = await user.save();

      console.log(result);

      res.json({ success: true, message: 'Thanks Product added to wish', wishInfo: user.wish });
    });
  } catch (error) {
    console.error('Error adding to wish', error);
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




// get shipping info
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

      // Send the user's cart items
      res.json({ shippingInfo: user.shippingInfo });
    });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// update shipping info
app.post('/save-shipping-info', async (req, res) => {
  const { name, email, mobile, address, state, pincode, landmark, city } = req.body;

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success:false,error:'Token not provided' });
    }

    jwt.verify(token, 'secret-key', async (err, decoded) => {
      if (err) {
        return res.status(401).json({success:false,error: 'Invalid token' });
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        return res.status(404).json({success:false,error: 'User not found' });
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
        message: 'Thanks Shipping information saved successfully',
        shippingInfo: user.shippingInfo
      });
    });
  } catch (error) {
    console.error('Error saving shipping information:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});





// add to order
app.post('/add-to-order', async (req, res) => {

  const { orderDate } = req.body;
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



      // Add each cart item to the order with the current date
      user.cart.forEach(item => {
        user.order.push({
          orderDate,
          categoryid: item.categoryid,
          productid: item.productid,
          productimg:item.productimg,
          productname:item.productname,
          productprice:item.productprice,
          size: item.size,
          quantity: item.quantity,

        });
      });

      // Clear user cart after adding to order
      user.cart = [];

      await user.save();

      res.json({
        success: true,
        message: 'Thanks! Your Order has Been Confirmed',
        orderInfo: user.order,
        cartInfo: user.cart
      });
    });
  } catch (error) {
    console.error('Error adding to order:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


// get order
app.get('/order', async (req, res) => {
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

    
      res.json({ orderInfo: user.order });
    });
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



  


      //  app.post('/create-payment', async (req, res) => {
      //   const { amount, orderId} = req.body;
      
      //   try {
      //     const token = req.headers.authorization?.split(' ')[1];
      //     if (!token) {
      //       return res.status(401).json({ message: 'Token not provided' });
      //     }
      
      //     jwt.verify(token, 'secret-key', async (err, decoded) => {
      //       if (err) {
      //         return res.status(401).json({ message: 'Invalid token' });
      //       }
      
      //       const user = await User.findOne({ email: decoded.email });
      //       if (!user) {
      //         return res.status(404).json({ message: 'User not found' });
      //       }
      //       const payload = {
      //         merchantId: merchantId,
      //         merchantTransactionId: orderId,
      //         merchantUserId:user.email,
      //         amount: amount*100,
      //         redirectMode: "REDIRECT",
      //         redirectUrl: `${frontendUrl}?orderId=${orderId}`,
      //         // callbackUrl: `${frontendUrl}/confirm`,
      //         // mobileNumber: user.mobile,
      //         paymentInstrument: {
      //             type: "PAY_PAGE"
      //         }
      //     };
      
      //      // Convert payload to JSON string
      //      const payloadString = JSON.stringify(payload);
      
      //            // Convert JSON string to Base64
      //     const base64Encoded = Buffer.from(payloadString).toString('base64');
          
      // // for header
      //     const stringToHash = `${base64Encoded}/pg/v1/pay${saltKey}`;
      // const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
      // const finalXHeader = `${sha256Hash}###${saltIndex}`;
      
      //      // Prepare request to PhonePe
      //      const request = {
      //       request: base64Encoded
      //   };
      
      //   // Send request to PhonePe
      //   const {data} = await axios.post('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', request, {
      //     headers: {
      //         'Content-Type': 'application/json',
      //         'X-VERIFY': finalXHeader
      //     }
      // });
      
      
      //  // Check the response from PhonePe
      //  if (data.success) {
        
      //   res.json({
      //       success: true,
      //       data: data.data.instrumentResponse.redirectInfo.url,
            
      //   });
      // } else {
      //   res.json({ success: false, message: "Failed to initiate payment" });
      // }
            
      //     });
      //   } catch (error) {
      //     console.error('Error creating payment:', error);
      //     res.status(500).json({ success: false, error: error.message });
      // }
      
      // });



      app.post('/verify-payment', async (req, res) => {
        const { orderId } = req.body;
      
      
        try {
          // Create the PhonePe check status URL
          const checkStatusUrl = `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${orderId}`;
          
          // Generate the X-VERIFY header
          const stringToHash = `/pg/v1/status/${merchantId}/${orderId}${saltKey}`;
          const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
          const finalXHeader = `${sha256Hash}###${saltIndex}`;
          
          // Send the request to PhonePe to check the payment status
          const { data } = await axios.get(checkStatusUrl, {
            headers: {
              'Content-Type': 'application/json',
              'X-VERIFY': finalXHeader,
            },
          });
      
          // Check the response from PhonePe
          if (data.success) {
            const paymentStatus = data.data.status;
            if (paymentStatus === 'SUCCESS') {
              // Perform actions like saving the order, clearing the cart, etc.
              res.json({ success: true, message: 'Payment successful' });
            } else {
              res.json({ success: false, message: 'Payment failed' });
            }
          } else {
            res.json({ success: false, message: 'Failed to verify payment status' });
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          res.status(500).json({ success: false, error: error.message });
        }
      });
      



app.post('/create-payment', async (req, res) => {
  const { amount, orderId} = req.body;

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
      const payload = {
        merchantId: merchantId,
        merchantTransactionId: orderId,
        merchantUserId:user.email,
        amount: amount*100,
        redirectMode: "REDIRECT",
        redirectUrl: `${frontendUrl}?orderId=${orderId}`,
        // callbackUrl: `${frontendUrl}/confirm`,
        // mobileNumber: user.mobile,
        paymentInstrument: {
            type: "PAY_PAGE"
        }
    };

     // Convert payload to JSON string
     const payloadString = JSON.stringify(payload);

           // Convert JSON string to Base64
    const base64Encoded = Buffer.from(payloadString).toString('base64');
    
// for header
    const stringToHash = `${base64Encoded}/pg/v1/pay${saltKey}`;
const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
const finalXHeader = `${sha256Hash}###${saltIndex}`;

     // Prepare request to PhonePe
     const request = {
      request: base64Encoded
  };

  // Send request to PhonePe
       const response = await axios.post('https://api.phonepe.com/apis/hermes/pg/v1/pay', request, {
           headers: {
               'Content-Type': 'application/json',
               'X-VERIFY': finalXHeader
           }
       });


 // Check the response from PhonePe
 if (response.data.success) {
  // If payment is initiated successfully, send the redirect URL to the frontend
  res.json({
      success: true,
      data: response.data.data.instrumentResponse.redirectInfo.url,
      
  });
} else {
  res.json({ success: false, message: "Failed to initiate payment" });
}
      
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, error: error.message });
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