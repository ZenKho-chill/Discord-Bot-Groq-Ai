/*
 * Tệp này là một phần của Discord Groq Ai Bot.
 *
 * Discord Groq Ai Bot là phần mềm miễn phí: bạn có thể phân phối lại hoặc sửa đổi
 * theo các điều khoản của Giấy phép Công cộng GNU được công bố bởi
 * Tổ chức Phần mềm Tự do, phiên bản 3 hoặc (nếu bạn muốn) bất kỳ phiên bản nào sau đó.
 *
 * Discord Groq Ai Bot được phân phối với hy vọng rằng nó sẽ hữu ích,
 * nhưng KHÔNG CÓ BẢO HÀNH; thậm chí không bao gồm cả bảo đảm
 * VỀ TÍNH THƯƠNG MẠI hoặc PHÙ HỢP CHO MỘT MỤC ĐÍCH CỤ THỂ. Xem
 * Giấy phép Công cộng GNU để biết thêm chi tiết.
 *
 * Bạn sẽ nhận được một bản sao của Giấy phép Công cộng GNU cùng với Discord Groq Ai Bot.
 * Nếu không, hãy xem <https://www.gnu.org/licenses/>.
 */

import { Client, Collection, REST, Routes } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import { BOT_CONFIG, CLIENT_OPTIONS, MONGODB_CONFIG } from "./config.js";

// Lấy tên file trong ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tạo client Discord
const client = new Client(CLIENT_OPTIONS);

// Tạo biến cho lệnh và nút
client.commands = new Collection();
client.buttons = new Collection();

// Kết nối đến MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_CONFIG.uri);
    console.log("Kết nối đến MongoDB thành công!");
  } catch (error) {
    console.error("Lỗi kết nối đến MongoDB:", error);
    process.exit(1); // Thoát
  }
}

// Load lệnh
async function loadCommands() {
  try {
    const commandsPath = path.join(__dirname, "commands");

    // Kiểm tra xem thư mục lệnh có tồn tại không
    if (!fs.existsSync(commandsPath)) {
      console.warn("Thư mục lệnh không tồn tại, bỏ qua tải lệnh!");
      return [];
    }

    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    const commandsData = [];

    console.log(`Tìm thấy ${commandFiles.length} lệnh`);

    for (const file of commandFiles) {
      try {
        const filePath = path.join(commandsPath, file);
        const command = await import(`file://${filePath}`);

        // Đặt mục mới trong bộ sưu tập và đặt tên lệnh và giá trị là modules
        if ("data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
          commandsData.push(command.data.toJSON());
          console.log(`Đã tải lệnh: ${command.data.name}`);
        } else {
          console.warn(`Lệnh ở ${filePath} thiếu thuộc tính data hoặc execute`);
        }
      } catch (error) {
        console.error(`Lỗi khi tải lệnh từ file ${file}:`, error);
      }
    }

    console.log(`Đã tải ${client.commands.size} lệnh`);
    return commandsData;
  } catch (error) {
    console.error("Lỗi khi tải lệnh:", error);
    return [];
  }
}

// Load nút
async function loadButtons() {
  try {
    const buttonsPath = path.join(__dirname, "buttons");

    // Kiểm tra xem thư mục nút có tồn tại không
    if (!fs.existsSync(buttonsPath)) {
      console.warn("Thư mục nút không tồn tại, bỏ qua tải nút!");
      return;
    }

    const buttonFiles = fs
      .readdirSync(buttonsPath)
      .filter((file) => file.endsWith(".js"));

    console.log(`Tìm thấy ${buttonFiles.length} nút`);

    for (const file of buttonFiles) {
      try {
        const filePath = path.join(buttonsPath, file);
        const button = await import(`file://${filePath}`);

        if ("customId" in button && "execute" in button) {
          client.buttons.set(button.customId, button);
          console.log(`Đã tải nút: ${button.customId}`);
        } else {
          console.warn(
            `Nút ở ${file} lỗi thiếu thuộc tính customId hoặc execute`
          );
        }
      } catch (error) {
        console.error(`Lỗi khi tải nút từ file ${file}:`, error);
      }
    }

    console.log(`Đã tải ${client.buttons.size} nút`);
  } catch (error) {
    console.error("Lỗi khi tải nút:", error);
  }
}

