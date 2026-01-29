const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(express.json());
app.use(cors());

const NO_DRIVERS = process.env.NO_DRIVERS === 'true';

// Simulate async delay
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Available drivers
const drivers = [
  { name: 'Mario', distance: 2.5, rating: 4.8 },
  { name: 'Luigi', distance: 3.0, rating: 4.9 },
  { name: 'Peach', distance: 1.5, rating: 5.0 },
  { name: 'Toad', distance: 4.0, rating: 4.7 }
];

// Find nearest available driver
async function findNearestDriver() {
  console.log(`Searching for nearest driver...`);
  await sleep(100);
  
  if (NO_DRIVERS) {
    return null;
  }
  
  // Sort by distance and return closest
  const sortedDrivers = [...drivers].sort((a, b) => a.distance - b.distance);
  return sortedDrivers[0];
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'delivery-service' });
});

// Assign driver to delivery
app.post('/assign-driver', async (req, res) => {
  const { orderId, customerName } = req.body;
  
  console.log(`Assigning driver for order ${orderId} (customer: ${customerName})`);
  
  // Find nearest driver
  const driver = await findNearestDriver();
  
  if (!driver) {
    console.log(`No drivers available for order ${orderId}`);
    return res.status(503).json({
      error: 'No drivers available',
      orderId,
      message: 'All drivers are currently busy. Please try again later.'
    });
  }
  
  // Calculate estimated delivery time based on distance
  const estimatedDeliveryTime = Math.ceil(driver.distance * 5); // 5 min per km
  
  await sleep(150);
  
  console.log(`Driver ${driver.name} assigned to order ${orderId} (${driver.distance}km away)`);
  
  res.json({
    orderId,
    driverName: driver.name,
    driverRating: driver.rating,
    distance: driver.distance,
    estimatedDeliveryTime,
    status: 'driver-assigned'
  });
});

// Get delivery status
app.get('/status/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  console.log(`Delivery status check for order ${orderId}`);
  
  res.json({
    orderId,
    status: 'on-the-way',
    message: 'Your pizza is on the way!'
  });
});

app.listen(PORT, () => {
  console.log(`Delivery Service listening on port ${PORT}`);
  console.log(`No drivers mode: ${NO_DRIVERS ? 'ENABLED (all busy!)' : 'DISABLED'}`);
  console.log(`Available drivers: ${drivers.length}`);
});
