alter table public.actualites
  add column if not exists image_source jsonb;

comment on column public.actualites.image_source is
  'Attribution photographe : {provider, photographer_name, photographer_url, source_url}';
