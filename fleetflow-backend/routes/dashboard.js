const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /dashboard — aggregated KPIs
router.get('/', authMiddleware([]), async (req, res) => {
    try {
        // Vehicle counts by status
        const vehicles = await prisma.vehicle.findMany();
        const vehiclesByStatus = {
            total: vehicles.length,
            available: vehicles.filter(v => v.status === 'available').length,
            on_trip: vehicles.filter(v => v.status === 'on_trip').length,
            in_shop: vehicles.filter(v => v.status === 'in_shop').length,
            retired: vehicles.filter(v => v.status === 'retired').length,
        };

        // Driver counts by status
        const drivers = await prisma.driver.findMany();
        const driversByStatus = {
            total: drivers.length,
            on_duty: drivers.filter(d => d.status === 'on_duty').length,
            off_duty: drivers.filter(d => d.status === 'off_duty').length,
            suspended: drivers.filter(d => d.status === 'suspended').length,
        };

        // Trip counts by state
        const trips = await prisma.trip.findMany();
        const tripsByState = {
            total: trips.length,
            draft: trips.filter(t => t.state === 'draft').length,
            dispatched: trips.filter(t => t.state === 'dispatched').length,
            completed: trips.filter(t => t.state === 'completed').length,
            cancelled: trips.filter(t => t.state === 'cancelled').length,
        };

        // Alerts
        const alerts = [];
        const expiredLicenses = drivers.filter(d => new Date(d.licenseExpiry) < new Date());
        if (expiredLicenses.length > 0) {
            alerts.push({ type: 'warning', message: `${expiredLicenses.length} driver(s) with expired license` });
        }
        const inShop = vehicles.filter(v => v.status === 'in_shop');
        if (inShop.length > 0) {
            alerts.push({ type: 'info', message: `${inShop.length} vehicle(s) in maintenance` });
        }

        // Total fuel & maintenance costs
        const fuelAgg = await prisma.fuelLog.aggregate({ _sum: { cost: true, liters: true } });
        const maintAgg = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } });

        res.json({
            vehiclesByStatus,
            driversByStatus,
            tripsByState,
            alerts,
            costs: {
                fuel: fuelAgg._sum.cost || 0,
                maintenance: maintAgg._sum.cost || 0,
                total: (fuelAgg._sum.cost || 0) + (maintAgg._sum.cost || 0),
            },
            totalFuelLiters: fuelAgg._sum.liters || 0,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dashboard data', details: err.message });
    }
});

module.exports = router;
