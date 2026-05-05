const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

router.get('/', async (req, res) => {
  try { res.json(await prisma.inventory.findMany({ include: { product: true, warehouse: true } })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { product_id, warehouse_id, quantity } = req.body;
    res.status(201).json(await prisma.inventory.create({ data: { product_id: parseInt(product_id), warehouse_id: parseInt(warehouse_id), quantity: parseInt(quantity) } }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:productId/:warehouseId', async (req, res) => {
  try {
    res.json(await prisma.inventory.update({
      where: { product_id_warehouse_id: { product_id: +req.params.productId, warehouse_id: +req.params.warehouseId } },
      data: { quantity: parseInt(req.body.quantity) }
    }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:productId/:warehouseId', async (req, res) => {
  try {
    await prisma.inventory.delete({ where: { product_id_warehouse_id: { product_id: +req.params.productId, warehouse_id: +req.params.warehouseId } } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
// ```

// ---

// ## STEP 5 — Run SQL files in pgAdmin

// Open pgAdmin → connect to `supply_chain_db` → open Query Tool → run files **in this exact order:**
// ```
// 1. schema/warehouses.sql
// 2. schema/suppliers.sql
// 3. schema/customers.sql
// 4. schema/products.sql
// 5. schema/orders.sql
// 6. schema/order_item.sql
// 7. schema/inventory.sql
// ```

// Then run your data files:
// ```
// data/data_warehouses.sql
// data/data_suppliers.sql
// data/data_customer.sql
// data/data_products.sql
// data/data_orders.sql
// data/data_order_items.sql
// data/data_inventory.sql