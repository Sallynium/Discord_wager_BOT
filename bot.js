// 引入必要模組
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

// 從 Replit 的環境變數取得 TOKEN
const TOKEN = process.env["TOKEN"];
const PREFIX = "!";
const DATA_FILE = "./predictions_data.json";

// 建立 Discord 客戶端
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 資料結構初始化
let data = {};

// 載入資料
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf8");
      data = JSON.parse(content);

      // 修補缺失欄位（避免舊資料缺欄位）
      for (const guildId in data) {
        data[guildId].predictions ??= {};
        data[guildId].scores ??= {};
        data[guildId].match_history ??= {};
        data[guildId].match_schedules ??= {};
        data[guildId].match_teams ??= {};
        data[guildId].match_points ??= {};
      }

      console.log("✅ 成功載入預測資料！");
    }
  } catch (err) {
    console.error("❌ 載入資料錯誤:", err);
  }
}

// 儲存資料
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    console.log("💾 資料已儲存。");
  } catch (err) {
    console.error("❌ 儲存資料錯誤:", err);
  }
}

client.on("ready", () => {
  console.log(`🤖 機器人上線：${client.user.tag}`);
  loadData();
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const guildId = message.guild?.id;
  if (!guildId) return;

  // 初始化伺服器資料
  if (!data[guildId]) {
    data[guildId] = {
      predictions: {},
      scores: {},
      match_history: {},
      match_schedules: {},
      match_teams: {},
      match_points: {},
    };
  }
  const serverData = data[guildId];

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case "ping":
      return message.reply("Pong!");

    case "register":
    case "登錄比賽": {
      if (!message.guild || !message.member?.permissions.has("Administrator")) {
        return message.reply("❌ 你沒有權限執行此指令。");
      }

      if (args.length < 5) {
        return message.reply(
          `請使用格式：\`${PREFIX}register <比賽ID> <隊伍A> <隊伍B> <YYYY-MM-DD> <HH:MM> [分數] [--force]\``,
        );
      }

      const hasForce = args.includes("--force");
      const rawArgs = args.filter((arg) => arg !== "--force");

      const matchId = rawArgs[0].toUpperCase();
      const teamA = rawArgs[1].toUpperCase();
      const teamB = rawArgs[2].toUpperCase();
      const datePart = rawArgs[3];
      const timePart = rawArgs[4];
      const point = parseInt(rawArgs[5] || "1", 10); // 預設為1分

      if (isNaN(point) || point <= 0) {
        return message.reply(
          "❌ 分數格式錯誤，請輸入正整數作為該場比賽的分數。",
        );
      }

      const taipeiTime = new Date(`${datePart}T${timePart}:00+08:00`);
      if (isNaN(taipeiTime.getTime())) {
        return message.reply(
          "❌ 時間格式錯誤，請使用 YYYY-MM-DD HH:MM 台北時間格式。",
        );
      }

      if (serverData.match_teams[matchId] && !hasForce) {
        return message.reply(
          `⚠️ 比賽 \`${matchId}\` 已經存在，若要覆蓋請加上 \`--force\`：\n\`${PREFIX}register ${matchId} ${teamA} ${teamB} ${datePart} ${timePart} ${point} --force\``,
        );
      }

      // 覆蓋資料
      serverData.match_points[matchId] = point;
      serverData.match_teams[matchId] = [teamA, teamB];
      serverData.match_schedules[matchId] = taipeiTime.toISOString();
      saveData();

      return message.reply(
        `${hasForce ? "🔄 已覆蓋原有資料，" : ""}✅ 登錄比賽 \`${matchId}\`：${teamA} vs ${teamB}，時間：${taipeiTime.toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}（預測正確得 ${point} 分）`,
      );
    }

    case "predict":
    case "預測": {
      if (args.length < 2) {
        return message.reply(
          `請使用格式：\`${PREFIX}predict <比賽ID> <隊伍名稱>\``,
        );
      }
      const matchId = args[0].toUpperCase();
      const predictedTeam = args.slice(1).join(" ").toUpperCase();

      if (!serverData.match_teams.hasOwnProperty(matchId)) {
        return message.reply(
          `❌ 預測失敗，找不到比賽 \`${matchId}\`，請確認比賽是否已登錄。`,
        );
      }

      const validTeams = serverData.match_teams[matchId] || [];
      if (!validTeams.includes(predictedTeam)) {
        return message.reply(
          `❌ 預測失敗，請確認隊伍名稱是否為 ${validTeams.join(" 或 ")}。`,
        );
      }

      const now = new Date();
      const startTime = serverData.match_schedules[matchId]
        ? new Date(serverData.match_schedules[matchId])
        : null;
      if (startTime && now >= startTime) {
        return message.reply(`⏰ 比賽 \`${matchId}\` 已開始，無法再預測！`);
      }

      if (!serverData.predictions[matchId])
        serverData.predictions[matchId] = {};
      serverData.predictions[matchId][message.author.id] = predictedTeam;
      saveData();
      return message.reply(
        `✅ 你預測 \`${matchId}\` 比賽的贏家為：\`${predictedTeam}\``,
      );
    }

    case "follow":
    case "跟單": {
      if (!message.guild || message.mentions.users.size === 0) {
        return message.reply(
          "❌ 請標註一位要跟單的使用者，例如：`!follow @小明`",
        );
      }

      const targetUser = message.mentions.users.first();
      const userId = message.author.id;
      const targetId = targetUser.id;

      if (userId === targetId) {
        return message.reply("❌ 你不能跟單自己喔！");
      }

      const now = new Date();
      let followed = [];
      let skipped = [];
      let alreadyPredicted = [];

      for (const matchId of Object.keys(serverData.match_teams)) {
        const deadline = new Date(serverData.match_schedules[matchId]);
        if (now > deadline) continue;

        const targetPrediction = serverData.predictions?.[matchId]?.[targetId];
        if (!targetPrediction) {
          skipped.push(matchId);
          continue;
        }

        if (serverData.predictions?.[matchId]?.[userId]) {
          alreadyPredicted.push(matchId);
          continue;
        }

        // 初始化預測表
        if (!serverData.predictions[matchId]) {
          serverData.predictions[matchId] = {};
        }

        serverData.predictions[matchId][userId] = targetPrediction;
        followed.push(`${matchId}：${targetPrediction}`);
      }

      saveData();

      let msg = `📋 成功跟單 @${targetUser.username} 的預測如下：\n`;
      if (followed.length > 0) msg += `✅ ${followed.join("\n")}\n`;
      if (skipped.length > 0)
        msg += `⏭️ 略過未預測場次：${skipped.join(", ")}\n`;
      if (alreadyPredicted.length > 0)
        msg += `🛑 以下場次你已預測，未覆蓋：${alreadyPredicted.join(", ")}`;

      return message.reply(msg);
    }

    case "result":
    case "結果": {
      if (!message.guild || !message.member?.permissions.has("Administrator")) {
        return message.reply("❌ 你沒有權限執行此指令。");
      }
      if (args.length < 2) {
        return message.reply(
          `請使用格式：\`${PREFIX}result <比賽ID> <勝隊名稱>\``,
        );
      }
      const matchId = args[0].toUpperCase();
      const winningTeam = args.slice(1).join(" ").toUpperCase();

      if (!serverData.match_teams.hasOwnProperty(matchId)) {
        return message.reply(
          `❌ 查無比賽 \`${matchId}\`，請確認是否正確輸入。`,
        );
      }

      const validTeams = serverData.match_teams[matchId] || [];
      if (!validTeams.includes(winningTeam)) {
        return message.reply(
          `❌ 結果輸入錯誤：勝隊 \`${winningTeam}\` 並不屬於比賽 \`${matchId}\` 的登錄隊伍。`,
        );
      }
      if (serverData.match_history[matchId]) {
        return message.reply(
          `⚠️ 比賽 \`${matchId}\` 已結算過，若需要修正請使用 \`${PREFIX}undoresult ${matchId}\` 回溯。`,
        );
      }

      if (serverData.match_history[matchId]) {
        return message.reply(`比賽 \`${matchId}\` 已結算過。`);
      }

      serverData.match_history[matchId] = winningTeam;
      const predictions = serverData.predictions[matchId] || {};
      for (const userId in predictions) {
        const point = serverData.match_points?.[matchId] || 1;
        if (predictions[userId].toUpperCase() === winningTeam) {
          serverData.scores[userId] = (serverData.scores[userId] || 0) + point;
        }
      }
      saveData();
      return message.channel.send(
        `✅ 比賽 \`${matchId}\` 的勝隊是 \`${winningTeam}\`，積分已更新！`,
      );
    }

    case "undoresult":
    case "回溯結果": {
      if (!message.guild || !message.member?.permissions.has("Administrator")) {
        return message.reply("❌ 你沒有權限執行此指令。");
      }

      if (args.length < 1) {
        return message.reply(`請使用格式：\`${PREFIX}undoresult <比賽ID>\``);
      }

      const matchId = args[0].toUpperCase();
      const winner = serverData.match_history?.[matchId];

      if (!winner) {
        return message.reply(`⚠️ 此比賽尚未結算，無法回溯結果。`);
      }

      const predictions = serverData.predictions?.[matchId] || {};
      const point = serverData.match_points?.[matchId] || 1;
      let undoCount = 0;

      for (const userId in predictions) {
        if (predictions[userId].toUpperCase() === winner.toUpperCase()) {
          serverData.scores[userId] = (serverData.scores[userId] || 0) - point;
          undoCount++;
        }
      }

      delete serverData.match_history[matchId];
      saveData();

      return message.reply(
        `🔄 已回溯比賽 \`${matchId}\` 結果，扣除 ${undoCount} 名預測 \`${winner}\` 使用者的 ${point} 分，請重新使用 \`!result\` 結算。`,
      );
    }

    case "leaderboard":
    case "計分板": {
      const sorted = Object.entries(serverData.scores).sort(
        ([, a], [, b]) => b - a,
      );
      let msg = "**📊 當前積分排行榜：**\n";
      if (sorted.length === 0) {
        msg += "尚無任何積分紀錄，快來預測！";
      } else {
        for (let i = 0; i < sorted.length; i++) {
          const [userId, score] = sorted[i];
          try {
            const user = await client.users.fetch(userId);
            msg += `${i + 1}. ${user.username}：${score} 分\n`;
          } catch {
            msg += `${i + 1}. 未知使用者 (${userId})：${score} 分\n`;
          }
        }
      }
      return message.channel.send(msg);
    }

    case "myscore":
    case "我幾分": {
      const score = serverData.scores[message.author.id] || 0;
      return message.reply(`🎯 你的目前總積分為：${score} 分`);
    }

    case "history":
    case "比數": {
      if (args.length < 1) {
        return message.reply(`請輸入比賽 ID，例如：\`${PREFIX}history R1\``);
      }
      const matchId = args[0].toUpperCase();
      const predictions = serverData.predictions?.[matchId];
      if (!predictions) {
        return message.reply(`查無比賽 \`${matchId}\` 的預測紀錄`);
      }
      const count = {};
      for (const userId in predictions) {
        const team = predictions[userId].toUpperCase();
        count[team] = (count[team] || 0) + 1;
      }
      let result = `📊 \`${matchId}\` 預測統計：\n`;
      for (const team in count) {
        result += `- ${team}：${count[team]} 票\n`;
      }
      return message.reply(result);
    }

    // made by https://github.com/Sallynium //
    
    case "delete":
    case "刪除": {
      if (!message.guild || !message.member?.permissions.has("Administrator")) {
        return message.reply("❌ 你沒有權限執行此指令。");
      }
      if (args.length < 1) {
        return message.reply(`請輸入比賽 ID，例如：\`${PREFIX}delete R1\``);
      }
      const matchId = args[0].toUpperCase();
      const guildId = message.guild.id;

      const matchExists =
        data[guildId]?.match_teams?.[matchId] ||
        data[guildId]?.match_schedules?.[matchId] ||
        data[guildId]?.predictions?.[matchId] ||
        data[guildId]?.match_history?.[matchId];

      if (!matchExists) {
        return message.reply(`❌ 查無比賽 \`${matchId}\`，無需刪除。`);
      }

      // 移除資料
      delete data[guildId].match_teams?.[matchId];
      delete data[guildId].match_schedules?.[matchId];
      delete data[guildId].predictions?.[matchId];
      delete data[guildId].match_history?.[matchId];
      saveData();

      return message.reply(`🗑️ 已刪除比賽 \`${matchId}\` 的所有紀錄。`);
    }

    case "matches":
    case "所有比賽": {
      const now = new Date();

      const upcoming = [];
      const closed = [];

      for (const matchId in serverData.match_schedules) {
        const start = new Date(serverData.match_schedules[matchId]);
        const teams =
          serverData.match_teams[matchId]?.join(" vs ") || "未知對戰組合";
        const point = serverData.match_points?.[matchId] || 1;
        const timeStr = start.toLocaleString("zh-TW", {
          timeZone: "Asia/Taipei",
        });
        const line = `\`${matchId}\`｜${teams}｜${timeStr}｜${point} 分`;

        if (now < start) {
          upcoming.push(line);
        } else {
          closed.push(line);
        }
      }

      let msg = "**📅 登錄中的比賽列表：**\n";
      if (upcoming.length > 0) {
        msg += "\n🔮 可預測比賽：\n" + upcoming.join("\n") + "\n";
      } else {
        msg += "\n🔮 可預測比賽：\n（目前沒有尚未開打的比賽）\n";
      }

      if (closed.length > 0) {
        msg += "\n⏰ 已結束預測：\n" + closed.join("\n");
      }

      return message.channel.send(msg);
    }

    case "addscore":
    case "加分": {
      if (!message.guild || !message.member?.permissions.has("Administrator")) {
        return message.reply("❌ 你沒有權限執行此指令。");
      }
      if (args.length < 2 || message.mentions.users.size === 0) {
        return message.reply(`請使用格式：\`${PREFIX}addscore @user <分數>\``);
      }
      const target = message.mentions.users.first();
      const points = parseInt(args[1], 10);
      if (isNaN(points) || points <= 0) {
        return message.reply("❌ 分數格式錯誤，請輸入正整數。");
      }
      serverData.scores[target.id] =
        (serverData.scores[target.id] || 0) + points;
      saveData();
      return message.reply(`✅ 已增加 ${target.username} 的 ${points} 分`);
    }

    case "subscore":
    case "扣分": {
      if (!message.guild || !message.member?.permissions.has("Administrator")) {
        return message.reply("❌ 你沒有權限執行此指令。");
      }
      if (args.length < 2 || message.mentions.users.size === 0) {
        return message.reply(`請使用格式：\`${PREFIX}subscore @user <分數>\``);
      }
      const target = message.mentions.users.first();
      const points = parseInt(args[1], 10);
      if (isNaN(points) || points <= 0) {
        return message.reply("❌ 分數格式錯誤，請輸入正整數。");
      }
      serverData.scores[target.id] =
        (serverData.scores[target.id] || 0) - points;
      saveData();
      return message.reply(`✅ 已減少 ${target.username} 的 ${points} 分`);
    }

    case "mypredictions":
    case "我的預測": {
      const myPredictions = [];
      for (const matchId in serverData.predictions) {
        if (serverData.predictions[matchId][message.author.id]) {
          const prediction = serverData.predictions[matchId][message.author.id];
          myPredictions.push(`- ${matchId}: 預測 ${prediction}`);
        }
      }
      if (myPredictions.length === 0) {
        return message.reply("你尚未預測任何比賽。");
      }
      return message.reply(`您目前預測結果：\n${myPredictions.join("\n")}`);
    }

    case "forcepredict": {
      if (!message.guild || !message.member?.permissions.has("Administrator")) {
        return message.reply("❌ 你沒有權限執行此指令。");
      }
      if (args.length < 3) {
        return message.reply(
          `請使用格式：\`${PREFIX}forcepredict <@user> <比賽ID> <隊伍名稱>\``,
        );
      }
      const userMention = args[0];
      const matchId = args[1].toUpperCase();
      const predictedTeam = args.slice(2).join(" ").toUpperCase();
      const userId = userMention.replace(/[^0-9]/g, "");

      if (!serverData.match_teams.hasOwnProperty(matchId)) {
        return message.reply(`❌ 找不到比賽 \`${matchId}\`，請確認是否登錄。`);
      }

      const validTeams = serverData.match_teams[matchId] || [];
      if (!validTeams.includes(predictedTeam)) {
        return message.reply(
          `❌ 錯誤，隊伍名稱應為 ${validTeams.join(" 或 ")}。`,
        );
      }

      if (!serverData.predictions[matchId]) {
        serverData.predictions[matchId] = {};
      }

      serverData.predictions[matchId][userId] = predictedTeam;
      saveData();
      return message.reply(
        `✅ 成功為 <@${userId}> 設定 \`${matchId}\` 預測為 \`${predictedTeam}\``,
      );
    }



    case "help": {
      const embed = new EmbedBuilder()
        .setTitle("🍁 比賽預測機器人指令表")
        .setColor(0xecda24)
        .addFields(
          {
            name: "💁 使用者指令",
            value:
              "`!predict <比賽ID> <隊伍>` - 預測贏家\n" +
              "`!myscore` - 查看自己目前的分數\n" +
              "`!mypredictions` - 查看預測紀錄\n" +
              "`!matches` - 查看所有比賽\n" +
              "`!history <比賽ID>` - 查看預測統計\n" +
              "`!leaderboard` - 查看計分板\n",
          },
          {
            name: "🔧 管理員指令",
            value:
              "`!register <ID> <隊伍A> <隊伍B> <日期> <時間> [分數]`  - 登錄比賽\n" +
              "`!result <ID> <勝隊>` - 登錄結果\n" +
              "`!addscore <@user> <分數>` / `!subscore <@user> <分數>` - 調整分數\n" +
              "`!forcepredict <@user> <ID> <隊伍>` - 代客登記\n" +
              "`!delete <ID>` - 刪除比賽\n",
          },
          { name: "📘 說明", value: "`!help` - 顯示本說明" },
        )
        .setFooter({ text: "有狀況請找管理員" });

      return message.channel.send({ embeds: [embed] });
    }
  }
});

// 建立 Express 保活用伺服器
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("🤖 Discord Bot 正在運行中");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 網頁伺服器已啟動於 port ${PORT}`);
});

client.login(TOKEN);
