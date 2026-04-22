export const sistemOrgList = ["PAJM", "LCS"] as const;
export type SistemOrg = (typeof sistemOrgList)[number];

export type ResponsiveScale = {
  rw: (size: number) => number;
  rh: (size: number) => number;
  rpm: (size: number) => number;
  rf: (size: number) => number;
};

export type SortFilterProps = {
  key: string;
  dir: string;
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
  Org: SistemOrg;
};

export type SourceStatisPrPo = "PR" | "PO";
export type StatisticProps = {
  Source: SourceStatisPrPo;
  Waiting: number;
  TotalData: number;
  OnProgress: number;
  Finish: number;
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

export type PoProps = {
  Id: number;
  PoNo: string;
  PrNo: string;

  SubmitDtm: Date | null;
  User1Name: string;

  Status: StatusPrPo;
  Remark: string;

  SupplierName: string;
  ShipToName: string;
  DeliveryTime: string;
  CostCenterName: string;
  SubCostCenterName: string;

  Approvers: ApproverLevel[];
  AssignLevel?: number;
  ItemDetails?: PoDetailProps[];
};

export type PoDetailProps = {
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

export type PrPoActionProps = {
  action: "APPROVED" | "REJECTED";
  doc_id: number;
  level: number;
  remark: string;
};
