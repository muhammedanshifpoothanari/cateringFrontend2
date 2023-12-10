const express = require('express');
const app = express();
const session = require('express-session');
const axios = require('axios');
require('dotenv').config();
const port = process.env.PORT;
// const multer = require('multer');
const bodyParser = require('body-parser');


const path = require('path');
app.use(session({
    secret: `${process.env.SECRET}`, 
    resave: false,
    saveUninitialized: true,
  }));


  app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/scss', express.static(path.join(__dirname, 'scss')));

app.use('/css', express.static(path.join(__dirname, 'css'), { 'Content-Type': 'text/css' }));

app.use('/vendor/fontawesome-free/css', express.static(path.join(__dirname, 'vendor/fontawesome-free/css'), { 'Content-Type': 'text/css' }));
app.use('/vendor', express.static(path.join(__dirname, 'vendor')));

app.use('/js', express.static(path.join(__dirname, 'js'), { 'Content-Type': 'application/javascript' }));

app.use('/img', express.static(path.join(__dirname, 'img')));

app.get('/login', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, './login.html'));
        } catch (error) {
        res.sendFile(path.join(__dirname, '404.html'));
    }
});


app.get('/getName', async (req, res) => {
    const message = req.session.name
    res.json({ message });
});

app.get('/employees', async (req, res) => {
    const response = await axios.get(`${process.env.URL}/admin/user`);
    const message = response.data.message
    res.json({ message });

});

const authenticate = async (req,res,next) => {
    if(req.session.auth === true){
        next()
    }else{
        res.sendFile(path.join(__dirname, 'login.html'));
    }
}
app.post('/login', async(req, res) => {
    console.log(req.body);
try {
    

    const response = await axios.post(`${process.env.URL}/admin/login`,req.body);
    if (response.status === 200) {
        res.sendFile(path.join(__dirname, 'index.html'));
        req.session.auth =  true;
        req.session.name =  req.body.name;        
    } else {
        req.session.auth =  false;
        res.sendFile(path.join(__dirname, 'login.html'));
    }
} catch (error) {
    req.session.auth =  false;
    res.sendFile(path.join(__dirname, 'login.html'));
}
});



app.post('/loginValidation', async (req, res) => {
    try {
    console.log('hggtfgdfdv');

        const response = await axios.post(`${process.env.URL}/admin/login`,req.body);
        console.log('response',response.data);

        if (response.status === 200) {
            res.json({message: true})
        
        }
    } catch (error) {
        console.log('response',response.data.error);
        req.session.auth =  false;
        res.json({message: false})
    }
});
app.post('/register',authenticate, async(req, res) => {
    try {
        
    
    console.log(req.body);
    const { name, password } = req.body;
    const response = await axios.post(`${process.env.URL}/admin/register`,req.body);
    if (response.status === 200) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'login.html'));
    }
} catch (error) {
    res.sendFile(path.join(__dirname, 'register.html'));
}

});

app.get('/register',authenticate, async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'register.html'));
    } catch (error) {
        res.sendFile(path.join(__dirname, '404.html'));
    }
});

app.get('/dashboard',authenticate, async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'index.html'));
    } catch (error) {
        res.sendFile(path.join(__dirname, '404.html'));
    }
});


app.get('/',authenticate, async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'index.html'));
    } catch (error) {
        res.sendFile(path.join(__dirname, '404.html'));
    }
});

app.get('/dataEntry',authenticate, async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'dataEntry.html'));
    } catch (error) {
        res.sendFile(path.join(__dirname, '404.html'));
    }
});


app.post('/dataEntry',authenticate, async (req, res) =>{
    try {
        const { itemName, ...itemDetails } = req.body;
        const items = [];
        for (let i = 1; itemDetails[`itemTypes${i}`] !== undefined && itemDetails[`itemPrices${i}`] !== undefined; i++) {
            items.push({
                itemTypes: itemDetails[`itemTypes${i}`],
                itemPrice: parseInt(itemDetails[`itemPrices${i}`]),
            });
        }

        const transformedBody = {
            itemName,
            items,
        };

       const response = await axios.post(`${process.env.URL}/admin/item/createItem`,transformedBody);
       res.sendFile(path.join(__dirname, 'stockTable.html'));

    } catch (error) {
        console.log(response.data.error);
    }
});

