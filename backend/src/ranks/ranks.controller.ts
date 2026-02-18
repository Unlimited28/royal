import { Controller, Get } from '@nestjs/common';
import { RanksService } from './ranks.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Ranks')
@Controller('ranks')
export class RanksController {
  constructor(private readonly ranksService: RanksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all official ranks' })
  findAll() {
    return this.ranksService.findAll();
  }
}
