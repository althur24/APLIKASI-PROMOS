insert into public.categories (name, is_active)
values
  ('Digital Ads', true),
  ('Event & Sponsorship', true),
  ('Produksi Konten', true),
  ('Operasional Marketing', true),
  ('Cetak & Merchandise', true),
  ('Transportasi', true),
  ('Lainnya', true)
on conflict (name) do nothing;
