import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  // Enable CORS for all routes
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'http://localhost:8082',
      'exp://10.250.3.69:8081',
      'https://recipe-rbjxsxw7y-harishs-projects-b0bf7a11.vercel.app',
       'https://recipe-hub-roan.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

 

  await app.listen(3000);
}
bootstrap();