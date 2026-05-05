const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

router.get('/', async (req, res) => {
  try { res.json(await prisma.suppliers.findMany()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/:id', async (req, res) => {
  try { res.json(await prisma.suppliers.findUnique({ where: { supplier_id: +req.params.id } })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { name, contact_email, phone, city } = req.body;
    res.status(201).json(await prisma.suppliers.create({ data: { name, contact_email: contact_email||null, phone: phone||null, city } }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { name, contact_email, phone, city } = req.body;
    res.json(await prisma.suppliers.update({ where: { supplier_id: +req.params.id }, data: { name, contact_email: contact_email||null, phone: phone||null, city } }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:id', async (req, res) => {
  try { await prisma.suppliers.delete({ where: { supplier_id: +req.params.id } }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;