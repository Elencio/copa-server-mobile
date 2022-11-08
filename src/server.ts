import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { authRoutes } from "./routes/auth";
import { userRoutes } from "./routes/user";
import { poolRoutes } from "./routes/pool";
import { guessRoutes } from "./routes/guess";
import { gameRoutes } from "./routes/game";



async function bootstrap() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(jwt, {
    secret: 'NLWcopa',
  })

  await fastify.register(poolRoutes)
  await fastify.register(userRoutes)
  await fastify.register(guessRoutes)
  await fastify.register(gameRoutes)
  await fastify.register(authRoutes)
  

  await fastify.listen({ port: 3333 , host: '0.0.0.0'});
} 

bootstrap();
