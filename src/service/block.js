const Block = require('../models/block')

exports.addBlock = async (blockData) => {
    const block = await new Block(blockData).save()
    return block
}
exports.addBlocks = async (blockDatas) => {
    const blocks = blockDatas.map(blockData => new Block(blockData))
    //批量写入
    await Block.bulkSave(blocks)
    return blocks
}
exports.dropIndexes = async ()=> {
    //删除现有索引
    await Block.collection.dropIndexes();
}
exports.createIndexes = async () => {
    //重建索引
    await Block.collection.createIndexes();
}
