import { Injectable } from '@nestjs/common';
import Web3 from "web3";
import { ConfigService } from '@nestjs/config';
import { Event } from '@/schema/event.schema'

@Injectable()
export class FormatService {
    private readonly rpc: string;
    private readonly web3: Web3;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.rpc = this.configService.get<string>('web3.rpc');
        const httpProvider = new Web3.providers.HttpProvider(this.rpc);
        this.web3 = new Web3(httpProvider);
    }

    async formatEvents(events: any[]): Promise<Event[]>{
        const promises = []
        for (let i = 0; i < events.length; i++) {
            const event = events[i]
            const promise = this.web3.eth.getBlock(event.blockNumber).then((block) => {
                const timestamp = block.timestamp
                const newEvent = event
                newEvent.time =  new Date(Number(timestamp) * 1000) // 将Unix时间戳转换为Date对象
                newEvent.blockNumber = Number(event.blockNumber)
                newEvent.transactionIndex = Number(event.transactionIndex)
                newEvent.logIndex = Number(event.logIndex)
                Object.keys(newEvent.returnValues).forEach(key => {
                    if(typeof(newEvent.returnValues[key])==='object'){
                        Object.keys(newEvent.returnValues[key]).forEach(key2 => {
                            newEvent.returnValues[key][key2] = newEvent.returnValues[key][key2].toString()
                        })
                    }else{
                        newEvent.returnValues[key] = newEvent.returnValues[key].toString();
                    }
                });
                return newEvent
            })
            promises.push(promise)
        }
        return await Promise.all(promises)
    }

    formatTransactions(block){
        if(block.transactions){
            return block.transactions.map(transaction=>{
                return {
                    hash: transaction.hash,
                    blockHash: transaction.blockHash,
                    blockNumber: Number(transaction.blockNumber),
                    time: new Date(Number(block.timestamp) * 1000), // 将Unix时间戳转换为Date对象
                    from: transaction.from,
                    gas: transaction.gas.toString(),
                    gasPrice: transaction.gasPrice.toString(),
                    input: transaction.input,
                    nonce: transaction.nonce.toString(),
                    to: transaction.to,
                    transactionIndex: Number(transaction.transactionIndex),
                    value: transaction.value.toString(),
                    type: transaction.type.toString(),
                    chainId: Number(transaction.chainId),
                    v: transaction.v.toString(),
                    r: transaction.r.toString(),
                    s: transaction.s.toString()
                }
            })
        }else {
            return []
        }
    }

    formatBlock(block){
        return {
            hash: block.hash,
            number: Number(block.number),
            time: new Date(Number(block.timestamp) * 1000), // 将Unix时间戳转换为Date对象
            timestamp: Number(block.timestamp),
            difficulty: block.difficulty,
            extraData: block.extraData,
            gasLimit: block.gasLimit.toString(),
            gasUsed: block.gasUsed.toString(),
            logsBloom: block.logsBloom,
            miner: block.miner,
            mixHash: block.mixHash,
            nonce: block.nonce.toString(),
            parentHash: block.parentHash,
            sha3Uncles: block.sha3Uncles,
            size: Number(block.size),
            stateRoot: block.stateRoot,
            totalDifficulty: block.totalDifficulty,
            transactionsRoot: block.transactionsRoot,
            uncles: block.uncles
        }
    }
}
