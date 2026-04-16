import { callApi } from "@/lib/api-fatch";
import { StatisticProps } from "@/lib/model-type";
import { create } from "zustand";

type StatisticState = {
  dataStPr: StatisticProps | null;
  dataStPo: StatisticProps | null;
  fetchStatistic: (bp_id: number) => Promise<void>;
};

export const useStatisticStore = create<StatisticState>((set, get) => ({
  dataStPr: null,
  dataStPo: null,
  fetchStatistic: async (bp_id: number) => {
    try {
      const res = await callApi<StatisticProps[]>({
        endpoint: "GetStatisticData",
        params: {
          bp_id,
        },
      });

      const allDatas: StatisticProps[] = res.Data ?? [];

      const findPr = allDatas.find((x) => x.Source === "PR");
      const findPo = allDatas.find((x) => x.Source === "PO");

      set({
        dataStPr: findPr ?? null,
        dataStPo: findPo ?? null,
      });
    } catch (e) {
      throw e;
    }
  },
}));
