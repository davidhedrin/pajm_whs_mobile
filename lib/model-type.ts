export type ApiResponse<T> = {
  Status: number;
  Success: boolean;
  Message: string;
  Data?: T;
};

export type UserAuthData = {
  Token: string;
  ExpiredAt: string;

  Username: string;
  Fullname: string;
  Role: string;
  RoleId: number;
};
