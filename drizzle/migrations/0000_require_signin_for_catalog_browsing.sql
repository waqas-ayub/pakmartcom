-- Require sign-in to browse products and categories
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

CREATE POLICY "Signed-in users can view products"
ON public.products FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Signed-in users can view categories"
ON public.categories FOR SELECT TO authenticated
USING (true);

-- Remove anonymous read access to the catalog
REVOKE SELECT ON public.products FROM anon;
REVOKE SELECT ON public.categories FROM anon;