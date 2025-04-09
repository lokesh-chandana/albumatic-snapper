
export type UserCredentials = {
  email: string;
  password: string;
};

export type SignUpData = UserCredentials & {
  name?: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
};
