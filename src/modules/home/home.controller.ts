import { Controller, Get, Inject, LoggerService } from '@nestjs/common'
import { HomeService } from '@/modules/home/home.service'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('home')
@Controller()
export class HomeController {
  constructor (
        private readonly homeService: HomeService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService
  ) {
    this.logger.log('Home Controller init')
  }

    @Get()
  getHello (): string {
    return this.homeService.getHello()
  }
}
