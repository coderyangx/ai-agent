// eslint-disable
import { z } from 'zod';

// 天气数据 schema
export const WeatherSchema = z.object({
  city: z.string().describe('城市名称'),
  temperature: z.number().describe('温度（摄氏度）'),
  description: z.string().describe('天气描述'),
  humidity: z.number().describe('湿度（百分比）'),
  windSpeed: z.number().describe('风速（米/秒）'),
  timestamp: z.string().describe('查询时间'),
});

export type Weather = z.infer<typeof WeatherSchema>;

// 模拟天气数据获取函数
// 在实际应用中，这里应该调用真实的天气API，如 OpenWeatherMap、和风天气等
export async function getWeather(city: string): Promise<Weather> {
  // 模拟API调用延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 模拟天气数据
  const weatherData: Record<string, Omit<Weather, 'city' | 'timestamp'>> = {
    北京: {
      temperature: Math.round((Math.random() * 20 + 10) * 10) / 10, // 10-30°C
      description: ['晴朗', '多云', '阴天', '小雨'][Math.floor(Math.random() * 4)],
      humidity: Math.round(Math.random() * 40 + 40), // 40-80%
      windSpeed: Math.round(Math.random() * 10 + 2), // 2-12 m/s
    },
    上海: {
      temperature: Math.round((Math.random() * 15 + 15) * 10) / 10, // 15-30°C
      description: ['晴朗', '多云', '小雨', '雷阵雨'][Math.floor(Math.random() * 4)],
      humidity: Math.round(Math.random() * 30 + 60), // 60-90%
      windSpeed: Math.round(Math.random() * 8 + 1), // 1-9 m/s
    },
    广州: {
      temperature: Math.round((Math.random() * 10 + 22) * 10) / 10, // 22-32°C
      description: ['晴朗', '多云', '雷阵雨', '大雨'][Math.floor(Math.random() * 4)],
      humidity: Math.round(Math.random() * 20 + 70), // 70-90%
      windSpeed: Math.round(Math.random() * 6 + 2), // 2-8 m/s
    },
    深圳: {
      temperature: Math.round((Math.random() * 10 + 23) * 10) / 10, // 23-33°C
      description: ['晴朗', '多云', '雷阵雨', '阵雨'][Math.floor(Math.random() * 4)],
      humidity: Math.round(Math.random() * 20 + 75), // 75-95%
      windSpeed: Math.round(Math.random() * 7 + 1), // 1-8 m/s
    },
    杭州: {
      temperature: Math.round((Math.random() * 15 + 12) * 10) / 10, // 12-27°C
      description: ['晴朗', '多云', '小雨', '阴天'][Math.floor(Math.random() * 4)],
      humidity: Math.round(Math.random() * 30 + 55), // 55-85%
      windSpeed: Math.round(Math.random() * 9 + 1), // 1-10 m/s
    },
    成都: {
      temperature: Math.round((Math.random() * 12 + 18) * 10) / 10, // 18-30°C
      description: ['多云', '阴天', '小雨', '晴朗'][Math.floor(Math.random() * 4)],
      humidity: Math.round(Math.random() * 25 + 65), // 65-90%
      windSpeed: Math.round(Math.random() * 5 + 1), // 1-6 m/s
    },
  };

  const defaultWeather = {
    temperature: Math.round((Math.random() * 20 + 10) * 10) / 10,
    description: ['晴朗', '多云', '阴天', '小雨'][Math.floor(Math.random() * 4)],
    humidity: Math.round(Math.random() * 40 + 40),
    windSpeed: Math.round(Math.random() * 10 + 2),
  };

  const weather = weatherData[city] || defaultWeather;

  return {
    city,
    ...weather,
    timestamp: new Date().toLocaleString('zh-CN'),
  };
}

// 获取多个城市天气
export async function getMultipleCitiesWeather(cities: string[]): Promise<Weather[]> {
  const weatherPromises = cities.map((city) => getWeather(city));
  return Promise.all(weatherPromises);
}

// 格式化天气信息为可读文本
export function formatWeatherInfo(weather: Weather): string {
  return `${weather.city}的天气情况：
🌡️ 温度：${weather.temperature}°C
☁️ 天气：${weather.description}
💧 湿度：${weather.humidity}%
💨 风速：${weather.windSpeed} m/s
🕒 查询时间：${weather.timestamp}`;
}

// 格式化多个城市天气信息
export function formatMultipleWeatherInfo(weathers: Weather[]): string {
  if (weathers.length === 0) {
    return '未找到相关城市的天气信息。';
  }

  if (weathers.length === 1) {
    return formatWeatherInfo(weathers[0]);
  }

  let result = '多个城市的天气情况：\n\n';
  weathers.forEach((weather, index) => {
    result += `${index + 1}. ${weather.city}：
`;
    result += `   🌡️ ${weather.temperature}°C，${weather.description}
`;
    result += `   💧 湿度${weather.humidity}%，💨 风速${weather.windSpeed}m/s

`;
  });
  result += `🕒 查询时间：${weathers[0].timestamp}`;

  return result;
}
