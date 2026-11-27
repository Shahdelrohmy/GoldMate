-- Private bucket for invoice photos (gold_records.invoice_image_path).
-- Path convention: <user_id>/<file name>. A user can only touch files inside their own folder.
-- Never log or share these images (AGENTS.md section 4, Security).

insert into storage.buckets (id, name, public, allowed_mime_types)
values ('invoices', 'invoices', false, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "invoices: owner read" on storage.objects
  for select to authenticated
  using (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "invoices: owner upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "invoices: owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);
