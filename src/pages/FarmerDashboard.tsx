import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { LogOut, Search, TrendingUp, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WeatherWidget } from "@/components/WeatherWidget";
import { PriceChart } from "@/components/PriceChart";
import { SmartAdvice } from "@/components/SmartAdvice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MarketData {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  region: string;
  date: string;
}

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [filteredData, setFilteredData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketData | null>(null);
  const [chartOpen, setChartOpen] = useState(false);

  useEffect(() => {
    fetchMarketData();
  }, []);

  useEffect(() => {
    const filtered = marketData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.region.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, marketData]);

  const fetchMarketData = async () => {
    const { data, error } = await supabase
      .from('market_data')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      toast.error("مارکیٹ ڈیٹا حاصل کرنے میں خرابی");
    } else {
      setMarketData(data || []);
      setFilteredData(data || []);
    }
    setLoading(false);
  };

  const handleViewChart = (item: MarketData) => {
    setSelectedItem(item);
    setChartOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <header className="border-b bg-card">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <h1 className="text-2xl font-bold">کسان ڈیش بورڈ</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/forum')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                کمیونٹی فورم
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                سائن آؤٹ
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-6 space-y-6">
          <WeatherWidget />

          <SmartAdvice
            weatherData={{
              temperature: 28,
              condition: "جزوی طور پر ابر آلود",
              humidity: 65,
              windSpeed: 12,
            }}
            marketData={marketData}
          />

          <Card>
            <CardHeader>
              <CardTitle>مارکیٹ کی قیمتیں</CardTitle>
              <div className="flex items-center gap-2 pt-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="نام، کیٹگری یا علاقے سے تلاش کریں..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">ڈیٹا لوڈ ہو رہا ہے...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام</TableHead>
                      <TableHead>کیٹگری</TableHead>
                      <TableHead>قیمت</TableHead>
                      <TableHead>علاقہ</TableHead>
                      <TableHead>تاریخ</TableHead>
                      <TableHead className="text-right">رجحان</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          PKR {item.price} / {item.unit}
                        </TableCell>
                        <TableCell>{item.region}</TableCell>
                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewChart(item)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            رجحان دیکھیں
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Dialog open={chartOpen} onOpenChange={setChartOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  7 دنوں کا قیمت رجحان: {selectedItem?.name}
                </DialogTitle>
              </DialogHeader>
              {selectedItem && <PriceChart itemName={selectedItem.name} currentPrice={selectedItem.price} />}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </AuthGuard>
  );
};

export default FarmerDashboard;
