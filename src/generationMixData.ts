import { z } from "zod";
import { formatISO, add, isEqual } from "date-fns";
import { IntervalConsumption } from "./consumption";
import R, { zipWith } from "ramda";

const Fuel = z.enum([
  "gas",
  "coal",
  "biomass",
  "nuclear",
  "hydro",
  "imports",
  "other",
  "wind",
  "solar",
]);

type Mix = {
  from: Date;
  to: Date;
  generationmix: {
    perc: number;
    fuel: Fuel;
  }[];
}[];

export type Fuel = z.infer<typeof Fuel>;

export type ConsumptionMix = {
  from: Date;
  to: Date;
  generationmix: {
    consumption: number;
    fuel: string;
  }[];
};

const Generation = z.object({
  data: z.array(
    z.object({
      from: z.coerce.date(),
      to: z.coerce.date(),
      generationmix: z.array(
        z.object({
          perc: z.coerce.number(),
          fuel: Fuel,
        }),
      ),
    }),
  ),
});

export type Generation = z.infer<typeof Generation>;

async function fetchGenerationMixData(
  start_date: Date,
  end_date: Date,
): Promise<Generation> {
  const start = formatISO(add(start_date, { minutes: 30 }));
  const end = formatISO(end_date);
  const url = `https://api.carbonintensity.org.uk/generation/${start}/${end}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json" },
  };

  return fetch(url, options)
    .then((res) => res.json())
    .then((json) => {
      return Generation.parse(json);
    });
}

// TODO: This part need definitly some clean up and more testing
function calculateMix(
  consumption: Array<{
    consumption: number;
    start_interval: Date;
  }>,
  mix: Mix,
) {
  if (consumption.length !== mix.length) {
    throw new Error("Data length missmatch");
  }
  if (!isEqual(consumption[0].start_interval, mix[0].from)) {
    throw new Error("Data time intervals missmatch");
  }

  const a = zipWith(
    (consumption, mix) => {
      return mix.generationmix.map((obj) => ({
        ...obj,
        consumption: (obj.perc / 100) * consumption.consumption,
      }));
    },
    consumption,
    mix,
  );
  const totalConsumptionPerFuel = a.reduce(
    (acc, curr) => {
      return R.zipWith(
        (a, b) => ({
          fuel: a.fuel,
          consumption: a.consumption + b.consumption,
        }),
        acc,
        curr,
      );
    },
    [
      { fuel: "biomass", consumption: 0 },
      { fuel: "coal", consumption: 0 },
      { fuel: "imports", consumption: 0 },
      { fuel: "gas", consumption: 0 },
      { fuel: "nuclear", consumption: 0 },
      { fuel: "other", consumption: 0 },
      { fuel: "hydro", consumption: 0 },
      { fuel: "solar", consumption: 0 },
      { fuel: "wind", consumption: 0 },
    ],
  );
  return totalConsumptionPerFuel;
}

function calculateConsumptionMix(
  consumptionData: IntervalConsumption,
  mixData: Generation,
): ConsumptionMix {
  const consumption = consumptionData.data.map((obj) => ({
    consumption: obj.consumption,
    start_interval: obj.start_interval,
  }));

  const mix = mixData.data.map((obj) => ({
    from: obj.from,
    to: obj.to,
    generationmix: obj.generationmix,
  }));

  const result = {
    from: mix[0].from,
    to: mix[mix.length - 1].to,
    generationmix: calculateMix(consumption, mix),
  };

  return result;
}

export { fetchGenerationMixData, calculateConsumptionMix };
