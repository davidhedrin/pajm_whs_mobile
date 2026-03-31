export type ResponsiveScale = {
  rw: (size: number) => number;
  rh: (size: number) => number;
  rpm: (size: number) => number;
  rf: (size: number) => number;
};

export type ApiResponse<T> = {
  Status: number;
  Success: boolean;
  Message: string;
  Data?: T;
  TotalRecord?: number;
};

export type UserAuthData = {
  Token: string;
  ExpiredAt: string;

  Username: string;
  Fullname: string;
  Role: string;
  RoleId: number;
  Email: string;
};

export type StatusPrPo = "" | "APPROVED" | "REJECTED";

export type ApproverLevel = {
  Level: number;
  UserApproved: boolean;
  UserName: string;
  UserResponse: StatusPrPo;
  DtmResponse: Date | null;
};

export type PrProps = {
  Id: number;
  PrNo: string;

  DtmSubmit: Date | null;
  User1Name: string;

  Status: StatusPrPo;
  Approvers: ApproverLevel[];
};
