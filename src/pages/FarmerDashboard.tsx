import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowLeft, Search, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WeatherWidget } from "@/components/WeatherWidget";
import { PriceChart } from "@/components/PriceChart";
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
      toast.error("Error fetching market data");
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
        <header className="border-b bg-card">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <h1 className="text-2xl font-bold">Farmer Dashboard</h1>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </header>

        <main className="container mx-auto p-6 space-y-6">
          <WeatherWidget />

          <Card>
            <CardHeader>
              <CardTitle>Market Prices</CardTitle>
              <div className="flex items-center gap-2 pt-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, category, or region..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Trend</TableHead>
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
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            View Trend
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
                  7-Day Price Trend: {selectedItem?.name}
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
