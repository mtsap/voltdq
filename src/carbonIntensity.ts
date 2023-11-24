import { z } from "zod";
import { formatISO, add, isEqual } from "date-fns";
import { IntervalConsumption } from "./consumption";
import R from "ramda";

const CarbonIntensity = z.object({
  data: z.array(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
      intensity: z.object({
        forecast: z.coerce.number(),
        actual: z.coerce.number(),
        index: z.enum(["very low", "low", "moderate", "high", "very high"]),
      }),
    }),
  ),
});

export type CarbonIntensity = z.infer<typeof CarbonIntensity>;

async function fetchCarbonIntensityData(
  start_date: Date,
  end_date: Date,
): Promise<CarbonIntensity> {
  const start = formatISO(add(start_date, { minutes: 30 }));
  const end = formatISO(end_date);
  const url = `https://api.carbonintensity.org.uk/intensity/${start}/${end}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
  };

  return fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      return CarbonIntensity.parse(json);
    });
}

function calculateCarbonEmissions(
  consumption: IntervalConsumption,
  carbonIntensity: CarbonIntensity,
): number {
  if (consumption.data.length !== carbonIntensity.data.length) {
    throw new Error("Data length missmatch");
  }

  if (
    !isEqual(consumption.data[0].start_interval, carbonIntensity.data[0].from)
  ) {
    throw new Error("Data time intervals missmatch");
  }
  const consumptionValues = consumption.data.map((obj) => obj.consumption);
  const carbonValues = carbonIntensity.data.map((obj) => obj.intensity.actual);
  return R.sum(R.zipWith(R.multiply, consumptionValues, carbonValues)) / 1000;
}

export { CarbonIntensity, fetchCarbonIntensityData, calculateCarbonEmissions };
