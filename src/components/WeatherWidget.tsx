import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Sun } from "lucide-react";

export const WeatherWidget = () => {
  // Simulated weather data for demonstration
  const weatherData = {
    temperature: 28,
    condition: "Partly Cloudy",
    humidity: 65,
    windSpeed: 12,
    region: "Punjab",
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Weather Update
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-3 bg-card rounded-lg">
            <Sun className="h-6 w-6 mb-2 text-accent" />
            <span className="text-2xl font-bold">{weatherData.temperature}°C</span>
            <span className="text-sm text-muted-foreground">Temperature</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-card rounded-lg">
            <Cloud className="h-6 w-6 mb-2 text-primary" />
            <span className="text-lg font-semibold">{weatherData.condition}</span>
            <span className="text-sm text-muted-foreground">Condition</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-card rounded-lg">
            <Droplets className="h-6 w-6 mb-2 text-blue-500" />
            <span className="text-2xl font-bold">{weatherData.humidity}%</span>
            <span className="text-sm text-muted-foreground">Humidity</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-card rounded-lg">
            <Wind className="h-6 w-6 mb-2 text-primary" />
            <span className="text-2xl font-bold">{weatherData.windSpeed} km/h</span>
            <span className="text-sm text-muted-foreground">Wind Speed</span>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Weather data for {weatherData.region} region
        </p>
      </CardContent>
    </Card>
  );
};
