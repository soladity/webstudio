import { LoaderFunction } from "@remix-run/node";
import config from "~/config";
import { authenticator } from "~/services/auth.server";

export const loader: LoaderFunction = ({ request }) => {
  return authenticator.authenticate("github", request, {
    successRedirect: config.dashboardPath,
    failureRedirect: config.loginPath,
  });
};