app.post('/updateDataEntry',authenticate, async (req, res) =>{
    try {
        const { id,itemName, ...itemDetails } = req.body;
        const items = [];
        for (let i = 0; itemDetails[`itemTypes${i}`] !== undefined && itemDetails[`itemPrices${i}`] !== undefined; i++) {
            items.push({
                itemTypes: itemDetails[`itemTypes${i}`],
                itemPrice: parseInt(itemDetails[`itemPrices${i}`]),
            });
        }

        const transformedBody = {
            id,
            itemName,
            items,
        };

       const response = await axios.post(`${process.env.URL}/admin/item/updateItemById`,transformedBody);
       res.sendFile(path.join(__dirname, 'stockTable.html'));

    } catch (error) {
        console.log(response.data.error);
    }
});

app.get('/stockTableData',authenticate, async (req, res) => {
    try {
        const allStocks = await axios.get(`${process.env.URL}/admin/item/getAll`);
        const message = allStocks.data.message;

        res.json({ message });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/orderTableData',authenticate, async (req, res) => {
    try {
        const allStocks = await axios.get(`${process.env.URL}/admin/order/getAll`);
        const message = allStocks.data.message;
      
        res.json({ message });
    } catch (error) {
        console.error('Error fetching data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/estimationForm',authenticate, async (req, res) => {
    res.sendFile(path.join(__dirname, 'estimationForm2.html'));

});
app.post('/order',authenticate, async (req, res) =>{
    console.log('Received request:', req.body);
    const {
        formData,
        items
    } = req.body;
    const dataObject = {};

    for (const [key, value] of formData) {
      dataObject[key] = value;
    }
    
    const transformedBody = {
        companyName:dataObject.companyName,
        customerName:dataObject.customerName,
        streetAddress:dataObject.streetAddress,
        city:dataObject.city,
        zip:dataObject.zip,
        phone:dataObject.phone,
        emailAddress:dataObject.emailAddress,
        peopleCount:dataObject.peopleCount,
        functionType:dataObject.functionType,
        items,
        total:dataObject.total,
        subtotal:dataObject.total,
    }
    const response = await axios.post(`${process.env.URL}/admin/order/createOrder`,transformedBody);
    res.redirect('dashboard')

});


app.get('/stockTable',authenticate, async (req, res) => {
    // res.sendFile(path.join(__dirname, 'stockTable.html'), { message });
    res.sendFile(path.join(__dirname, 'stockTable.html'));
})

app.get('/orderTable',authenticate, async (req, res) => {
    // res.sendFile(path.join(__dirname, 'stockTable.html'), { message });
    res.sendFile(path.join(__dirname, 'orderTable.html'));
})

let orderId;
app.get('/invoice/:orderId', async (req, res) => {
     orderId = req.params.orderId;
    console.log(orderId);

    const filePath = path.join(__dirname, `invoice.html`);

    res.sendFile(filePath);
});
let updateId;
app.get('/updateEntry/:updateId',authenticate, async (req, res) => {
    updateId = req.params.updateId;
    console.log(orderId);

     const filePath = path.join(__dirname, `updateDataEntry.html`);

     res.sendFile(filePath);
});


app.get('/updateId',authenticate, async (req, res) => {
    ids = updateId
   console.log(ids);
   const transformedBody = {
    id: ids
   }
   const response = await axios.post(`${process.env.URL}/admin/item/getByItemId`,transformedBody);

   const responseData = {
    items: response.data.message,
   };

    res.json(responseData);
});


app.get('/invoiceId', async (req, res) => {
    ids = orderId
   console.log(ids);
   const transformedBody = {
    id: ids
   }
   const response = await axios.post(`${process.env.URL}/admin/order/getByOrderId`,transformedBody);

   const responseData = {
    items: response.data.message,
   };

    res.json(responseData);
});


let itemArray = [];

app.post('/addItem',authenticate, (req, res) => {
    const index = req.body.index;
    itemArray.push(`<div id="itemContainer_${index}">Item ${index}</div>`);
    res.json({ items: itemArray });
});

app.post('/removeItem',authenticate, (req, res) => {
    const index = req.body.index;
    itemArray = itemArray.filter((item, i) => i !== index);
    res.json({ items: itemArray });
});
app.get('/logout', (req, res) => {
      req.session.destroy();
      res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(port, () => {
    console.log('server is running:',port)
 });