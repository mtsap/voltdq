import R from "ramda";
import { z } from "zod";
import { format } from "date-fns";

// TODO: this should be an ENV variable
const OPEN_VOLT_KEY = "test-Z9EB05N-07FMA5B-PYFEE46-X4ECYAR";

const IntervalConsumption = z.object({
  granularity: z.string(),
  startInterval: z.coerce.date(),
  endInterval: z.coerce.date(),
  data: z.array(
    z.object({
      start_interval: z.coerce.date(),
      meter_id: z.string(),
      meter_number: z.coerce.number(),
      customer_id: z.string(),
      consumption: z.coerce.number(),
      consumption_units: z.string(),
    }),
  ),
});

export type IntervalConsumption = z.infer<typeof IntervalConsumption>;
export type Granularity = "hh" | "day" | "week" | "month" | "year";

async function fetchIntervalConsumptionData(
  meterId: string,
  granularity: Granularity,
  start_date: Date,
  end_date: Date,
): Promise<IntervalConsumption> {
  const start = format(start_date, "yyyy-MM-dd");
  const end = format(end_date, "yyyy-MM-dd");
  const url = `https://api.openvolt.com/v1/interval-data?granularity=${granularity}&start_date=${start}&end_date=${end}&meter_id=${meterId}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json", "x-api-key": OPEN_VOLT_KEY },
  };

  return fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      const consumption = IntervalConsumption.parse(json);
      const result = { ...consumption, data: consumption.data.slice(0, -1) };
      return result;
    });
}

function calculateTotalConsumption(
  consumptionData: IntervalConsumption,
): number {
  return R.sum(consumptionData.data.map((obj) => obj.consumption));
}

export {
  IntervalConsumption,
  fetchIntervalConsumptionData,
  calculateTotalConsumption,
};
