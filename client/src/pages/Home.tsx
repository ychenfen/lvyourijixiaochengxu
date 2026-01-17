import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { 
  MapPin, 
  BookOpen, 
  Cloud, 
  Compass, 
  Plus, 
  ChevronRight,
  User,
  Settings,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Image as ImageIcon,
  Calendar
} from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: weatherData } = trpc.weather.current.useQuery({});
  const { data: recentDiaries } = trpc.diary.recent.useQuery({ limit: 6 });

  const features = [
    {
      icon: BookOpen,
      title: "旅游日记",
      description: "记录每一段旅程的精彩瞬间",
      href: "/diaries",
      color: "bg-teal-500",
    },
    {
      icon: MapPin,
      title: "足迹地图",
      description: "在地图上展示你的旅行轨迹",
      href: "/footprints",
      color: "bg-orange-500",
    },
    {
      icon: Cloud,
      title: "天气查询",
      description: "实时查看目的地天气信息",
      href: "/weather",
      color: "bg-sky-500",
    },
    {
      icon: Compass,
      title: "附近推荐",
      description: "发现周边高评价商户",
      href: "/nearby",
      color: "bg-purple-500",
    },
  ];

  const getWeatherIcon = (weather: string) => {
    if (weather.includes('晴')) return Sun;
    if (weather.includes('雨')) return CloudRain;
    return Cloud;
  };

  const WeatherIcon = weatherData ? getWeatherIcon(weatherData.weather) : Cloud;

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg travel-gradient flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">旅游日记</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/diaries" className="text-muted-foreground hover:text-foreground transition-colors">
              我的日记
            </Link>
            <Link href="/footprints" className="text-muted-foreground hover:text-foreground transition-colors">
              足迹地图
            </Link>
            <Link href="/weather" className="text-muted-foreground hover:text-foreground transition-colors">
              天气
            </Link>
            <Link href="/nearby" className="text-muted-foreground hover:text-foreground transition-colors">
              附近
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      管理后台
                    </Button>
                  </Link>
                )}
                <Link href="/profile">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user?.name || '用户'}</span>
                  </div>
                </Link>
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <Button>登录</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero区域 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 travel-gradient opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="container relative py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                记录每一段旅程
                <br />
                <span className="text-white/90">留住美好回忆</span>
              </h1>
              <p className="text-lg text-white/80 mb-8">
                用文字和图片记录旅途中的点点滴滴，在地图上留下你的足迹，
                随时查看天气和周边推荐，让每一次旅行都更加精彩。
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Link href="/diaries/new">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                      <Plus className="w-5 h-5 mr-2" />
                      写日记
                    </Button>
                  </Link>
                ) : (
                  <a href={getLoginUrl()}>
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                      开始记录
                    </Button>
                  </a>
                )}
                <Link href="/footprints">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    查看足迹
                  </Button>
                </Link>
              </div>
            </div>

            {/* 天气卡片 */}
            {weatherData && (
              <div className="hidden lg:block">
                <Card className="bg-white/95 backdrop-blur shadow-2xl max-w-sm ml-auto">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{weatherData.city}</span>
                      <span className="text-xs text-muted-foreground ml-auto">实时天气</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-5xl font-light text-foreground">
                          {weatherData.temperature}
                        </div>
                        <div className="text-lg text-muted-foreground mt-1">
                          {weatherData.weather}
                        </div>
                      </div>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                        <WeatherIcon className="w-10 h-10 text-sky-500" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                      <div className="text-center">
                        <Thermometer className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                        <p className="text-xs text-muted-foreground">体感</p>
                        <p className="text-sm font-medium">{weatherData.feelsLike || weatherData.temperature}</p>
                      </div>
                      <div className="text-center">
                        <Cloud className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                        <p className="text-xs text-muted-foreground">湿度</p>
                        <p className="text-sm font-medium">{weatherData.humidity}</p>
                      </div>
                      <div className="text-center">
                        <Wind className="w-4 h-4 mx-auto text-gray-500 mb-1" />
                        <p className="text-xs text-muted-foreground">风速</p>
                        <p className="text-sm font-medium">{weatherData.wind}</p>
                      </div>
                    </div>
                    <Link href="/weather">
                      <Button variant="ghost" className="w-full mt-4" size="sm">
                        查看详细天气
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 移动端天气卡片 */}
      {weatherData && (
        <section className="container -mt-6 relative z-10 lg:hidden">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                    <WeatherIcon className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{weatherData.city}</p>
                    <p className="text-2xl font-bold">{weatherData.temperature}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{weatherData.weather}</p>
                  <p className="text-sm text-muted-foreground">湿度 {weatherData.humidity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 功能入口 */}
      <section className="container py-16">
        <h2 className="text-2xl font-bold mb-8">探索功能</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link key={feature.href} href={feature.href}>
              <Card className="h-full card-hover cursor-pointer group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {feature.title}
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 最新日记 */}
      {recentDiaries && recentDiaries.length > 0 && (
        <section className="container pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">最新日记</h2>
            <Link href="/diaries">
              <Button variant="ghost">
                查看更多
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentDiaries.map((diary: any) => (
              <Link key={diary.id} href={`/diaries/${diary.id}`}>
                <Card className="h-full card-hover cursor-pointer overflow-hidden">
                  {diary.coverImage ? (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={diary.coverImage} 
                        alt={diary.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-1 mb-2">{diary.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {diary.summary || diary.content?.substring(0, 100)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{diary.user?.name || '匿名用户'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(diary.createdAt), 'MM-dd', { locale: zhCN })}</span>
                      </div>
                    </div>
                    {diary.locationName && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                        <MapPin className="w-3 h-3" />
                        <span>{diary.locationName}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 快速开始 */}
      {!isAuthenticated && (
        <section className="container pb-16">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-0">
            <CardContent className="p-8 md:p-12">
              <div className="max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">开始你的旅行日记</h2>
                <p className="text-muted-foreground mb-6">
                  登录后即可创建日记、记录足迹、查看个性化推荐。
                  让我们一起记录生活中的每一次精彩旅程！
                </p>
                <a href={getLoginUrl()}>
                  <Button size="lg">
                    立即登录
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 页脚 */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded travel-gradient flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">旅游日记系统</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 旅游日记系统 - 记录每一段旅程
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
