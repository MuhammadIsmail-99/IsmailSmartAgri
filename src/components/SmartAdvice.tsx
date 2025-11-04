import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, AlertTriangle, TrendingUp, CloudRain, Sun, Loader2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface SmartAdviceProps {
  weatherData: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  marketData: Array<{
    name: string;
    price: number;
    category: string;
  }>;
}

export const SmartAdvice = ({ weatherData, marketData }: SmartAdviceProps) => {
  const [advice, setAdvice] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSmartAdvice();
  }, [weatherData, marketData]);

  const generateSmartAdvice = async () => {
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const marketSummary = marketData
        .slice(0, 10)
        .map(item => `${item.name} (${item.category}): PKR ${item.price}`)
        .join(', ');

      const prompt = `
You are an expert agricultural advisor for Pakistani farmers. Based on the following current conditions, provide 3-4 specific, actionable pieces of advice for farmers. Each piece of advice should be practical, localized to Pakistan's agricultural context, and include:

1. A clear title (max 5 words)
2. A detailed but concise message (max 2 sentences)
3. A priority level: "high", "medium", or "low"
4. A category: "weather", "market", "seasonal", or "general"

Current Weather Conditions:
- Temperature: ${weatherData.temperature}°C
- Condition: ${weatherData.condition}
- Humidity: ${weatherData.humidity}%
- Wind Speed: ${weatherData.windSpeed} km/h

Current Market Prices (sample):
${marketSummary}

Current Season: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

Please respond in valid JSON format as an array of objects with keys: title, message, priority, type
Make the advice specific to Pakistani farming practices and current market realities.
RESPONSE MUST BE IN URDU
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean the response to extract JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedAdvice = JSON.parse(jsonMatch[0]);
        setAdvice(parsedAdvice.slice(0, 4)); // Limit to 4 items
      } else {
        // Fallback to rule-based advice if AI fails
        setAdvice(generateFallbackAdvice());
      }
    } catch (error) {
      console.error('Error generating AI advice:', error);
      // Fallback to rule-based advice
      setAdvice(generateFallbackAdvice());
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackAdvice = () => {
    const fallbackAdvice = [];

    // Weather-based advice
    if (weatherData.condition.toLowerCase().includes('rain') || weatherData.humidity > 70) {
      fallbackAdvice.push({
        type: 'weather',
        title: 'موسم کی الرٹ',
        message: 'آج فصلوں کو پانی نہ دیں، بارش متوقع ہے۔ اعلی نمی سے پودوں کے صحت پر اثر پڑ سکتا ہے۔',
        priority: 'high'
      });
    } else if (weatherData.temperature > 35) {
      fallbackAdvice.push({
        type: 'weather',
        title: 'گرمی کی الرٹ',
        message: 'فصلوں کو سایہ اور اضافی پانی فراہم کریں۔ گرمی سے متاثر ہونے والے پھل توڑنے پر غور کریں۔',
        priority: 'high'
      });
    } else if (weatherData.temperature < 15) {
      fallbackAdvice.push({
        type: 'weather',
        title: 'ٹھنڈ کی الرٹ',
        message: 'فصلوں کو پالے سے بچائیں۔ سردی سے متاثر ہونے والے پودوں کی بوائی میں تاخیر کریں۔',
        priority: 'high'
      });
    }

    // Market-based advice
    const highValueItems = marketData.filter(item => item.price > 100);

    if (highValueItems.length > 0) {
      const topItem = highValueItems[0];
      fallbackAdvice.push({
        type: 'market',
        title: 'قیمت کا موقع',
        message: `${topItem.name} کی قیمتیں موافق ہیں۔ منافع زیادہ کرنے کے لیے اگلے 2-3 دنوں میں فروخت پر غور کریں۔`,
        priority: 'medium'
      });
    }

    // Seasonal advice
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 2 && currentMonth <= 4) {
      fallbackAdvice.push({
        type: 'seasonal',
        title: 'بہار کی بوائی',
        message: 'بہار کی بوائی کا موسم ہے۔ ٹماٹر، مرچ اور بھنڈی جیسے گرمی کے پودوں کی بوائی پر غور کریں۔',
        priority: 'low'
      });
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      fallbackAdvice.push({
        type: 'seasonal',
        title: 'بارشی موسم',
        message: 'بارشی موسم ہے۔ کھیتوں میں پانی جمع ہونے سے بچنے کے لیے مناسب نکاسی یقینی بنائیں۔',
        priority: 'low'
      });
    }

    // General farming advice
    if (fallbackAdvice.length < 2) {
      fallbackAdvice.push({
        type: 'general',
        title: 'کسان کا ٹپ',
        message: 'مٹی کی نمی اور غذائی اجزاء کی سطح کو باقاعدگی سے چیک کریں۔ صحت مند مٹی سے بہتر پیداوار ملتی ہے۔',
        priority: 'low'
      });
    }

    return fallbackAdvice.slice(0, 3);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'weather': return CloudRain;
      case 'market': return TrendingUp;
      case 'seasonal': return Sun;
      default: return Lightbulb;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Lightbulb className="h-5 w-5" />
            ذہین کسان مشورے
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>ذاتی نوعیت کے مشورے تیار کیے جا رہے ہیں...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Lightbulb className="h-5 w-5" />
          ذہین کسان مشورے
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {advice.map((item, index) => {
          const IconComponent = getIcon(item.type);
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-start gap-3">
                <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                </div>
              </div>
            </div>
          );
        })}
        <p className="text-xs text-center text-muted-foreground mt-4">
          موجودہ موسم اور مارکیٹ کی صورتحال کی بنیاد پر AI سے تیار کردہ مشورے
        </p>
      </CardContent>
    </Card>
  );
};