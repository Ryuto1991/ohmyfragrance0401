-- 一時保存用の画像テーブルを作成
create table if not exists temp_custom_perfume_images (
  id uuid primary key default uuid_generate_v4(),
  image_key text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  expires_at timestamp with time zone default timezone('utc'::text, now() + interval '24 hours')
);

-- インデックスを作成
create index if not exists idx_temp_images_expires_at on temp_custom_perfume_images(expires_at);

-- 24時間以上経過した画像を削除する関数を作成
create or replace function cleanup_temp_images()
returns void as $$
begin
  -- 期限切れの画像を削除
  delete from temp_custom_perfume_images
  where expires_at < now();
end;
$$ language plpgsql; 