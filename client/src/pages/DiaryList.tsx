import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { 
  Plus, 
  MapPin, 
  Calendar,
  ChevronLeft,
  BookOpen,
  Loader2,
  ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function DiaryList() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data, isLoading, error } = trpc.diary.list.useQuery(
    { page: 1, pageSize: 20 },
    { enabled: isAuthenticated }
  );

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
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">请先登录</h2>
          <p className="text-muted-foreground mb-6">登录后即可查看和管理你的旅游日记</p>
          <a href={getLoginUrl()}>
            <Button size="lg">立即登录</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">我的日记</h1>
            <p className="text-muted-foreground">共 {data?.total || 0} 篇日记</p>
          </div>
          <Link href="/diaries/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              写日记
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : data?.diaries.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">还没有日记</h2>
            <p className="text-muted-foreground mb-6">开始记录你的第一篇旅游日记吧</p>
            <Link href="/diaries/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                写日记
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.diaries.map((diary) => (
              <Link key={diary.id} href={`/diaries/${diary.id}`}>
                <Card className="h-full card-hover cursor-pointer overflow-hidden">
                  {diary.coverImage ? (
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={diary.coverImage} 
                        alt={diary.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{diary.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {diary.summary || diary.content.substring(0, 100)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(diary.createdAt), 'yyyy-MM-dd', { locale: zhCN })}
                      </span>
                      {diary.locationName && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {diary.locationName}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
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
