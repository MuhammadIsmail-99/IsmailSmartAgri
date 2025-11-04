import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PriceChartProps {
  itemName: string;
  currentPrice: number;
}

export const PriceChart = ({ itemName, currentPrice }: PriceChartProps) => {
  // Generate 7 days of simulated price data
  const generatePriceData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Simulate price variations around current price (±15%)
      const variation = (Math.random() - 0.5) * 0.3;
      const price = i === 0 
        ? currentPrice 
        : currentPrice * (1 + variation);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: parseFloat(price.toFixed(2)),
      });
    }
    
    return data;
  };

  const data = generatePriceData();

  return (
    <div className="w-full h-[400px] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-muted-foreground"
            tick={{ fontSize: 12 }}
            label={{ value: 'قیمت (PKR)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`PKR ${value.toFixed(2)}`, 'قیمت']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', r: 5 }}
            activeDot={{ r: 7 }}
            name={itemName}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-sm text-muted-foreground">
        7 دن کی قیمت کی رجحان جو تاریخی تغیرات دکھاتا ہے
      </div>
    </div>
  );
};
