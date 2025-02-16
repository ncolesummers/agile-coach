/**
 * Provides a tool to retrieve current weather data using the Open-Meteo API.
 * @module ai/tools/get-weather
 * @packageDocumentation
 */

import { tool } from 'ai';
import { z } from 'zod';

/**
 * Retrieves the current weather data for a location based on latitude and longitude.
 * @param params - Contains latitude and longitude values.
 * @returns An object containing weather data from the Open-Meteo API.
 * @throws When the network fetch fails.
 * @example
 * const weather = await getWeather.execute({ latitude: 40.7128, longitude: -74.0060 });
 * @see /lib/ai/models.ts
 */
export const getWeather = tool({
  description: 'Get the current weather at a location',
  parameters: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  execute: async ({ latitude, longitude }) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
    );

    const weatherData = await response.json();
    return weatherData;
  },
});
