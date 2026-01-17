import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { 
  ChevronLeft,
  User,
  BookOpen,
  MapPin,
  Calendar,
  LogOut,
  Settings,
  ChevronRight,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

export default function Profile() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: diaryData } = trpc.diary.list.useQuery(
    { page: 1, pageSize: 100 },
    { enabled: isAuthenticated }
  );
  
  const { data: footprints } = trpc.diary.footprints.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("已退出登录");
      navigate("/");
    } catch (error) {
      toast.error("退出失败");
    }
  };

  if (loading) {
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
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">请先登录</h2>
          <p className="text-muted-foreground mb-6">登录后查看个人信息</p>
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
      
      <main className="container py-8 max-w-2xl">
        {/* 用户信息卡片 */}
        <Card className="mb-6 overflow-hidden">
          <div className="travel-gradient p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name || '用户'} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name || '旅行者'}</h1>
                <p className="opacity-80">{user?.email || '未设置邮箱'}</p>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                加入时间：{user?.createdAt ? format(new Date(user.createdAt), 'yyyy年MM月dd日', { locale: zhCN }) : '未知'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 统计数据 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">{diaryData?.total || 0}</div>
              <p className="text-sm text-muted-foreground">篇日记</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <div className="text-2xl font-bold">{footprints?.length || 0}</div>
              <p className="text-sm text-muted-foreground">个足迹</p>
            </CardContent>
          </Card>
        </div>

        {/* 功能菜单 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">功能</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Link href="/diaries">
              <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>我的日记</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/footprints">
              <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span>我的足迹</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin">
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span>管理后台</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* 退出登录 */}
        <Button 
          variant="outline" 
          className="w-full text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          退出登录
        </Button>
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
