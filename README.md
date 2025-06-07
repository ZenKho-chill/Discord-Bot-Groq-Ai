# 🤖 Discord Groq AI

**Discord Groq AI** là một bot Discord tích hợp AI sử dụng API của Groq, giúp mang lại trải nghiệm trò chuyện tự nhiên và mạnh mẽ. Dự án này tập trung vào giao diện slash commands hiện đại và dễ sử dụng.

---

## 🚀 Tính năng chính

✅ **Slash Commands:**
- **`/chat`** – Trò chuyện với trợ lý AI.
- **`/clear`** – Xóa lịch sử trò chuyện của bạn với AI.
- **`/help`** – Hiển thị thông tin về các lệnh và tính năng của bot.
- **`/list-channels`** – Liệt kê các kênh có AI hoạt động.
- **`/remove-channel`** – Xóa phản hồi tự động AI khỏi một kênh.
- **`/settings`** – Cấu hình các thiết lập trợ lý AI của bạn.
- **`/setup-channel`** – Thiết lập một kênh để tương tác với AI.

✅ **Kết nối Groq AI** – Giúp phản hồi thông minh, tự nhiên.

✅ **Lưu trữ** bằng MongoDB, đảm bảo quản lý dữ liệu trò chuyện và kênh.

✅ **Express Server** – Có thể mở rộng thành REST API khi cần.

✅ **Tích hợp .env** – Đảm bảo bảo mật biến môi trường.

---

## 🛠️ Công nghệ sử dụng

- **Node.js** + **ES Modules** (`type: "module"`)
- **discord.js** – Framework chính để tạo bot Discord.
- **groq-sdk** – Tích hợp AI từ Groq.
- **mongoose** – Quản lý dữ liệu với MongoDB.
- **express** – Tạo server web (nếu cần).
- **node-fetch** – Gửi HTTP request.
- **dotenv** – Quản lý biến môi trường.
- **nodemon** – Hỗ trợ tự động reload khi phát triển.

---

## ⚙️ Thiết lập

### 👉 1️⃣ Lấy Groq API Key

1. Truy cập [https://console.groq.com/keys](https://console.groq.com/keys).  
2. Đăng nhập hoặc tạo tài khoản Groq.  
3. Tạo một **API Key mới** và copy nó.  
4. Dán vào file `.env` của bạn dưới biến `GROQ_API_KEY`.

---

### 👉 2️⃣ Thiết lập Bot trong Discord Developer Portal

1. Vào [Discord Developer Portal](https://discord.com/developers/applications).  
2. Nhấn **New Application** và đặt tên cho bot.  
3. Trong tab **Bot**, nhấn **Add Bot** để tạo bot.  
4. Copy **Token** của bot (dán vào biến `DISCORD_TOKEN` trong `.env`).  
5. Trong tab **OAuth2 > URL Generator**:  
   - Chọn **bot** và **applications.commands**.  
   - Trong phần **Bot Permissions**, chọn các quyền:  
     - **Send Messages**  
     - **Read Message History**  
     - **Use Slash Commands**  
     - (và các quyền khác nếu cần)  
6. Copy URL được tạo và mở trong trình duyệt để mời bot vào server.

> ⚠️ **Lưu ý:**  
> - Copy **Application ID** từ trang **General Information** để dán vào `DISCORD_CLIENT_ID` trong `.env`.

---

### 👉 3️⃣ Tạo file `.env`

```env
DISCORD_TOKEN=your_discord_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here

GROQ_API_KEY=your_groq_api_key_here

# Nếu chạy bằng Docker Compose, MONGO_URI nên là:
MONGO_URI=mongodb://mongo:27017/database_name_here
```

---

### 👉 4️⃣ Chạy bot (Không Docker)

```bash
npm install
npm start
```

- **Chạy chế độ dev (tự động reload)**:
```bash
npm run dev
```

- **Chạy với cờ `--register` (đăng ký slash commands)**:
```bash
npm run deploy-and-run
```

- **Chạy không deploy (nếu đã đăng ký slash commands)**:
```bash
npm run start-only
```

---

### 👉 5️⃣ Chạy bot bằng Docker Compose

1. Đảm bảo đã tạo file `.env` đúng định dạng ở trên.  
2. Tạo file `docker-compose.yml` (có thể copy từ tài liệu hoặc file mẫu đã cung cấp).  
3. Chạy lệnh:

```bash
docker compose up -d --build
```

4. Để dừng:

```bash
docker compose down
```

> 💡 Bot và MongoDB sẽ chạy chung mạng (`bot-discord-ai`), bot sẽ tự động kết nối database **mà không cần chỉnh IP thủ công**.

---

### 👉 6️⃣ Dockerfile (có sẵn trong repo)

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]
```

> 💡 MongoDB container sẽ gắn volume **mongo_data** để lưu dữ liệu vĩnh viễn.

---

## 📷 Giao diện Slash Commands

![Slash Commands](https://cdn.discordapp.com/attachments/1378032335827505262/1380773804736905258/image.png?ex=68451950&is=6843c7d0&hm=cb478437d5ee85e6aa888bb47d40c34849722da04d12e2b9d0dcc62812c0db30&)

---

## 💬 Góp ý
Nếu bạn gặp lỗi hoặc muốn đề xuất tính năng mới, hãy tạo issue hoặc liên hệ [ZenKho tại Discord](http//discord.com/users/917970047325077615).

---

## © Bản quyền
Dự án này sử dụng giấy phép GNU GPL v3. Bạn có thể sử dụng, chia sẻ, chỉnh sửa với điều kiện giữ nguyên giấy phép và ghi công tác giả. Chi tiết: https://www.gnu.org/licenses/gpl-3.0.html

---

Chúc bạn có trải nghiệm thú vị cùng **Discord Groq AI**! 🚀✨
