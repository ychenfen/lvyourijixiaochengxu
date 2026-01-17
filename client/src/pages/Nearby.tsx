import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { 
  ChevronLeft,
  MapPin, 
  Star,
  Phone,
  Navigation,
  Utensils,
  Hotel,
  Landmark,
  Loader2,
  LocateFixed,
  ExternalLink,
  Clock,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

type Category = 'all' | 'restaurant' | 'hotel' | 'attraction';

interface Place {
  id: string;
  name: string;
  category: Category;
  rating: number;
  userRatingsTotal: number;
  distance: string;
  address: string;
  phone?: string;
  location: { lat: number; lng: number };
  photoUrl?: string;
  isOpen?: boolean;
  priceLevel?: number;
  description?: string;
}

// 模拟数据 - 真实项目中可接入高德/腾讯地图API
const mockPlaces: Place[] = [
  // 餐厅
  {
    id: 'r1',
    name: '老北京炸酱面',
    category: 'restaurant',
    rating: 4.8,
    userRatingsTotal: 2356,
    distance: '500m',
    address: '北京市东城区王府井大街138号',
    phone: '010-65288888',
    location: { lat: 39.9142, lng: 116.4174 },
    photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    isOpen: true,
    priceLevel: 2,
    description: '正宗老北京风味，传承百年手艺'
  },
  {
    id: 'r2',
    name: '全聚德烤鸭店',
    category: 'restaurant',
    rating: 4.7,
    userRatingsTotal: 5621,
    distance: '800m',
    address: '北京市东城区前门大街30号',
    phone: '010-67011379',
    location: { lat: 39.8992, lng: 116.3974 },
    photoUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    isOpen: true,
    priceLevel: 3,
    description: '百年老字号，北京烤鸭代表'
  },
  {
    id: 'r3',
    name: '海底捞火锅',
    category: 'restaurant',
    rating: 4.6,
    userRatingsTotal: 3892,
    distance: '1.2km',
    address: '北京市朝阳区三里屯路19号',
    phone: '010-64178899',
    location: { lat: 39.9342, lng: 116.4574 },
    photoUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    isOpen: true,
    priceLevel: 3,
    description: '服务一流的连锁火锅品牌'
  },
  {
    id: 'r4',
    name: '南门涮肉',
    category: 'restaurant',
    rating: 4.5,
    userRatingsTotal: 1876,
    distance: '1.5km',
    address: '北京市西城区南礼士路66号',
    phone: '010-68021234',
    location: { lat: 39.9042, lng: 116.3574 },
    photoUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    isOpen: false,
    priceLevel: 2,
    description: '地道北京铜锅涮肉'
  },
  // 酒店
  {
    id: 'h1',
    name: '北京王府井希尔顿酒店',
    category: 'hotel',
    rating: 4.9,
    userRatingsTotal: 1256,
    distance: '600m',
    address: '北京市东城区王府井东街8号',
    phone: '010-65188888',
    location: { lat: 39.9162, lng: 116.4194 },
    photoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    isOpen: true,
    priceLevel: 4,
    description: '五星级豪华酒店，地理位置优越'
  },
  {
    id: 'h2',
    name: '北京饭店',
    category: 'hotel',
    rating: 4.8,
    userRatingsTotal: 2134,
    distance: '900m',
    address: '北京市东城区东长安街33号',
    phone: '010-65137766',
    location: { lat: 39.9082, lng: 116.4094 },
    photoUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
    isOpen: true,
    priceLevel: 4,
    description: '历史悠久的国宾馆级酒店'
  },
  {
    id: 'h3',
    name: '如家快捷酒店',
    category: 'hotel',
    rating: 4.2,
    userRatingsTotal: 856,
    distance: '400m',
    address: '北京市东城区灯市口大街57号',
    phone: '010-65129999',
    location: { lat: 39.9122, lng: 116.4134 },
    photoUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
    isOpen: true,
    priceLevel: 1,
    description: '经济实惠，干净舒适'
  },
  // 景点
  {
    id: 'a1',
    name: '故宫博物院',
    category: 'attraction',
    rating: 4.9,
    userRatingsTotal: 125678,
    distance: '1.0km',
    address: '北京市东城区景山前街4号',
    phone: '010-85007421',
    location: { lat: 39.9163, lng: 116.3972 },
    photoUrl: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=400',
    isOpen: true,
    priceLevel: 2,
    description: '世界文化遗产，明清皇家宫殿'
  },
  {
    id: 'a2',
    name: '天安门广场',
    category: 'attraction',
    rating: 4.8,
    userRatingsTotal: 98765,
    distance: '1.2km',
    address: '北京市东城区东长安街',
    location: { lat: 39.9054, lng: 116.3976 },
    photoUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400',
    isOpen: true,
    priceLevel: 0,
    description: '世界最大的城市广场'
  },
  {
    id: 'a3',
    name: '景山公园',
    category: 'attraction',
    rating: 4.7,
    userRatingsTotal: 34521,
    distance: '800m',
    address: '北京市西城区景山西街44号',
    phone: '010-64038098',
    location: { lat: 39.9263, lng: 116.3972 },
    photoUrl: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=400',
    isOpen: true,
    priceLevel: 1,
    description: '俯瞰故宫全景的最佳位置'
  },
  {
    id: 'a4',
    name: '北海公园',
    category: 'attraction',
    rating: 4.6,
    userRatingsTotal: 28934,
    distance: '1.5km',
    address: '北京市西城区文津街1号',
    phone: '010-64033225',
    location: { lat: 39.9263, lng: 116.3872 },
    photoUrl: 'https://images.unsplash.com/photo-1569144157591-c60f3f82f137?w=400',
    isOpen: true,
    priceLevel: 1,
    description: '皇家园林，白塔倒影'
  }
];

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container flex items-center h-14">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80">
          <ChevronLeft className="w-5 h-5" />
          <span>返回首页</span>
        </Link>
      </div>
    </header>
  );
}

