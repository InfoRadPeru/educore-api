// Qué es: Módulo global que expone PrismaService a toda la app.
// Patrón: Singleton global con @Global().
// Por qué: Con @Global() no necesitas importar PrismaModule en cada módulo. Lo importas una vez en AppModule y está disponible en toda la app.

import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService],
  exports:   [PrismaService],
})
export class PrismaModule {}