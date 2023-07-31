const Router = require('koa-router');
const router = new Router({ prefix: '/contracts' });

const { find, findByAddress, registerContract, deleteByAddress, startScanning, stopScanning, getAllEvents, clearEvents, getEvents } = require('../controllers/contract')

router.get('/', find)
router.get('/:address',findByAddress)
router.post('/', registerContract)
router.delete('/:address',deleteByAddress)
router.post('/:address/scanning/start',startScanning())
router.post('/:address/scanning/stop',stopScanning())
router.get('/:address/events/all',getAllEvents())
router.post('/:address/events/clear',clearEvents())
router.post('/evnets/query',getEvents())

module.exports = router
