import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageSquare, Plus, Edit, Trash2, ArrowLeft, Reply } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./CommunityForum.css";

interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  content: string;
  user_id: string;
  created_at: string;
}

const CommunityForum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [commentData, setCommentData] = useState({
    content: "",
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    // Hardcoded posts for demonstration
    const hardcodedPosts: Post[] = [
      {
        id: "1",
        title: "گندم کی فصل کی دیکھ بھال کے بارے میں تجاویز",
        content: "گندم کی فصل کی کامیابی کے لیے مناسب وقت پر پانی دینا اور کیڑوں سے حفاظت ضروری ہے۔ میں نے اس سال گندم کی فصل میں بہت اچھے نتائج دیکھے ہیں۔",
        user_id: "user1",
        created_at: "2024-11-04T10:00:00Z",
        updated_at: "2024-11-04T10:00:00Z"
      },
      {
        id: "2",
        title: "سبزیوں کی فصل میں آلی کھاد کا استعمال",
        content: "آلی کھاد استعمال کرنے سے سبزیوں کا ذائقہ اور معیار بہتر ہوتا ہے۔ میں نے دیکھا ہے کہ کیمیکل کھادوں کے مقابلے میں آلی کھاد سے حاصل ہونے والی سبزیاں زیادہ صحت مند ہوتی ہیں۔",
        user_id: "user2",
        created_at: "2024-11-03T15:30:00Z",
        updated_at: "2024-11-03T15:30:00Z"
      },
      {
        id: "3",
        title: "موسمی بارشوں کا کسانوں پر اثر",
        content: "اس سال موسمی بارشیں کافی تاخیر سے آئی ہیں جس سے فصلوں کو نقصان پہنچا ہے۔ ایسے حالات میں کسانوں کو اپنی حکمت عملی تبدیل کرنی چاہیے۔",
        user_id: "user3",
        created_at: "2024-11-02T09:15:00Z",
        updated_at: "2024-11-02T09:15:00Z"
      },
      {
        id: "4",
        title: "نئی ٹیکنالوجی کا استعمال زراعت میں",
        content: "ڈرون اور جدید آلات کا استعمال کر کے ہم فصلوں کی نگرانی بہتر کر سکتے ہیں۔ یہ ٹیکنالوجی نہ صرف وقت بچاتی ہے بلکہ پیداوار بھی بڑھاتی ہے۔",
        user_id: "user4",
        created_at: "2024-11-01T14:20:00Z",
        updated_at: "2024-11-01T14:20:00Z"
      }
    ];

    setPosts(hardcodedPosts);
    setLoading(false);
  };

  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error("تبصروں حاصل کرنے میں خرابی");
    } else {
      setComments(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingPost) {
      const { error } = await supabase
        .from('forum_posts')
        .update({
          title: formData.title,
          content: formData.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingPost.id);

      if (error) {
        toast.error("پوسٹ اپ ڈیٹ کرنے میں خرابی");
      } else {
        toast.success("پوسٹ کامیابی سے اپ ڈیٹ ہو گئی");
        fetchPosts();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          title: formData.title,
          content: formData.content,
          user_id: user.id,
        });

      if (error) {
        toast.error("پوسٹ بنانے میں خرابی");
      } else {
        toast.success("پوسٹ کامیابی سے بنائی گئی");
        fetchPosts();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('forum_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("پوسٹ حذف کرنے میں خرابی");
    } else {
      toast.success("پوسٹ کامیابی سے حذف ہو گئی");
      fetchPosts();
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPost) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: selectedPost.id,
        content: commentData.content,
        user_id: user.id,
      });

    if (error) {
      toast.error("تبصرہ بنانے میں خرابی");
    } else {
      toast.success("تبصرہ کامیابی سے شامل ہو گیا");
      fetchComments(selectedPost.id);
      setCommentData({ content: "" });
      setCommentDialogOpen(false);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
    });
    setDialogOpen(true);
  };

  const handleViewComments = (post: Post) => {
    setSelectedPost(post);
    fetchComments(post.id);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
    });
    setEditingPost(null);
    setDialogOpen(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 noto-nastaliq-urdu">
        <header className="border-b bg-card">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <h1 className="text-2xl font-bold noto-nastaliq-urdu">کسان کمیونٹی فورم</h1>
            <Button variant="outline" onClick={() => navigate('/farmer')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              واپس
            </Button>
          </div>
        </header>

        <main className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="noto-nastaliq-urdu">کسان کمیونٹی</CardTitle>
                  <p className="text-sm text-muted-foreground noto-nastaliq-urdu">اپنے تجربات شیئر کریں اور دوسروں سے سیکھیں</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      نئی پوسٹ
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingPost ? "پوسٹ میں ترمیم" : "نئی پوسٹ بنائیں"}</DialogTitle>
                      <DialogDescription>
                        اپنے خیالات اور تجربات شیئر کریں
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">عنوان</label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="content" className="text-sm font-medium">مواد</label>
                        <Textarea
                          id="content"
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={resetForm}>
                          منسوخ
                        </Button>
                        <Button type="submit">
                          {editingPost ? "اپ ڈیٹ" : "پوسٹ"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">لوڈ ہو رہا ہے...</div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 noto-nastaliq-urdu">{post.title}</h3>
                          <p className="text-muted-foreground mb-3 noto-nastaliq-urdu">{post.content}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{new Date(post.created_at).toLocaleDateString('ur-PK')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewComments(post)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            تبصرے
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {selectedPost?.id === post.id && (
                        <div className="mt-4 border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">تبصرے</h4>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedPost(post);
                                setCommentDialogOpen(true);
                              }}
                            >
                              <Reply className="h-4 w-4 mr-1" />
                              تبصرہ شامل کریں
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {comments.map((comment) => (
                              <div key={comment.id} className="bg-muted p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(comment.created_at).toLocaleDateString('ur-PK')}
                                  </span>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تبصرہ شامل کریں</DialogTitle>
                <DialogDescription>
                  {selectedPost?.title} پر اپنا تبصرہ شیئر کریں
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="comment" className="text-sm font-medium">تبصرہ</label>
                  <Textarea
                    id="comment"
                    value={commentData.content}
                    onChange={(e) => setCommentData({ content: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCommentDialogOpen(false)}>
                    منسوخ
                  </Button>
                  <Button type="submit">
                    تبصرہ شامل کریں
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </AuthGuard>
  );
};

export default CommunityForum;