// Đăng ký sự kiện
async function loadEvents() {
  try {
    const eventsPath = path.join(__dirname, "events");

    // Kiểm tra xem thư mục sự kiện có tồn tại không
    if (!fs.existsSync(eventsPath)) {
      console.warn("Thư mục sự kiện không tồn tại, bỏ qua tải sự kiện");
      return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    console.log(`Tìm thấy ${eventFiles.length} sự kiện`);

    for (const file of eventFiles) {
      try {
        const filePath = path.join(eventsPath, file);
        const event = await import(`file://${filePath}`);

        if (!event.name) {
          console.warn(`Sự kiện ở ${filePath} không có thuộc tính name`);
          continue;
        }

        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
          console.log(`Đăng ký sự kiện một lần: ${event.name}`);
        } else {
          client.on(event.name, (...args) => event.execute(...args));
          console.log(`Đăng ký sự kiện: ${event.name}`);
        }
      } catch (error) {
        console.error(`Lỗi khi đăng ký sự kiện từ file ${file}:`, error);
      }
    }

    console.log(`Đã đăng ký tất cả sự kiện`);
  } catch (error) {
    console.error("Lỗi đăng ký sự kiện:", error);
  }
}

// Đăng ký lệnh với Discord
async function deployCommands(commandsData) {
  try {
    if (!commandsData || commandsData.length === 0) {
      console.error("Không có lệnh nào để đăng ký");
      return 0;
    }

    console.log(`Đăng ký ${commandsData.length} lệnh với Discord...`);

    // Tạo REST client
    const rest = new REST().setToken(BOT_CONFIG.token);

    // Đăng ký lệnh
    const data = await rest.put(
      Routes.applicationCommands(BOT_CONFIG.client),
      { body: commandsData }
    );

    console.log(`Đã đăng ký ${data.length} lệnh với discord`);
    return data.length;
  } catch (error) {
    console.error("Lỗi đăng ký lệnh:", error);
    return 0;
  }
}

// Load xử lý lệnh
async function registerCommands() {
  try {
    const commandsToRegister = await loadCommands();

    return await deployCommands(commandsToRegister);
  } catch (error) {
    console.error("Lỗi khi đăng ký lệnh:", error);
    return 0;
  }
}

// Khởi động bot
async function initializeBot() {
  console.log("Bắt đầu khởi động bot...");

  await connectToDatabase();

  if (process.argv.includes("--deploy")) {
    await registerCommands();
    console.log("Đã đăng ký lệnh với Discord");
    process.exit(0);
  }

  if (process.argv.includes("--register")) {
    await registerCommands();
    console.log("Đã đăng ký lệnh với Discord. Bot đang khởi động...");
  }

  // Tự động đăng ký lệnh ngoại trừ có flag --no-deploy
  if (
    !process.argv.includes("--no-deploy") &&
    !process.argv.includes("--register")
  ) {
    console.log("Đang tự động đăng ký lệnh...");
    await registerCommands();
    console.log("Đã đăng ký lệnh với Discord. Tiếp tục quá trình khởi động...");
  }

  // Load lệnh, nút và sự kiện
  await loadCommands();
  await loadButtons();
  await loadEvents();

  // Đăng nhập vào Discord
  await client.login(BOT_CONFIG.token);

  console.log("┌──────────────────────────────────────┐");
  console.log("│          Groq Ai Bot Online!         │");
  console.log("└──────────────────────────────────────┘");
}

// Xử lý các lệnh
if (process.argv.includes("--deploy")) {
  // Đăng ký lệnh và thoát
  console.log("Chế độ đăng ký lệnh đang kích hoạt...");
  registerCommands().then((count) => {
    if (count > 0) {
      console.log(`┌──────────────────────────────────────┐`);
      console.log(`│  Đăng ký ${count.toString().padStart(2, " ")} lệnh thành công!  │`);
      console.log(`└──────────────────────────────────────┘`);
    } else {
        console.log('Đăng ký lệnh thất bại');
    }
    process.exit(count > 0 ? 0 : 1);
  }).catch(error => {
    console.error('Lỗi khi đăng ký lệnh:', error);
    process.exit(1);
  });
} else if (process.argv.includes('--register')) {
    // Đăng ký lệnh và tiếp tục khởi động bot
    console.log('Chế độ đăng ký lệnh đang kích hoạt...');
    registerCommands().then(() => {
        initializeBot();
    }).catch(error => {
        console.error('Lỗi khi đăng ký lệnh:', error);
        process.exit(1);
    });
} else {
    // Chế độ bình thường, khởi động bot
    initializeBot();
}
