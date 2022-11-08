import { FastifyInstance } from "fastify";
import { request } from "http";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { Authenticate } from "../plugins/Authenticate";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/me",
    {
      onRequest: [Authenticate],
    },
    async (request) => {
      await request.jwtVerify();

      return { user: request.user };
    }
  );

  fastify.post("/users", async (request) => {
    const createUserBody = z.object({
      access_token: z.string(),
    });
    const { access_token } = createUserBody.parse(request.body);

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const userData = await userResponse.json();

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    });

    const userinfo = userInfoSchema.parse(userData);

    let user = await prisma.user.findUnique({
      where: {
        googleId: userinfo.id,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userinfo.id,
          name: userinfo.name,
          email: userinfo.email,
          avatarUrl: userinfo.picture,
        },
      });
    }

    const token = fastify.jwt.sign(
      {
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        sub: user.id,
        expiresIn: "7 days",
      }
    );

    return { token };
  });
}
