-- Drop trigger first, then function, then recreate with proper security settings
DROP TRIGGER IF EXISTS update_market_data_updated_at ON public.market_data;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recreate function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER update_market_data_updated_at
  BEFORE UPDATE ON public.market_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();