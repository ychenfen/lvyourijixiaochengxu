import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { 
  ChevronLeft,
  MapPin, 
  Calendar,
  Cloud,
  Edit,
  Trash2,
  Loader2,
  User
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { toast } from "sonner";

export default function DiaryDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: diary, isLoading, error } = trpc.diary.get.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  const deleteMutation = trpc.diary.delete.useMutation({
    onSuccess: () => {
      toast.success("日记已删除");
      utils.diary.list.invalidate();
      navigate("/diaries");
    },
    onError: (error) => {
      toast.error(error.message || "删除失败");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !diary) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">日记不存在</h2>
          <p className="text-muted-foreground mb-6">该日记可能已被删除或不存在</p>
          <Link href="/diaries">
            <Button>返回日记列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = isAuthenticated && user?.id === diary.userId;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-3xl">
        {/* 标题区域 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{diary.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {diary.author && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {diary.author.name || '匿名用户'}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(diary.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
            </span>
            {diary.locationName && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {diary.locationName}
              </span>
            )}
            {diary.weather && (
              <span className="flex items-center gap-1">
                <Cloud className="w-4 h-4" />
                {diary.weather} {diary.temperature}
              </span>
            )}
          </div>

          {isOwner && (
            <div className="flex gap-2 mt-4">
              <Link href={`/diaries/${diary.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  编辑
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    删除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                    <AlertDialogDescription>
                      确定要删除这篇日记吗？此操作无法撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate({ id: diary.id })}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "删除"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* 封面图片 */}
        {diary.coverImage && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img 
              src={diary.coverImage} 
              alt={diary.title}
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        {/* 日记内容 */}
        <Card className="mb-8">
          <CardContent className="p-6 md:p-8">
            <div className="prose prose-slate max-w-none">
              {diary.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 图片展示 */}
        {diary.images && diary.images.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">相册</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {diary.images.map((image, index) => (
                <div key={image.id} className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={image.imageUrl} 
                    alt={`图片 ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 位置信息 */}
        {diary.latitude && diary.longitude && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium">{diary.locationName || '未知位置'}</span>
                <span className="text-muted-foreground">
                  ({diary.latitude}, {diary.longitude})
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center h-14">
        <Link href="/diaries" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
          <span>返回列表</span>
        </Link>
      </div>
    </header>
  );
}
