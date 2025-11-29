import { rootRoute } from "./__root";
import { aboutRoute } from "./about";
import { accountRoute } from "./account";
import { dataRoute } from "./data";
import { indexRoute } from "./home";
import { loginRoute } from "./login";
import { signupRoute } from "./signup";

export const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  dataRoute,
  loginRoute,
  signupRoute,
  accountRoute,
]);
