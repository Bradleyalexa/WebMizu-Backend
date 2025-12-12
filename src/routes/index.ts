import express from 'express'
import authRoutes from './auth'
import customerRoutes from './customers'
import productRoutes from './products'
import customerProductRoutes from './customerProducts'
import contractRoutes from './contracts'
import scheduleRoutes from './schedules'
import technicianRoutes from './technicians'
import serviceRoutes from './services'
import orderRoutes from './orders'
import invoiceRoutes from './invoices'
import taskRoutes from './tasks'
import chatRoutes from './chat'
import notificationRoutes from './notifications'
import reportRoutes from './reports'

const router = express.Router()

// Health check for API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      api_version: 'v1'
    },
    error: null
  })
})

// API routes
router.use('/auth', authRoutes)
router.use('/customers', customerRoutes)
router.use('/product-categories', productRoutes)
router.use('/product-catalog', productRoutes)
router.use('/customer-products', customerProductRoutes)
router.use('/contracts', contractRoutes)
router.use('/schedules', scheduleRoutes)
router.use('/technicians', technicianRoutes)
router.use('/service-logs', serviceRoutes)
router.use('/orders', orderRoutes)
router.use('/invoices', invoiceRoutes)
router.use('/tasks', taskRoutes)
router.use('/chat', chatRoutes)
router.use('/notifications', notificationRoutes)
router.use('/reporting', reportRoutes)

export default router