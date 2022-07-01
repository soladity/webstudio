import { LinksFunction, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import React, { useState } from "react";
import env from "~/shared/env";
import {
  Button,
  Card,
  Flex,
  Heading,
  TextField,
  Tooltip,
} from "~/shared/design-system";
import interStyles from "~/shared/font-faces/inter.css";

import { GoogleIcon, GithubIcon, CommitIcon } from "~/shared/icons";
import loginStyles from "./login.css";

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: interStyles,
    },
    {
      rel: "stylesheet",
      href: loginStyles,
    },
  ];
};

export const meta: MetaFunction = () => {
  return { title: "Webstudio Login" };
};
const isPreviewDeployment = env?.VERCEL_ENV !== "preview";

const WrapperDisabledTooltip = ({
  children,
  isPreview,
}: {
  children: React.ReactElement;
  isPreview: boolean;
}) =>
  isPreview ? (
    <Tooltip
      content="Github login does not work in preview deployments"
      delayDuration={0}
    >
      <span tabIndex={0}>{children}</span>
    </Tooltip>
  ) : (
    children
  );

export const Login = () => {
  const [isDevLogin, setIsDevLogin] = useState(false);
  const loaderData = useLoaderData();

  return (
    <Flex
      css={{ height: "100vh" }}
      direction="column"
      align="center"
      justify="center"
    >
      <Card css={{ width: "$10", padding: "$5", zoom: 1.4 }} variant="active">
        <Flex direction="column" gap="2" align="center">
          <Heading>Login</Heading>

          <Flex gap="2" direction="column" align="center">
            <Form action="/auth/github" method="post">
              <WrapperDisabledTooltip isPreview={isPreviewDeployment}>
                <Button type="submit" disabled={isPreviewDeployment}>
                  <Flex gap="1">
                    <GithubIcon width="16" />
                    Login with GitHub
                  </Flex>
                </Button>
              </WrapperDisabledTooltip>
            </Form>
            <Form action="/auth/google" method="post">
              <Button type="submit" disabled>
                <Flex gap="1">
                  <GoogleIcon width="16" />
                  Login with Google
                </Flex>
              </Button>
            </Form>
            {loaderData.devLogin && (
              <>
                {isDevLogin ? (
                  <Form action="/auth/dev" method="post">
                    <TextField
                      css={{ width: "100%", flexGrow: 1 }}
                      name="secret"
                      type="text"
                      minLength={2}
                      required
                      autoFocus
                      placeholder="Place your AUTH_SECRET"
                    />
                  </Form>
                ) : (
                  <Button
                    onClick={() => setIsDevLogin(true)}
                    css={{ width: "100%" }}
                  >
                    <Flex gap="1" align="center">
                      <CommitIcon></CommitIcon>
                      Dev Login
                    </Flex>
                  </Button>
                )}
              </>
            )}
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};
