import { Controller, Get, Param } from '@nestjs/common';
import { AssociationsService } from './associations.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Associations')
@Controller('associations')
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all associations' })
  findAll() {
    return this.associationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get association by ID' })
  findOne(@Param('id') id: string) {
    return this.associationsService.findOne(id);
  }
}
