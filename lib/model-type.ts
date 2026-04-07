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

// export type PrDetailProps = {
//   Dtm: Date | null;
//   DtmSubmit: Date | null;
//   Status: StatusPrPo;

//   DtmResponse2: Date | null;
//   DtmResponse3: Date | null;
//   DtmResponse4: Date | null;

//   Remark: string;
//   Remark2: string;
//   Remark3: string;
//   Remark4: string;

//   TotalAmount: number;

//   User1: string;
//   User1Email: string;
//   User1Name: string;

//   Approvers: ApproverLevel[];
// };
