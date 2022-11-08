import { request } from 'http';
import { FastifyInstance } from 'fastify';
import {prisma} from '../lib/prisma'
import { Authenticate } from '../plugins/Authenticate';
import { z } from 'zod';

export async function guessRoutes(fastify: FastifyInstance){
  fastify.get("/guesses/count", async () => {
    const count = await prisma.guess.count();
    return { count };
  })

  fastify.post('/pools/:poolId/games/:gameId/guesses', {
    onRequest: [Authenticate]
  }, async (request, reply)=> {
    const createGuessParams =  z.object({
      modelId: z.string(),
      gameId: z.string(),
    })
    const createGuessBody = z.object({
      firstTeamPoints: z.number(),
      secondTeamPoints: z.number(),
    })

    const { modelId, gameId} = createGuessParams.parse(request.params)

    const { firstTeamPoints, secondTeamPoints} = createGuessBody.parse(request.body)
    const participant = await prisma.participant.findUnique({
      where:{
        userId_modelId: {
          modelId,
          userId: request.user.sub,
        }
      }
    })
  
     if(!participant){
      return reply.status(400).send({
        message: "You're not allowed to create a guess inside this Model/Pool"
      })
     }
  const guess =  await prisma.guess.findUnique({
    where:{
       participantId_gameId: {
        participantId: participant.id,
        gameId
       }
    }
  })

  if(guess){
    return reply.status(400).send({
      message: "You already sent a guess"
    })
  }
  const game = await prisma.game.findUnique({
    where:{
      id: gameId,

    }
  })

  if (!game){
    return reply.status(400).send({
      message: "Game not found"
  })
  }
 if (game.date < new Date()){
  return reply.status(400).send({
    message: "The Game was enrolled. You can't send a Guess",
})
 }
 await prisma.guess.create({
  data:{
    gameId,
    participantId: participant.id,
    firstTeamPoints,
    secondTeamPoints
  }
 })

return reply.status(201).send()
  } )
}