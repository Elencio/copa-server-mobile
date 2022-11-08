import { FastifyRequest } from "fastify";

export async function Authenticate(request: FastifyRequest){
  await request.jwtVerify()
}