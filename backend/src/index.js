const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const customerRoutes  = require('./routes/customers');
const supplierRoutes  = require('./routes/suppliers');
const productRoutes   = require('./routes/products');
const warehouseRoutes = require('./routes/warehouses');
const orderRoutes     = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.use('/auth',       authRoutes);
app.use('/customers',  customerRoutes);
app.use('/suppliers',  supplierRoutes);
app.use('/products',   productRoutes);
app.use('/warehouses', warehouseRoutes);
app.use('/orders',     orderRoutes);
app.use('/inventory',  inventoryRoutes);

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));