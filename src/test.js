const keyList = [ 'user', 'returnvalues' ]
let tmp = {
    _id: "64cb673c3da510104ce7d401",
    time: '2023-07-31T21:08:35.000Z',
    returnValues: {
        user: '0x7D89019FbDf06925d6BAE8F23016d1007210b76a',
        cost: '60000000000000000000'
    }
}

while (keyList.length > 0) {
    console.log(tmp)
    const t = keyList.pop()
    console.log(t)
    console.log(keyList.length)
    tmp = tmp[t]
}
console.log(tmp)
