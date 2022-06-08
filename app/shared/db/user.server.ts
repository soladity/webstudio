import { User } from "@prisma/client";
import { GitHubProfile } from "remix-auth-github";
import { prisma } from "./prisma.server";

export const createOrLoginWithGithub = async (
  profile: GitHubProfile
): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { email: profile._json.email },
  });

  if (user) {
    return user;
  }

  const newUser = prisma.user.create({
    data: {
      email: profile._json.email,
      username: profile.displayName,
      image: profile._json.avatar_url,
      provider: profile.provider,
    },
  });

  return newUser;
};
