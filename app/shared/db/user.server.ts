import { User } from "@prisma/client";
import { GitHubProfile } from "remix-auth-github";
import { GoogleProfile } from "remix-auth-google";
import { prisma } from "./prisma.server";

export const createDemoUser = async (userId: string) => {
  await prisma.team.create({
    data: {
      users: {
        create: {
          id: userId,
        },
      },
    },
  });
};

const genericCreateAccount = async (
  userData: {
    email: string;
    username: string;
    image: string;
    provider: string;
  },
  userId: string
): Promise<User> => {
  const existingUserWithId = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (existingUserWithId) {
    const connectedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: userData,
    });

    if (connectedUser.teamId) {
      return connectedUser;
    }

    await prisma.team.create({
      data: {
        users: {
          connect: {
            id: connectedUser.id,
          },
        },
      },
    });

    return connectedUser;
  }

  const existingUserWithEmail = await prisma.user.findUnique({
    where: {
      email: userData.email,
    },
  });

  if (existingUserWithEmail) {
    if (existingUserWithEmail.teamId) {
      return existingUserWithEmail;
    }
    await prisma.team.create({
      data: {
        users: {
          connect: {
            id: existingUserWithEmail.id,
          },
        },
      },
    });

    return existingUserWithEmail;
  }

  const newTeam = await prisma.team.create({
    data: {
      users: {
        create: {
          id: userId,
          ...userData,
        },
      },
    },
    include: {
      users: {
        where: {
          id: userId,
        },
      },
    },
  });

  return newTeam.users[0];
};

export const createOrLoginWithGithub = async (
  profile: GitHubProfile,
  userId: string
): Promise<User> => {
  const userData = {
    email: profile._json.email,
    username: profile.displayName,
    image: profile._json.avatar_url,
    provider: profile.provider,
  };
  const newUser = await genericCreateAccount(userData, userId);
  return newUser;
};

export const createOrLoginWithGoogle = async (
  profile: GoogleProfile,
  userId: string
): Promise<User> => {
  const userData = {
    email: profile._json.email,
    username: profile.displayName,
    image: profile._json.picture,
    provider: profile.provider,
  };
  const newUser = await genericCreateAccount(userData, userId);
  return newUser;
};

export const createOrLoginWithDev = async (userId: string): Promise<User> => {
  const userData = {
    email: "hello@webstudio.is",
    username: "admin",
    image: "",
    provider: "dev",
  };

  const newUser = await genericCreateAccount(userData, userId);
  return newUser;
};
