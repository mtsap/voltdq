import { format } from "date-fns";
import {
  fetchIntervalConsumptionData,
  calculateTotalConsumption,
} from "./consumption";
import {
  calculateCarbonEmissions,
  fetchCarbonIntensityData,
} from "./carbonIntensity";
import {
  fetchGenerationMixData,
  calculateConsumptionMix,
} from "./generationMixData";

const meterId = "6514167223e3d1424bf82742";
const startDate = new Date("2023-01-01T00:00Z");
const endDate = new Date("2023-02-01T00:00Z");

Promise.all([
  fetchIntervalConsumptionData(meterId, "hh", startDate, endDate),
  fetchCarbonIntensityData(startDate, endDate),
  fetchGenerationMixData(startDate, endDate),
])
  .then(([consumption, carbonIntensity, generationMixData]) => {
    const totalConsumption = calculateTotalConsumption(consumption);
    const carbonEmissions = calculateCarbonEmissions(
      consumption,
      carbonIntensity,
    );
    const monthlyGenerationMix = calculateConsumptionMix(
      consumption,
      generationMixData,
    );
    console.log(`Total Consumption:\t${totalConsumption} KWh`);
    console.log(`Carbon Emissions:\t${carbonEmissions} KgCO2`);
    console.log(`Generation Mix Used:`);

    console.log(
      `From: ${format(monthlyGenerationMix.from, "yyyy-MM-dd")} To: ${format(
        monthlyGenerationMix.to,
        "yyyy-MM-dd",
      )}`,
    );

    monthlyGenerationMix.generationmix.map((obj) =>
      console.log(
        `Fuel: ${obj.fuel}\tConsumption: ${obj.consumption.toFixed(
          3,
        )} KWh\tPerc: ${((obj.consumption * 100) / totalConsumption).toFixed(
          2,
        )}%`,
      ),
    );
  })
  .catch(console.error);
