# Pocket Pet 桌寵工作室

Windows 透明置頂桌寵，預設小貓會在螢幕工作區最下方散步。設定與素材保存在本機，不需要帳號或伺服器。

## 下載 Windows 桌寵

**[⬇ 下載 Pocket-Pet-1.0.0.exe](https://github.com/ronby7777-jpg/classtest/releases/latest/download/Pocket-Pet-1.0.0.exe)** · [所有版本](https://github.com/ronby7777-jpg/classtest/releases)

1. 點上方連結下載 EXE，儲存到桌面或你喜歡的資料夾。
2. 在 Windows 檔案總管雙擊 EXE，即可開啟桌寵。
3. 之後每次雙擊同一個 EXE 就能使用，**不需要 Codex、Node.js，也不必重新下載**。可在 EXE 上按右鍵建立捷徑。

GitHub 的「Code → Download ZIP」是開發用原始碼；一般使用者請下載上面的 EXE。

## 直接使用

開啟 `Pocket-Pet-1.0.0.exe`。關閉設定視窗後桌寵仍會繼續陪伴；右鍵桌寵或雙擊系統匣圖示可重新開啟設定。從設定底部或系統匣選單選擇「結束桌寵」才會退出。

- 單擊桌寵：播放摸頭動作約 2.2 秒。
- 常態、走路、摸頭：可分別上傳圖片或 GIF。未設定的動作會使用常態圖片或內建小貓。
- 隨機動作：按「新增動作」增加欄位，可改名、指定素材與播放秒數（1–15 秒）。最多 50 個；每次走路結束有 45% 機率抽選已設定素材的動作。
- 大小、速度與移動範圍：調整滑桿後放開即可儲存套用。範圍百分比以桌寵可移動的左緣區間計算，確保整隻留在工作區。
- 多螢幕：可選擇桌寵居住的螢幕；拔除後會回到主螢幕。
- 叫聲：錄製最多 30 秒，或匯入音訊；可設定音量、出現機率及試聽。叫聲在摸頭／隨機動作時依機率播放。

支援 GIF（原生動畫）、PNG／APNG、JPEG、WebP、AVIF、BMP、SVG 與 ICO；動畫以 Chromium 支援與素材本身設定為準。建議使用透明背景、面向右側的素材，移動向左時會鏡像。單檔上限 50 MB。不支援 PSD、AI、TIFF、HEIC 等編輯或特殊格式，請先轉成 PNG／GIF／WebP。

錄音僅保存在 `%APPDATA%/pocket-pet/assets`（Electron 實際使用的 userData 目錄）；程式不會上傳聲音。若麥克風不可用，可在 Windows「隱私權與安全性 → 麥克風」允許桌面應用程式存取。使用無簽章的自製程式可能出現 Windows 信任提示。

## 開發與打包

安裝 Node.js 22+ 與 pnpm 後：

```sh
pnpm install
pnpm start
pnpm test
pnpm build
```

若 pnpm 提示忽略 Electron 建置腳本，執行 `pnpm approve-builds` 並允許 electron，或執行 `node node_modules/electron/install.js`。Windows portable 成品位於 `release/`。GitHub 儲存庫：https://github.com/ronby7777-jpg/classtest。

## 結構

- `main.cjs`：原生視窗、移動、系統匣、素材保存與錄音寫入。
- `model.cjs`：設定校正與移動邊界計算。
- `preload.cjs`：隔離的 IPC 介面。
- `ui/`：設定視窗與桌寵；GIF 直接使用圖片元件播放。
- `test/`：邊界與設定校正測試。

目前為 Windows 版。麥克風實際收音品質與多螢幕實機配置需在目標電腦確認。

若 NSIS 打包遇到路徑過長，請將專案放在較短的目錄再安裝依賴，例如 C:\dev\pet。

