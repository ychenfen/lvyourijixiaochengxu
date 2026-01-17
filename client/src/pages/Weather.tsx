import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { 
  ChevronLeft,
  Cloud, 
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Search,
  MapPin,
  RefreshCw,
  Loader2,
  Thermometer,
  CloudFog,
  CloudLightning,
  Umbrella
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function Weather() {
  const [city, setCity] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // 获取用户位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // 默认北京
          setUserLocation({ lat: 39.9042, lng: 116.4074 });
        }
      );
    }
  }, []);
  
  const { data: currentWeather, isLoading, refetch } = trpc.weather.current.useQuery({
    city: searchCity || undefined,
    latitude: !searchCity ? userLocation?.lat : undefined,
    longitude: !searchCity ? userLocation?.lng : undefined,
  }, {
    enabled: !!userLocation || !!searchCity,
  });

  const { data: forecastData } = trpc.weather.forecast.useQuery({
    latitude: currentWeather?.latitude || userLocation?.lat || 39.9042,
    longitude: currentWeather?.longitude || userLocation?.lng || 116.4074,
  }, {
    enabled: !!(currentWeather?.latitude || userLocation),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchCity(city);
  };

  const getWeatherIcon = (weatherCode: number) => {
    if (weatherCode === 0 || weatherCode === 1) return Sun;
    if (weatherCode >= 2 && weatherCode <= 3) return Cloud;
    if (weatherCode >= 45 && weatherCode <= 48) return CloudFog;
    if (weatherCode >= 51 && weatherCode <= 67) return CloudRain;
    if (weatherCode >= 71 && weatherCode <= 77) return CloudSnow;
    if (weatherCode >= 80 && weatherCode <= 82) return Umbrella;
    if (weatherCode >= 95) return CloudLightning;
    return Cloud;
  };

  const getWeatherBg = (weatherCode: number) => {
    if (weatherCode === 0 || weatherCode === 1) return 'from-blue-400 to-cyan-300';
    if (weatherCode >= 2 && weatherCode <= 3) return 'from-gray-400 to-gray-300';
    if (weatherCode >= 45 && weatherCode <= 48) return 'from-gray-500 to-gray-400';
    if (weatherCode >= 51 && weatherCode <= 82) return 'from-blue-600 to-blue-400';
    if (weatherCode >= 95) return 'from-purple-600 to-purple-400';
    return 'from-teal-500 to-cyan-400';
  };

  const WeatherIcon = currentWeather?.weatherCode !== undefined 
    ? getWeatherIcon(currentWeather.weatherCode) 
    : Cloud;

  const weatherBg = currentWeather?.weatherCode !== undefined
    ? getWeatherBg(currentWeather.weatherCode)
    : 'from-teal-500 to-cyan-400';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <h1 className="text-2xl font-bold mb-8">天气查询</h1>

        {/* 搜索框 */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="输入城市名称查询天气（如：北京、上海、杭州）"
                  className="pl-10"
                />
              </div>
              <Button type="submit">查询</Button>
            </form>
          </CardContent>
        </Card>

        {/* 天气展示 */}
        {isLoading || !userLocation ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : currentWeather ? (
          <div className="space-y-6">
            {/* 主天气卡片 */}
            <Card className="overflow-hidden">
              <div className={`bg-gradient-to-br ${weatherBg} p-8 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{currentWeather.city}</span>
                    </div>
                    <div className="text-6xl font-light mb-2">
                      {currentWeather.temperature}
                    </div>
                    <div className="text-xl opacity-90">
                      {currentWeather.weather}
                    </div>
                    <div className="text-sm opacity-75 mt-1">
                      体感温度 {currentWeather.feelsLike}
                    </div>
                  </div>
                  <div className="text-right">
                    <WeatherIcon className="w-24 h-24 opacity-80" />
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    更新时间：{currentWeather.updateTime ? format(new Date(currentWeather.updateTime), 'yyyy-MM-dd HH:mm', { locale: zhCN }) : '--'}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    刷新
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 详细信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Droplets className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-semibold">{currentWeather.humidity}</div>
                  <p className="text-sm text-muted-foreground">湿度</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Wind className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                  <div className="text-2xl font-semibold">{currentWeather.wind}</div>
                  <p className="text-sm text-muted-foreground">风速</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Thermometer className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                  <div className="text-2xl font-semibold">{currentWeather.feelsLike}</div>
                  <p className="text-sm text-muted-foreground">体感温度</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Sun className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <div className="text-2xl font-semibold">{currentWeather.weatherCode}</div>
                  <p className="text-sm text-muted-foreground">天气代码</p>
                </CardContent>
              </Card>
            </div>

            {/* 7天预报 */}
            {forecastData?.forecasts && forecastData.forecasts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">7天天气预报</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {forecastData.forecasts.map((day: { date: string; weather: string; weatherCode: number; tempMax: string; tempMin: string; precipitationProbability: string }, index: number) => {
                      const DayIcon = getWeatherIcon(day.weatherCode);
                      const isToday = index === 0;
                      return (
                        <div 
                          key={day.date} 
                          className={`text-center p-3 rounded-lg ${isToday ? 'bg-primary/10' : 'bg-muted/50'}`}
                        >
                          <p className="text-xs text-muted-foreground mb-1">
                            {isToday ? '今天' : format(new Date(day.date), 'E', { locale: zhCN })}
                          </p>
                          <p className="text-xs mb-2">
                            {format(new Date(day.date), 'MM/dd')}
                          </p>
                          <DayIcon className="w-6 h-6 mx-auto mb-2 text-primary" />
                          <p className="text-xs font-medium">{day.weather}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {day.tempMin}~{day.tempMax}
                          </p>
                          <p className="text-xs text-blue-500 mt-1">
                            <Umbrella className="w-3 h-3 inline mr-0.5" />
                            {day.precipitationProbability}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <Cloud className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">暂无天气数据</h2>
            <p className="text-muted-foreground">请输入城市名称查询天气</p>
          </div>
        )}

        {/* 热门城市 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">热门城市</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '重庆', '南京', '武汉', '三亚', '丽江', '桂林', '厦门', '青岛'].map((c) => (
                <Button
                  key={c}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCity(c);
                    setSearchCity(c);
                  }}
                >
                  {c}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 旅行提示 */}
        <Card className="mt-6 bg-accent/30 border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">旅行小贴士</h3>
            <p className="text-sm text-muted-foreground">
              天气数据来源于Open-Meteo全球气象服务，每小时更新。出行前查看目的地天气，
              合理安排行程。建议携带雨具以备不时之需，注意防晒和保暖，让每一次旅行都舒适愉快！
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center h-14">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
          <span>返回首页</span>
        </Link>
      </div>
    </header>
  );
}
