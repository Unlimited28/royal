import { NestFactory } from '@nestjs/core';
import { SeedModule } from './database/seed/seed.module';
import { SeedService } from './database/seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedService = app.get(SeedService);

  try {
    console.log('Starting database seeding...');
    await seedService.seed();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
