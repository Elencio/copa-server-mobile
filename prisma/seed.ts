import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john.doe@gmail.com",
      avatarUrl: "https://github.com//elencio.png",
    },
  });

  const model = await prisma.model.create({
    data: {
      title: "Example model",
      code: "Bol123",
      ownerId: user.id,

      participants: {
        create:{
          userId: user.id,
        }
      }
    },
  });

   await prisma.game.create({
    data:{
      date:'2022-11-04T15:00:00.201Z',
      firstTeamCountryCode: 'MZ',
       secondTeamCountryCode: 'BR',
    }
  });

  await prisma.game.create({
    data:{
      date:'2022-11-05T15:00:00.201Z',
      firstTeamCountryCode: 'DE',
       secondTeamCountryCode: 'AR',

       guesses:{
        create:{

          firstTeamPoints: 5,
          secondTeamPoints:3,

          participant: {
            connect: {
              userId_modelId:{
                userId: user.id,
                modelId: model.id,
              }
            }
          }
        }
       }
    },
  })
}

main()
