const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding FleetFlow database...');

    // Users
    const hashedPass = await bcrypt.hash('admin123', 10);
    const users = await Promise.all([
        prisma.user.upsert({ where: { email: 'manager@fleet.io' }, update: {}, create: { email: 'manager@fleet.io', password: hashedPass, role: 'manager' } }),
        prisma.user.upsert({ where: { email: 'dispatcher@fleet.io' }, update: {}, create: { email: 'dispatcher@fleet.io', password: hashedPass, role: 'dispatcher' } }),
        prisma.user.upsert({ where: { email: 'analyst@fleet.io' }, update: {}, create: { email: 'analyst@fleet.io', password: hashedPass, role: 'analyst' } }),
        prisma.user.upsert({ where: { email: 'safety@fleet.io' }, update: {}, create: { email: 'safety@fleet.io', password: hashedPass, role: 'safety_officer' } }),
    ]);
    console.log(`  ✅ ${users.length} users seeded`);

    // Vehicles
    const vehicles = await Promise.all([
        prisma.vehicle.create({ data: { name: 'Freightliner Cascadia', licensePlate: 'FL-1001', maxCapacity: 22000, odometer: 145230 } }),
        prisma.vehicle.create({ data: { name: 'Volvo VNL 860', licensePlate: 'VL-2002', maxCapacity: 19500, odometer: 98400 } }),
        prisma.vehicle.create({ data: { name: 'Kenworth T680', licensePlate: 'KW-3003', maxCapacity: 20000, odometer: 210100 } }),
        prisma.vehicle.create({ data: { name: 'Peterbilt 579', licensePlate: 'PB-4004', maxCapacity: 21000, odometer: 72800 } }),
        prisma.vehicle.create({ data: { name: 'Mack Anthem', licensePlate: 'MA-5005', maxCapacity: 23000, odometer: 33200, status: 'in_shop' } }),
    ]);
    console.log(`  ✅ ${vehicles.length} vehicles seeded`);

    // Drivers
    const drivers = await Promise.all([
        prisma.driver.create({ data: { name: 'James Rodriguez', licenseExpiry: new Date('2027-06-15'), safetyScore: 95 } }),
        prisma.driver.create({ data: { name: 'Sarah Chen', licenseExpiry: new Date('2026-12-01'), safetyScore: 98 } }),
        prisma.driver.create({ data: { name: 'Mike Thompson', licenseExpiry: new Date('2026-03-10'), safetyScore: 87 } }),
        prisma.driver.create({ data: { name: 'Lisa Park', licenseExpiry: new Date('2028-01-22'), safetyScore: 92 } }),
    ]);
    console.log(`  ✅ ${drivers.length} drivers seeded`);

    // Trips
    const trips = await Promise.all([
        prisma.trip.create({ data: { vehicleId: vehicles[0].id, driverId: drivers[0].id, cargoWeight: 18000, state: 'completed', origin: 'Los Angeles, CA', destination: 'Phoenix, AZ', startOdometer: 145000, endOdometer: 145600 } }),
        prisma.trip.create({ data: { vehicleId: vehicles[1].id, driverId: drivers[1].id, cargoWeight: 15500, state: 'completed', origin: 'Dallas, TX', destination: 'Houston, TX', startOdometer: 98000, endOdometer: 98400 } }),
        prisma.trip.create({ data: { vehicleId: vehicles[2].id, driverId: drivers[2].id, cargoWeight: 19000, state: 'dispatched', origin: 'Chicago, IL', destination: 'Detroit, MI', startOdometer: 210000 } }),
    ]);
    console.log(`  ✅ ${trips.length} trips seeded`);

    // Set dispatched vehicle/driver to on_trip/on_duty
    await prisma.vehicle.update({ where: { id: vehicles[2].id }, data: { status: 'on_trip' } });
    await prisma.driver.update({ where: { id: drivers[2].id }, data: { status: 'on_duty' } });

    // Maintenance logs
    await Promise.all([
        prisma.maintenanceLog.create({ data: { vehicleId: vehicles[4].id, description: 'Engine overhaul', cost: 4500 } }),
        prisma.maintenanceLog.create({ data: { vehicleId: vehicles[0].id, description: 'Brake pad replacement', cost: 850 } }),
        prisma.maintenanceLog.create({ data: { vehicleId: vehicles[2].id, description: 'Oil change and filter', cost: 320 } }),
    ]);
    console.log('  ✅ 3 maintenance logs seeded');

    // Fuel logs
    await Promise.all([
        prisma.fuelLog.create({ data: { vehicleId: vehicles[0].id, liters: 320, cost: 480 } }),
        prisma.fuelLog.create({ data: { vehicleId: vehicles[0].id, liters: 290, cost: 435 } }),
        prisma.fuelLog.create({ data: { vehicleId: vehicles[1].id, liters: 250, cost: 375 } }),
        prisma.fuelLog.create({ data: { vehicleId: vehicles[2].id, liters: 410, cost: 615 } }),
        prisma.fuelLog.create({ data: { vehicleId: vehicles[3].id, liters: 180, cost: 270 } }),
    ]);
    console.log('  ✅ 5 fuel logs seeded');

    console.log('\n🎉 Seed complete!');
    console.log('\n📧 Login credentials (all passwords: admin123):');
    console.log('   manager@fleet.io   — Full access');
    console.log('   dispatcher@fleet.io — Trip dispatch');
    console.log('   analyst@fleet.io   — Analytics');
    console.log('   safety@fleet.io    — Safety officer');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
