import { Injectable } from '@nestjs/common'

@Injectable()
export class HomeService {
    getHello(): string {
        return 'Onchain To Offchain Server is Working well!'
    }
}
