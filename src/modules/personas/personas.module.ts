import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { PersonasController } from './personas.controller';

@Module({
  imports:     [AuthModule],
  controllers: [PersonasController],
})
export class PersonasModule {}
