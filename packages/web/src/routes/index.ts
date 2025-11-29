import { rootRoute } from "./__root";
import { aboutRoute } from "./about";
import { dataRoute } from "./data";
import { indexRoute } from "./home";

export const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, dataRoute]);

