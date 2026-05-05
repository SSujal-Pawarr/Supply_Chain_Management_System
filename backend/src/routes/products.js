const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

router.get('/', async (req, res) => {
  try { res.json(await prisma.products.findMany({ include: { supplier: true } })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/:id', async (req, res) => {
  try { res.json(await prisma.products.findUnique({ where: { product_id: +req.params.id }, include: { supplier: true } })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { name, price, supplier_id } = req.body;
    res.status(201).json(await prisma.products.create({ data: { name, price: parseFloat(price), supplier_id: parseInt(supplier_id) } }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { name, price, supplier_id } = req.body;
    res.json(await prisma.products.update({ where: { product_id: +req.params.id }, data: { name, price: parseFloat(price), supplier_id: parseInt(supplier_id) } }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:id', async (req, res) => {
  try { await prisma.products.delete({ where: { product_id: +req.params.id } }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;