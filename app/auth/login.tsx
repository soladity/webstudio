import { LinksFunction, MetaFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";

import { Card, Flex, Heading, Text, TextField } from "~/shared/design-system";
import interStyles from "~/shared/font-faces/inter.css";

import { GithubIcon, CommitIcon } from "~/shared/icons";
import { LoginButton } from "./components/login-button";
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

export const Login = ({ errorMessage }: { errorMessage: string }) => {
  const [isDevLogin, setIsDevLogin] = useState(false);
  const loaderData = useLoaderData();

  return (
    <Flex
      css={{ height: "100vh" }}
      direction="column"
      align="center"
      justify="center"
    >
      <Card css={{ width: 200, padding: "$5" }} variant="active">
        <Flex direction="column" gap="2" align="center">
          <Heading>Login</Heading>
          {errorMessage.length ? (
            <Text css={{ textAlign: "center" }} variant="red">
              {errorMessage}
            </Text>
          ) : null}
          <Flex gap="2" direction="column" align="center">
            <Form action="/auth/github" method="post">
              <LoginButton>
                <Flex gap="1">
                  <GithubIcon width="16" />
                  Login with GitHub
                </Flex>
              </LoginButton>
            </Form>
            {/* <Form action="/auth/google" method="post">
              <LoginButton>
                <Flex gap="1">
                  <GoogleIcon width="16" />
                  Login with Google
                </Flex>
              </LoginButton>
            </Form> */}
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
                      placeholder="Place your auth secret here"
                    />
                  </Form>
                ) : (
                  <LoginButton isDevLogin onClick={() => setIsDevLogin(true)}>
                    <Flex gap="1" align="center">
                      <CommitIcon></CommitIcon>
                      Dev Login
                    </Flex>
                  </LoginButton>
                )}
              </>
            )}
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};
