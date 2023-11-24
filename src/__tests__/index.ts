import { calculateCarbonEmissions, CarbonIntensity } from "../carbonIntensity";
import { IntervalConsumption } from "../consumption";

test("Tests for calculateCarbonEmissions function", () => {
  const consumption: IntervalConsumption = {
    granularity: "hh",
    startInterval: new Date("2023-01-01"),
    endInterval: new Date("2023-01-01"),
    data: [
      {
        start_interval: new Date("2023-01-01T00:00Z"),
        meter_id: "999999",
        meter_number: 23232,
        customer_id: "asbs",
        consumption: 10,
        consumption_units: "KWh",
      },
      {
        start_interval: new Date("2023-01-01T00:30Z"),
        meter_id: "999999",
        meter_number: 23232,
        customer_id: "asbs",
        consumption: 20,
        consumption_units: "KWh",
      },
      {
        start_interval: new Date("2023-01-01T01:00Z"),
        meter_id: "999999",
        meter_number: 23232,
        customer_id: "asbs",
        consumption: 30,
        consumption_units: "KWh",
      },
    ],
  };

  const carbonIntensity: CarbonIntensity = {
    data: [
      {
        from: new Date("2023-01-01T00:00Z"),
        to: new Date("2023-01-01T00:30Z"),
        intensity: {
          index: "very low",
          forecast: 1,
          actual: 1,
        },
      },
      {
        from: new Date("2023-01-01T00:30Z"),
        to: new Date("2023-01-01T01:00Z"),
        intensity: {
          index: "very low",
          forecast: 2,
          actual: 2,
        },
      },
      {
        from: new Date("2023-01-01T01:00Z"),
        to: new Date("2023-01-01T01:30Z"),
        intensity: {
          index: "very low",
          forecast: 3,
          actual: 3,
        },
      },
    ],
  };

  const carbonIntensityA: CarbonIntensity = {
    data: [
      {
        from: new Date("2023-01-01T00:00Z"),
        to: new Date("2023-01-01T00:30Z"),
        intensity: {
          index: "very low",
          forecast: 1,
          actual: 1,
        },
      },
      {
        from: new Date("2023-01-01T00:30Z"),
        to: new Date("2023-01-01T01:00Z"),
        intensity: {
          index: "very low",
          forecast: 2,
          actual: 2,
        },
      },
    ],
  };

  const carbonIntensityB: CarbonIntensity = {
    data: [
      {
        from: new Date("2023-01-01T01:00Z"),
        to: new Date("2023-01-01T01:30Z"),
        intensity: {
          index: "very low",
          forecast: 1,
          actual: 1,
        },
      },
      {
        from: new Date("2023-01-01T01:30Z"),
        to: new Date("2023-01-01T02:00Z"),
        intensity: {
          index: "very low",
          forecast: 2,
          actual: 2,
        },
      },
      {
        from: new Date("2023-01-01T02:00Z"),
        to: new Date("2023-01-01T02:30Z"),
        intensity: {
          index: "very low",
          forecast: 3,
          actual: 3,
        },
      },
    ],
  };

  expect(calculateCarbonEmissions(consumption, carbonIntensity)).toBe(0.14);
  expect(() => calculateCarbonEmissions(consumption, carbonIntensityA)).toThrow(
    "Data length missmatch",
  );

  expect(() => calculateCarbonEmissions(consumption, carbonIntensityB)).toThrow(
    "Data time intervals missmatch",
  );
});
