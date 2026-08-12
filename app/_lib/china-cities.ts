export type CityGroup = { region: string; cities: string[] };

export const POPULAR_CITIES = ["北京", "上海", "广州", "深圳", "杭州", "成都", "重庆", "武汉", "南京", "西安", "苏州", "长沙"];

export const CITY_GROUPS: CityGroup[] = [
  { region: "华北", cities: ["北京", "天津", "石家庄", "太原", "呼和浩特"] },
  { region: "东北", cities: ["沈阳", "大连", "长春", "哈尔滨"] },
  { region: "华东", cities: ["上海", "南京", "苏州", "无锡", "常州", "南通", "杭州", "宁波", "温州", "嘉兴", "合肥", "福州", "厦门", "济南", "青岛", "烟台", "威海", "南昌"] },
  { region: "华中", cities: ["郑州", "洛阳", "武汉", "长沙"] },
  { region: "华南", cities: ["广州", "深圳", "佛山", "东莞", "珠海", "惠州", "南宁", "海口", "三亚"] },
  { region: "西南", cities: ["重庆", "成都", "贵阳", "昆明", "拉萨"] },
  { region: "西北", cities: ["西安", "兰州", "西宁", "银川", "乌鲁木齐"] },
  { region: "港澳台", cities: ["香港", "澳门", "台北"] },
];

type CityPoint = { city: string; latitude: number; longitude: number };

const CITY_POINTS: CityPoint[] = [
  { city: "北京", latitude: 39.9042, longitude: 116.4074 },
  { city: "天津", latitude: 39.3434, longitude: 117.3616 },
  { city: "石家庄", latitude: 38.0428, longitude: 114.5149 },
  { city: "太原", latitude: 37.8706, longitude: 112.5489 },
  { city: "呼和浩特", latitude: 40.8426, longitude: 111.7492 },
  { city: "沈阳", latitude: 41.8057, longitude: 123.4315 },
  { city: "大连", latitude: 38.914, longitude: 121.6147 },
  { city: "长春", latitude: 43.8171, longitude: 125.3235 },
  { city: "哈尔滨", latitude: 45.8038, longitude: 126.535 },
  { city: "上海", latitude: 31.2304, longitude: 121.4737 },
  { city: "南京", latitude: 32.0603, longitude: 118.7969 },
  { city: "苏州", latitude: 31.2989, longitude: 120.5853 },
  { city: "无锡", latitude: 31.4912, longitude: 120.3119 },
  { city: "常州", latitude: 31.8107, longitude: 119.9741 },
  { city: "南通", latitude: 31.9802, longitude: 120.8943 },
  { city: "杭州", latitude: 30.2741, longitude: 120.1551 },
  { city: "宁波", latitude: 29.8683, longitude: 121.544 },
  { city: "温州", latitude: 27.9949, longitude: 120.6994 },
  { city: "嘉兴", latitude: 30.7461, longitude: 120.7555 },
  { city: "合肥", latitude: 31.8206, longitude: 117.2272 },
  { city: "福州", latitude: 26.0745, longitude: 119.2965 },
  { city: "厦门", latitude: 24.4798, longitude: 118.0894 },
  { city: "济南", latitude: 36.6512, longitude: 117.1201 },
  { city: "青岛", latitude: 36.0671, longitude: 120.3826 },
  { city: "烟台", latitude: 37.4638, longitude: 121.4479 },
  { city: "威海", latitude: 37.5131, longitude: 122.1204 },
  { city: "南昌", latitude: 28.682, longitude: 115.8579 },
  { city: "郑州", latitude: 34.7466, longitude: 113.6254 },
  { city: "洛阳", latitude: 34.6197, longitude: 112.454 },
  { city: "武汉", latitude: 30.5928, longitude: 114.3055 },
  { city: "长沙", latitude: 28.2282, longitude: 112.9388 },
  { city: "广州", latitude: 23.1291, longitude: 113.2644 },
  { city: "深圳", latitude: 22.5431, longitude: 114.0579 },
  { city: "佛山", latitude: 23.0218, longitude: 113.1219 },
  { city: "东莞", latitude: 23.0207, longitude: 113.7518 },
  { city: "珠海", latitude: 22.2707, longitude: 113.5767 },
  { city: "惠州", latitude: 23.1115, longitude: 114.4168 },
  { city: "南宁", latitude: 22.817, longitude: 108.3665 },
  { city: "海口", latitude: 20.044, longitude: 110.1999 },
  { city: "三亚", latitude: 18.2528, longitude: 109.5119 },
  { city: "重庆", latitude: 29.563, longitude: 106.5516 },
  { city: "成都", latitude: 30.5728, longitude: 104.0668 },
  { city: "贵阳", latitude: 26.647, longitude: 106.6302 },
  { city: "昆明", latitude: 25.0389, longitude: 102.7183 },
  { city: "拉萨", latitude: 29.652, longitude: 91.1721 },
  { city: "西安", latitude: 34.3416, longitude: 108.9398 },
  { city: "兰州", latitude: 36.0611, longitude: 103.8343 },
  { city: "西宁", latitude: 36.6171, longitude: 101.7782 },
  { city: "银川", latitude: 38.4872, longitude: 106.2309 },
  { city: "乌鲁木齐", latitude: 43.8256, longitude: 87.6168 },
  { city: "香港", latitude: 22.3193, longitude: 114.1694 },
  { city: "澳门", latitude: 22.1987, longitude: 113.5439 },
  { city: "台北", latitude: 25.033, longitude: 121.5654 },
];

const ENGLISH_CITY_ALIASES: Record<string, string> = {
  beijing: "北京", shanghai: "上海", guangzhou: "广州", shenzhen: "深圳", chengdu: "成都",
  chongqing: "重庆", hangzhou: "杭州", wuhan: "武汉", nanjing: "南京", xian: "西安",
  "xi'an": "西安", suzhou: "苏州", changsha: "长沙", tianjin: "天津", qingdao: "青岛",
  xiamen: "厦门", fuzhou: "福州", kunming: "昆明", hongkong: "香港", "hong kong": "香港",
  macau: "澳门", taipei: "台北",
};

export function normalizeChinaCity(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  const alias = ENGLISH_CITY_ALIASES[trimmed.toLowerCase()];
  if (alias) return alias;
  return trimmed
    .replace(/特别行政区$/u, "")
    .replace(/自治州$/u, "")
    .replace(/地区$/u, "")
    .replace(/市$/u, "")
    .slice(0, 18);
}

export function nearestChinaCity(latitude: number, longitude: number) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return "";
  if (latitude < 17 || latitude > 54 || longitude < 73 || longitude > 135) return "";
  const longitudeScale = Math.cos(latitude * Math.PI / 180);
  let best = CITY_POINTS[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const point of CITY_POINTS) {
    const latitudeDelta = point.latitude - latitude;
    const longitudeDelta = (point.longitude - longitude) * longitudeScale;
    const distance = latitudeDelta * latitudeDelta + longitudeDelta * longitudeDelta;
    if (distance < bestDistance) {
      best = point;
      bestDistance = distance;
    }
  }
  return best.city;
}