export default function Nearby() {
  const [category, setCategory] = useState<Category>('all');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 获取当前位置 - 直接使用默认位置避免地理位置权限问题
  useEffect(() => {
    // 直接设置默认位置（北京），避免浏览器权限弹窗
    setLocation({ lat: 39.9042, lng: 116.4074 });
    setLoadingLocation(false);
    
    // 如果需要真实位置，可以取消下面的注释
    // if (navigator.geolocation) {
    //   navigator.geolocation.getCurrentPosition(
    //     (position) => {
    //       setLocation({
    //         lat: position.coords.latitude,
    //         lng: position.coords.longitude,
    //       });
    //       setLoadingLocation(false);
    //     },
    //     () => {
    //       setLocation({ lat: 39.9042, lng: 116.4074 });
    //       setLoadingLocation(false);
    //     }
    //   );
    // }
  }, []);

  // 根据分类筛选地点
  useEffect(() => {
    if (!location) return;
    
    setIsLoading(true);
    
    // 模拟API请求延迟
    setTimeout(() => {
      let filtered = mockPlaces;
      if (category !== 'all') {
        filtered = mockPlaces.filter(p => p.category === category);
      }
      // 按评分排序
      filtered.sort((a, b) => b.rating - a.rating);
      setPlaces(filtered);
      setIsLoading(false);
    }, 500);
  }, [location, category]);

  const refreshLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoadingLocation(false);
          toast.success("位置已更新");
        },
        () => {
          setLoadingLocation(false);
          toast.error("无法获取位置");
        }
      );
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'restaurant': return Utensils;
      case 'hotel': return Hotel;
      case 'attraction': return Landmark;
      default: return MapPin;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'restaurant': return '餐厅';
      case 'hotel': return '酒店';
      case 'attraction': return '景点';
      default: return '商户';
    }
  };

  const getPriceLabel = (level?: number) => {
    if (level === undefined) return '';
    return '¥'.repeat(level || 1);
  };

  const openInMaps = (place: Place) => {
    // 使用高德地图导航
    const url = `https://uri.amap.com/marker?position=${place.location.lng},${place.location.lat}&name=${encodeURIComponent(place.name)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">附近推荐</h1>
            <p className="text-muted-foreground text-sm">发现周边高评价商户</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <LocateFixed className="w-4 h-4 mr-1" />
            )}
            刷新位置
          </Button>
        </div>

        {/* 分类标签 */}
        <Tabs value={category} onValueChange={(v) => setCategory(v as Category)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="restaurant">
              <Utensils className="w-4 h-4 mr-1" />
              餐厅
            </TabsTrigger>
            <TabsTrigger value="hotel">
              <Hotel className="w-4 h-4 mr-1" />
              酒店
            </TabsTrigger>
            <TabsTrigger value="attraction">
              <Landmark className="w-4 h-4 mr-1" />
              景点
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 商户列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place) => {
              const CategoryIcon = getCategoryIcon(place.category);
              return (
                <Card key={place.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* 图片 */}
                  <div className="relative h-48 bg-muted">
                    {place.photoUrl ? (
                      <img 
                        src={place.photoUrl} 
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CategoryIcon className="w-16 h-16 text-muted-foreground/50" />
                      </div>
                    )}
                    {/* 分类标签 */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs rounded-full flex items-center gap-1">
                        <CategoryIcon className="w-3 h-3" />
                        {getCategoryLabel(place.category)}
                      </span>
                    </div>
                    {/* 营业状态 */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                        place.isOpen 
                          ? 'bg-green-500/90 text-white' 
                          : 'bg-gray-500/90 text-white'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {place.isOpen ? '营业中' : '已打烊'}
                      </span>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    {/* 名称和评分 */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{place.name}</h3>
                      <div className="flex items-center gap-1 text-amber-500 shrink-0 ml-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{place.rating}</span>
                        <span className="text-xs text-muted-foreground">({place.userRatingsTotal})</span>
                      </div>
                    </div>
                    
                    {/* 描述 */}
                    {place.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                        {place.description}
                      </p>
                    )}
                    
                    {/* 距离和价格 */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {place.distance}
                      </span>
                      {place.priceLevel !== undefined && place.priceLevel > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <DollarSign className="w-4 h-4" />
                          {getPriceLabel(place.priceLevel)}
                        </span>
                      )}
                    </div>
                    
                    {/* 地址 */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
                      {place.address}
                    </p>
                    
                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      {place.phone && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(`tel:${place.phone}`, '_self')}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          电话
                        </Button>
                      )}
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openInMaps(place)}
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        导航
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && places.length === 0 && (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">暂无推荐商户</p>
          </div>
        )}

        {/* 提示信息 */}
        <Card className="mt-8 bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-amber-800 mb-2">温馨提示</h4>
            <p className="text-sm text-amber-700">
              推荐数据仅供参考，评分和营业状态可能会有变化。建议出行前确认具体信息，点击"导航"可在地图中查看详细路线。
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
