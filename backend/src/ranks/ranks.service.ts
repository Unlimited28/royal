import { Injectable } from '@nestjs/common';
import { OFFICIAL_RANKS } from '@constants';

@Injectable()
export class RanksService {
  findAll() {
    return OFFICIAL_RANKS;
  }
}
