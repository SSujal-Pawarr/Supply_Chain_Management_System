const express = require('express');
const prisma = require('../prisma');
const router = express.Router();

router.get('/', async (req, res) => {
  try { res.json(await prisma.warehouses.findMany()); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/:id', async (req, res) => {
  try { res.json(await prisma.warehouses.findUnique({ where: { warehouse_id: +req.params.id } })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { location, capacity, warehouse_manager } = req.body;
    res.status(201).json(await prisma.warehouses.create({ data: { location, capacity: capacity ? parseInt(capacity) : null, warehouse_manager: warehouse_manager||null } }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { location, capacity, warehouse_manager } = req.body;
    res.json(await prisma.warehouses.update({ where: { warehouse_id: +req.params.id }, data: { location, capacity: capacity ? parseInt(capacity) : null, warehouse_manager: warehouse_manager||null } }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:id', async (req, res) => {
  try { await prisma.warehouses.delete({ where: { warehouse_id: +req.params.id } }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;