import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="mb-6 text-5xl font-bold text-primary">
          خوشحال کھیت
        </h1>
        <p className="mb-8 text-xl text-muted-foreground leading-relaxed">
          پاکستانی کسانوں کے لیے جدید زرعی حل۔ مارکیٹ کی قیمتیں، موسم کی پیشین گوئیاں اور ذہین زرعی مشورے حاصل کریں۔
        </p>
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground">
            اپنے کھیت کی کامیابی کے لیے آج ہی شامل ہوں
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg px-8 py-3"
          >
            شامل ہوں
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">مارکیٹ کی قیمتیں</h3>
            <p className="text-sm text-muted-foreground">
              تازہ ترین سبزیوں اور پھلوں کی قیمتیں اور رجحانات
            </p>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">موسم کی معلومات</h3>
            <p className="text-sm text-muted-foreground">
              آپ کے علاقے کے موسم کی تفصیلی پیشین گوئیاں
            </p>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">ذہین مشورے</h3>
            <p className="text-sm text-muted-foreground">
              AI کی مدد سے ذاتی نوعیت کے زرعی مشورے
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
