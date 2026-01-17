import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link, useParams, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft,
  MapPin, 
  Cloud,
  Image as ImageIcon,
  X,
  Loader2,
  Upload
} from "lucide-react";
import { toast } from "sonner";

interface UploadedImage {
  imageUrl: string;
  fileKey: string;
}

export default function DiaryEdit() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!id;
  
  // 表单状态
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [weather, setWeather] = useState("");
  const [temperature, setTemperature] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [coverImage, setCoverImage] = useState("");
  const [uploading, setUploading] = useState(false);

  // 获取现有日记数据（编辑模式）
  const { data: existingDiary, isLoading: loadingDiary } = trpc.diary.get.useQuery(
    { id: Number(id) },
    { enabled: isEditing }
  );

  // 获取当前天气
  const { data: weatherData } = trpc.weather.current.useQuery({});

  // 图片上传
  const uploadMutation = trpc.upload.image.useMutation();

  // 创建日记
  const createMutation = trpc.diary.create.useMutation({
    onSuccess: (data) => {
      toast.success("日记发布成功");
      utils.diary.list.invalidate();
      navigate(`/diaries/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "发布失败");
    },
  });

  // 更新日记
  const updateMutation = trpc.diary.update.useMutation({
    onSuccess: () => {
      toast.success("日记更新成功");
      utils.diary.list.invalidate();
      utils.diary.get.invalidate({ id: Number(id) });
      navigate(`/diaries/${id}`);
    },
    onError: (error) => {
      toast.error(error.message || "更新失败");
    },
  });

  // 填充编辑数据
  useEffect(() => {
    if (existingDiary) {
      setTitle(existingDiary.title);
      setContent(existingDiary.content);
      setLocationName(existingDiary.locationName || "");
      setLatitude(existingDiary.latitude ? Number(existingDiary.latitude) : undefined);
      setLongitude(existingDiary.longitude ? Number(existingDiary.longitude) : undefined);
      setWeather(existingDiary.weather || "");
      setTemperature(existingDiary.temperature || "");
      setCoverImage(existingDiary.coverImage || "");
      if (existingDiary.images) {
        setImages(existingDiary.images.map(img => ({
          imageUrl: img.imageUrl,
          fileKey: img.fileKey,
        })));
      }
    }
  }, [existingDiary]);

  // 自动填充天气
  useEffect(() => {
    if (!isEditing && weatherData && !weather) {
      setWeather(weatherData.weather);
      setTemperature(weatherData.temperature);
    }
  }, [weatherData, isEditing, weather]);

  // 获取当前位置
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success("位置获取成功");
        },
        (error) => {
          toast.error("无法获取位置信息");
        }
      );
    } else {
      toast.error("浏览器不支持地理定位");
    }
  };

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`图片 ${file.name} 超过5MB限制`);
          continue;
        }

        const base64 = await fileToBase64(file);
        const result = await uploadMutation.mutateAsync({
          base64: base64.split(',')[1],
          filename: file.name,
          mimeType: file.type,
        });

        setImages(prev => [...prev, { imageUrl: result.url, fileKey: result.fileKey }]);
        
        // 如果没有封面图，设置第一张为封面
        if (!coverImage && images.length === 0) {
          setCoverImage(result.url);
        }
      }
      toast.success("图片上传成功");
    } catch (error) {
      toast.error("图片上传失败");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  // 移除图片
  const removeImage = (index: number) => {
    const removed = images[index];
    setImages(prev => prev.filter((_, i) => i !== index));
    if (coverImage === removed.imageUrl) {
      setCoverImage(images[0]?.imageUrl || "");
    }
  };

  // 设置封面
  const setAsCover = (url: string) => {
    setCoverImage(url);
    toast.success("已设为封面");
  };

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("请输入标题");
      return;
    }
    if (!content.trim()) {
      toast.error("请输入内容");
      return;
    }

    const data = {
      title: title.trim(),
      content: content.trim(),
      locationName: locationName.trim() || undefined,
      latitude,
      longitude,
      weather: weather || undefined,
      temperature: temperature || undefined,
      coverImage: coverImage || undefined,
      images: images.length > 0 ? images : undefined,
    };

    if (isEditing) {
      updateMutation.mutate({ id: Number(id), ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (authLoading || loadingDiary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header isEditing={isEditing} id={id} />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">请先登录</h2>
          <p className="text-muted-foreground mb-6">登录后即可创建旅游日记</p>
          <a href={getLoginUrl()}>
            <Button size="lg">立即登录</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isEditing={isEditing} id={id} />
      
      <main className="container py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-8">
          {isEditing ? "编辑日记" : "写日记"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给这篇日记起个标题"
              maxLength={200}
            />
          </div>

          {/* 内容 */}
          <div className="space-y-2">
            <Label htmlFor="content">内容 *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="记录你的旅途故事..."
              className="min-h-[300px] resize-y"
            />
          </div>

          {/* 图片上传 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                添加图片
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img
                      src={img.imageUrl}
                      alt={`图片 ${index + 1}`}
                      className={`w-full h-full object-cover rounded-lg ${
                        coverImage === img.imageUrl ? 'ring-2 ring-primary' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setAsCover(img.imageUrl)}
                      >
                        封面
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    {coverImage === img.imageUrl && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                        封面
                      </span>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">上传图片</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                支持 JPG、PNG 格式，单张不超过 5MB
              </p>
            </CardContent>
          </Card>

          {/* 位置信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                位置信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locationName">地点名称</Label>
                <Input
                  id="locationName"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="如：北京故宫"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>经纬度</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="any"
                      value={latitude || ""}
                      onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="纬度"
                    />
                    <Input
                      type="number"
                      step="any"
                      value={longitude || ""}
                      onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="经度"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="outline" onClick={getCurrentLocation}>
                    获取当前位置
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 天气信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                天气信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="weather">天气</Label>
                  <Input
                    id="weather"
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    placeholder="如：晴"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="temperature">温度</Label>
                  <Input
                    id="temperature"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="如：25°C"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "保存中..." : "发布中..."}
                </>
              ) : (
                isEditing ? "保存修改" : "发布日记"
              )}
            </Button>
            <Link href={isEditing ? `/diaries/${id}` : "/diaries"}>
              <Button type="button" variant="outline">
                取消
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

function Header({ isEditing, id }: { isEditing: boolean; id?: string }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center h-14">
        <Link 
          href={isEditing ? `/diaries/${id}` : "/diaries"} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>返回</span>
        </Link>
      </div>
    </header>
  );
}
