import { tool } from 'ai';
import { z } from 'zod';

/**
 * Retrieves the current weather data for a location using the Open-Meteo API.
 * @function getWeather
 * @param {Object} params - Parameters for the weather fetch.
 * @param {number} params.latitude - The latitude of the location.
 * @param {number} params.longitude - The longitude of the location.
 * @returns {Promise<Object>} The weather data.
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
