const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await prisma.orders.findMany({ include: { customer: true }, orderBy: { order_date: 'desc' } });
    res.json(data.map(o => ({ ...o, customer_name: o.customer?.name })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/:id', async (req, res) => {
  try { res.json(await prisma.orders.findUnique({ where: { order_id: +req.params.id }, include: { customer: true, order_items: { include: { product: true } } } })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { customer_id, total_amount, status } = req.body;
    res.status(201).json(await prisma.orders.create({ data: { customer_id: parseInt(customer_id), total_amount: parseFloat(total_amount), status: status||'PENDING' } }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { customer_id, total_amount, status } = req.body;
    res.json(await prisma.orders.update({ where: { order_id: +req.params.id }, data: { customer_id: parseInt(customer_id), total_amount: parseFloat(total_amount), status } }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:id', async (req, res) => {
  try { await prisma.orders.delete({ where: { order_id: +req.params.id } }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;