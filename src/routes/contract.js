const Router = require('koa-router');
const router = new Router({prefix: '/contracts'});

const {
    find,
    findByAddress,
    registerContract,
    deleteByAddress,
    startScanning,
    stopScanning,
    getAllEvents,
    clearEvents,
    getEvents,
    getEventsStatistics
} = require('../controllers/contract')

router.get('/', find)
router.get('/:address', findByAddress)
router.get('/:address/events/all', getAllEvents)
router.post('/', registerContract)
router.post('/:address/scanning/start', startScanning)
router.post('/:address/scanning/stop', stopScanning)
router.post('/:address/events/clear', clearEvents)
router.post('/events/query', getEvents)
router.post('/events/statistics', getEventsStatistics)
router.delete('/:address', deleteByAddress)

module.exports = router
