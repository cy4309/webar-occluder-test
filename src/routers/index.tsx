type IRouter = {
  index: string;
  home: string;
  error: string;
};

export const router_path: IRouter = {
  index: "/",
  home: "/home",
  error: "*",
};
