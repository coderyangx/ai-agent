// eslint-disable
import {
  getWeather,
  getMultipleCitiesWeather,
  formatWeatherInfo,
  formatMultipleWeatherInfo,
} from './weather-tool';

// 单个城市天气查询工具配置
export const weatherTool = {
  type: 'function',
  parameters: {
    type: 'object',
    required: ['city'],
    properties: {
      city: {
        type: 'string',
        description: '要查询天气的城市名称，例如：北京、上海、广州等',
      },
    },
  },
};

// 多个城市天气查询工具配置
export const multipleWeatherTool = {
  type: 'function' as const,
  function: {
    name: 'getMultipleCitiesWeather',
    description: '同时查询多个城市的当前天气情况，用逗号分隔城市名称',
    parameters: {
      type: 'object' as const,
      required: ['cities'],
      properties: {
        cities: {
          type: 'string' as const,
          description: '要查询天气的多个城市名称，用逗号分隔，例如：北京,上海,广州',
        },
      },
    },
  },
};

// 工具执行函数
export async function executeWeatherTool(name: string, args: any): Promise<string> {
  try {
    if (name === 'getWeather') {
      const { city } = args;
      if (!city || typeof city !== 'string') {
        return '请提供有效的城市名称。';
      }

      const weather = await getWeather(city);
      return formatWeatherInfo(weather);
    }

    if (name === 'getMultipleCitiesWeather') {
      const { cities } = args;
      if (!cities || typeof cities !== 'string') {
        return '请提供有效的城市名称列表。';
      }

      const cityList = cities
        .split(',')
        .map((city: string) => city.trim())
        .filter(Boolean);
      if (cityList.length === 0) {
        return '请提供至少一个有效的城市名称。';
      }

      const weathers = await getMultipleCitiesWeather(cityList);
      return formatMultipleWeatherInfo(weathers);
    }

    return `未知的工具：${name}`;
  } catch (error) {
    console.error('天气工具执行失败:', error);
    return '天气查询服务暂时不可用，请稍后再试。';
  }
}

// 所有可用工具的列表
export const availableTools = [weatherTool, multipleWeatherTool];

// 工具名称映射
export const toolNames = {
  getWeather: 'getWeather',
  getMultipleCitiesWeather: 'getMultipleCitiesWeather',
} as const;

export type ToolName = (typeof toolNames)[keyof typeof toolNames];
