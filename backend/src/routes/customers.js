const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

router.get('/', async (req, res) => {
  try { res.json(await prisma.customers.findMany()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/:id', async (req, res) => {
  try { res.json(await prisma.customers.findUnique({ where: { customer_id: +req.params.id } })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { name, phone, shipping_address } = req.body;
    res.status(201).json(await prisma.customers.create({ data: { name, phone: phone||null, shipping_address } }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, shipping_address } = req.body;
    res.json(await prisma.customers.update({ where: { customer_id: +req.params.id }, data: { name, phone: phone||null, shipping_address } }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:id', async (req, res) => {
  try { await prisma.customers.delete({ where: { customer_id: +req.params.id } }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;