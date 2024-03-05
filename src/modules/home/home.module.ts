import { Module } from '@nestjs/common'
import { HomeController } from './home.controller'
import { HomeService } from './home.service'

@Module({
    imports: [],
    controllers: [HomeController],
    providers: [HomeService],
})
export class HomeModule {}
