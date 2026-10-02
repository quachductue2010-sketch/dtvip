# DT Vip — Premium Game Hub + Check IP trùng

## Cách check trùng hoạt động
- Website lấy IP của request trên backend Vercel.
- Backend băm IP bằng HMAC-SHA256 với `IP_HASH_SECRET` và chỉ lưu hash, không lưu IP gốc.
- Khi người dùng bấm một link game thật trong DT Vip, `/api/track` ghi `ip_hash + game_id` vào Supabase.
- Nút **CHECK TRÙNG** gọi `/api/check` để xem IP hiện tại đã có những `game_id` nào trong cơ sở dữ liệu.

> Điều này chỉ kiểm tra lịch sử được ghi nhận qua DT Vip. Không thể tự biết một IP đã dùng trên website/game bên thứ ba nếu bên đó không cấp API hoặc dữ liệu cho bạn.

## File cần sửa
- `games.json`: tên nhóm, tên game, link.
- `supabase.sql`: chạy một lần trong Supabase SQL Editor.

## Environment Variables trên Vercel
- `SUPABASE_URL` = URL project Supabase, ví dụ `https://xxxx.supabase.co`
- `SUPABASE_SECRET_KEY` = secret key Supabase (`sb_secret_...`), chỉ đặt ở server/Vercel, KHÔNG đưa vào HTML/GitHub.
- `IP_HASH_SECRET` = chuỗi bí mật dài ngẫu nhiên, ví dụ 40+ ký tự.

Sau khi thêm/chỉnh Environment Variables trên Vercel, redeploy project để chúng có hiệu lực.
