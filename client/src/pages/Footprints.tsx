import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { 
  ChevronLeft,
  MapPin, 
  Calendar,
  Loader2,
  Map as MapIcon,
  Navigation,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { MapView } from "@/components/Map";
import { useState, useCallback, useRef, useEffect } from "react";

export default function Footprints() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: footprints, isLoading } = trpc.diary.footprints.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const [selectedFootprint, setSelectedFootprint] = useState<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // 清除所有标记
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];
  }, []);

  // 创建自定义标记内容
  const createMarkerContent = (isSelected: boolean, coverImage?: string | null) => {
    const div = document.createElement('div');
    div.className = `relative cursor-pointer transition-transform ${isSelected ? 'scale-125 z-10' : 'hover:scale-110'}`;
    
    if (coverImage) {
      div.innerHTML = `
        <div class="w-10 h-10 rounded-full border-3 ${isSelected ? 'border-orange-500' : 'border-teal-500'} overflow-hidden shadow-lg bg-white">
          <img src="${coverImage}" class="w-full h-full object-cover" />
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent ${isSelected ? 'border-t-orange-500' : 'border-t-teal-500'}"></div>
      `;
    } else {
      div.innerHTML = `
        <div class="w-10 h-10 rounded-full ${isSelected ? 'bg-orange-500' : 'bg-teal-500'} flex items-center justify-center shadow-lg">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent ${isSelected ? 'border-t-orange-500' : 'border-t-teal-500'}"></div>
      `;
    }
    
    return div;
  };

  // 渲染标记
  const renderMarkers = useCallback(() => {
    if (!mapRef.current || !footprints || footprints.length === 0) return;
    
    clearMarkers();
    
    const bounds = new google.maps.LatLngBounds();
    
    footprints.forEach((fp) => {
      if (fp.latitude && fp.longitude) {
        const position = {
          lat: Number(fp.latitude),
          lng: Number(fp.longitude),
        };
        
        const marker = new google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current!,
          position,
          title: fp.title,
          content: createMarkerContent(selectedFootprint === fp.id, fp.coverImage),
        });
        
        marker.addListener('click', () => {
          setSelectedFootprint(fp.id);
          
          // 显示信息窗口
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }
          
          infoWindowRef.current = new google.maps.InfoWindow({
            content: `
              <div class="p-2 min-w-[200px]">
                <h4 class="font-semibold text-sm mb-1">${fp.title}</h4>
                <p class="text-xs text-gray-500">${fp.locationName || '未知位置'}</p>
                <p class="text-xs text-gray-400 mt-1">${format(new Date(fp.createdAt), 'yyyy-MM-dd')}</p>
              </div>
            `,
          });
          
          infoWindowRef.current.open(mapRef.current!, marker);
        });
        
        markersRef.current.push(marker);
        bounds.extend(position);
      }
    });
    
    if (markersRef.current.length > 0) {
      mapRef.current.fitBounds(bounds);
      // 如果只有一个点，设置合适的缩放级别
      if (markersRef.current.length === 1) {
        setTimeout(() => {
          mapRef.current?.setZoom(12);
        }, 100);
      }
    }
  }, [footprints, selectedFootprint, clearMarkers]);

  // 地图准备就绪
  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    renderMarkers();
  }, [renderMarkers]);

  // 当足迹数据或选中状态变化时重新渲染
  useEffect(() => {
    if (mapRef.current && footprints) {
      renderMarkers();
    }
  }, [footprints, selectedFootprint, renderMarkers]);

  // 点击列表项时定位到地图
  const handleFootprintClick = (fp: typeof footprints extends (infer T)[] | undefined ? T : never) => {
    if (!fp) return;
    setSelectedFootprint(fp.id);
    if (mapRef.current && fp.latitude && fp.longitude) {
      mapRef.current.panTo({
        lat: Number(fp.latitude),
        lng: Number(fp.longitude),
      });
      mapRef.current.setZoom(14);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <MapIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">请先登录</h2>
          <p className="text-muted-foreground mb-6">登录后即可查看你的旅行足迹</p>
          <a href={getLoginUrl()}>
            <Button size="lg">立即登录</Button>
          </a>
        </div>
      </div>
    );
  }

  const selectedData = footprints?.find(fp => fp.id === selectedFootprint);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">我的足迹</h1>
            <p className="text-muted-foreground">
              共 {footprints?.length || 0} 个足迹点，记录你走过的每一个地方
            </p>
          </div>
          <Link href="/diaries/new">
            <Button>
              <MapPin className="w-4 h-4 mr-2" />
              添加足迹
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !footprints || footprints.length === 0 ? (
          <div className="text-center py-20">
            <MapIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">还没有足迹</h2>
            <p className="text-muted-foreground mb-6">
              在日记中添加位置信息，就能在这里看到你的旅行足迹
            </p>
            <Link href="/diaries/new">
              <Button>写日记</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 地图区域 */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="h-[500px]">
                  <MapView
                    onMapReady={handleMapReady}
                    initialCenter={
                      footprints[0]?.latitude && footprints[0]?.longitude
                        ? {
                            lat: Number(footprints[0].latitude),
                            lng: Number(footprints[0].longitude),
                          }
                        : { lat: 35.8617, lng: 104.1954 } // 中国中心
                    }
                    initialZoom={4}
                    className="h-full"
                  />
                </div>
              </Card>
              
              {/* 统计信息 */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{footprints.length}</div>
                    <p className="text-sm text-muted-foreground">足迹总数</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {new Set(footprints.map(fp => fp.locationName).filter(Boolean)).size}
                    </div>
                    <p className="text-sm text-muted-foreground">到访城市</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-teal-500">
                      {footprints.filter(fp => fp.coverImage).length}
                    </div>
                    <p className="text-sm text-muted-foreground">有照片</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 足迹列表 */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                足迹列表
              </h3>
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-2">
                {footprints.map((fp) => (
                  <Card
                    key={fp.id}
                    className={`cursor-pointer transition-all ${
                      selectedFootprint === fp.id
                        ? 'ring-2 ring-primary shadow-md'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleFootprintClick(fp)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {fp.coverImage ? (
                          <img
                            src={fp.coverImage}
                            alt={fp.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{fp.title}</h4>
                          <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {fp.locationName || '未知位置'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(fp.createdAt), 'yyyy-MM-dd', { locale: zhCN })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 选中足迹详情 */}
        {selectedData && (
          <Card className="mt-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {selectedData.coverImage && (
                    <img
                      src={selectedData.coverImage}
                      alt={selectedData.title}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{selectedData.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-primary" />
                        {selectedData.locationName || '未知位置'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(selectedData.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      坐标：{selectedData.latitude}, {selectedData.longitude}
                    </p>
                  </div>
                </div>
                <Link href={`/diaries/${selectedData.id}`}>
                  <Button>
                    查看日记
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 提示信息 */}
        <Card className="mt-6 bg-accent/30 border-0">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">温馨提示</h3>
            <p className="text-sm text-muted-foreground">
              点击地图上的标记或列表中的足迹卡片，可以查看详细信息。
              在写日记时添加位置信息，你的足迹就会自动显示在这里。
              继续记录你的旅程，让足迹遍布更多地方！
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
