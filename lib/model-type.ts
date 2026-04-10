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

  BpUserId: number;
  Username: string;
  Fullname: string;
  Role: string;
  RoleId: number;
  Email: string;
};

export type StatusPrPo = "" | "APPROVED" | "REJECTED";

export type ApproverLevel = {
  Level: number;
  UserId: number;
  UserApproved: boolean;
  UserName: string;
  UserResponse: StatusPrPo;
  DtmResponse: Date | null;
  Remark?: string;
};

export type PrProps = {
  Id: number;
  PrNo: string;

  DtmSubmit: Date | null;
  User1Name: string;

  Status: StatusPrPo;
  Remark: string;

  Approvers: ApproverLevel[];
  AssignLevel?: number;
  ItemDetails?: PrDetailProps[];
};

export type PrDetailProps = {
  Id: number;
  LastStock: number;
  ProductId: number;
  Quantity: number;
  UnitPrice: number;

  MeasurementName: string;
  Merk: string;
  ProductName: string;
  Remark: string;
  SKU: string;
};

export type CheckAprLevelProps = {
  show: boolean;
  msg: string | null;
};

export type PrPoDetailPageProps = {
  id: string;
  doc_num: string;
};
