const Router = require('koa-router');
const router = new Router({ prefix: '/contracts' });

const { find, findByAddress, registerContract, deleteByAddress } = require('../controllers/contract')

router.get('/', find)
router.get('/:address',findByAddress)
router.post('/', registerContract)
router.delete('/:address',deleteByAddress)

module.exports = router
