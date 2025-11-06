# 🎤 1 on 1 タイマー - 発話時間可視化アプリ

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Azure](https://img.shields.io/badge/Azure-0078D4?style=flat&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/)

> **Azure Speech Service** の **Speaker Diarization**（話者分離）機能を使用して、1 on 1 ミーティングにおけるマネージャーと部下の発話時間を計測・可視化するアプリケーション

## 📋 概要

このアプリケーションは、1 on 1 ミーティングの質を向上させるために、マネージャーと部下の発話時間のバランスを可視化し、適切なフィードバックを提供します。リアルタイムで音声を認識し、話者を自動的に分離して、発話時間の比率をグラフで表示します。

### ✨ 主な機能

- 🎤 **リアルタイム音声認識** - Azure Speech Service による高精度な音声認識
- 👥 **話者分離** - Speaker Diarization 機能で複数の話者を自動識別
- 📊 **発話時間可視化** - ドーナツグラフで発話時間の比率を直感的に表示
- 💡 **リアルタイムアドバイス** - マネージャーの発話比率に応じたフィードバック
- 💬 **会話履歴** - チャット形式で会話内容を記録・表示
- 💾 **設定の保存** - リージョンとAPIキーをローカルストレージに保存

## 🛠️ 技術スタック

### フロントエンド

| 技術                                     | バージョン | 用途                         |
| ---------------------------------------- | ---------- | ---------------------------- |
| HTML5                                    | Latest     | セマンティックなマークアップ |
| CSS3                                     | Latest     | スタイリング                 |
| [Tailwind CSS](https://tailwindcss.com/) | 3.x (CDN)  | ユーティリティファースト CSS |
| JavaScript                               | ES6+       | インタラクティブな機能       |

### 外部ライブラリ（CDN）

| ライブラリ                                                     | 用途                         |
| -------------------------------------------------------------- | ---------------------------- |
| [Azure Cognitive Services Speech SDK](https://learn.microsoft.com/azure/cognitive-services/speech-service/) | 音声認識と話者分離 |
| [Chart.js](https://www.chartjs.org/) 4.4.0                    | グラフ描画（ドーナツチャート） |
| [Tailwind CSS](https://tailwindcss.com/)                      | CSS フレームワーク           |

### 開発ツール

- **GitHub Copilot** - AI ペアプログラミング
- **GitHub Coding Agent** - 自動コード生成
- **Visual Studio Code** - 推奨 IDE

## 📁 プロジェクト構造

```
📦 1on1-timer-demo/
├── 📄 README.md                 # プロジェクト概要（このファイル）
├── 📄 LICENSE                   # MITライセンス
├── 📁 .github/
│   └── 📄 copilot-instructions.md  # GitHub Copilot 設定
├── 📁 docs/                     # ドキュメント
│   ├── 📄 README.md            # プロジェクト説明
│   └── 📄 specification.md      # 詳細仕様書
└── 📁 src/                      # アプリケーションソース
    ├── 📄 index.html            # メインHTML
    ├── 📁 css/                  # スタイルシート
    │   └── 📄 styles.css        # カスタムCSS
    └── 📁 js/                   # JavaScript
        └── 📄 script.js         # メインスクリプト
```

## 🚀 クイックスタート

### 前提条件

- 📌 **Azure Speech Service リソース**
  - Azure Portal で Speech Service リソースを作成
  - リージョンとサブスクリプションキーを取得
- 📌 **モダンな Web ブラウザ** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
  - マイクへのアクセス許可が必要
- 📌 **Visual Studio Code** (推奨) - 開発時

### セットアップ手順

#### 1. Azure Speech Service の準備

1. [Azure Portal](https://portal.azure.com/) にアクセス
2. 「リソースの作成」から「Speech」を検索
3. Speech Service リソースを作成
4. 「キーとエンドポイント」からリージョンとキーをコピー

#### 2. アプリケーションの起動

```bash
# リポジトリのクローン
git clone https://github.com/tokawa-ms/1on1-timer-demo.git
cd 1on1-timer-demo

# ブラウザーで HTML ファイルを開く
# src/index.html をブラウザーで開くだけ
```

または、直接ブラウザーで `src/index.html` ファイルを開いてください。

#### 3. Azure Speech Service に接続

1. 画面上部の「Azure Speech Service 接続設定」セクションに以下を入力：
   - **リージョン**: 例）`japaneast`, `eastus`, `westeurope`
   - **サブスクリプションキー**: Azure Portal から取得したキー
2. 「接続テスト & 保存」ボタンをクリック
3. 接続成功のメッセージを確認

#### 4. 1 on 1 ミーティングの録音

1. 「録音開始」ボタンをクリック
2. ブラウザーからマイクへのアクセスを許可
3. 1 on 1 ミーティングを開始
4. リアルタイムで会話が文字起こしされ、話者が自動的に分離されます

#### 5. 話者の選択とデータの確認

1. **話者選択**パネルで、検出された話者の中からマネージャーに該当する話者を選択
2. **発話時間比率**グラフで発話のバランスを確認
3. **アドバイス**パネルでフィードバックを確認
4. **会話履歴**で会話内容を確認

#### 6. 録音の停止

1. 「録音停止」ボタンをクリックして録音を終了

## 💡 使い方のポイント

### 発話時間比率のアドバイス

アプリケーションは、マネージャーの発話比率に基づいて以下のアドバイスを自動的に提供します：

| マネージャー発話比率 | アドバイス内容 |
|---------------------|---------------|
| **70%超** | ⚠️ マネージャーの発話時間が多すぎます。もっと部下の話を聞くようにしましょう。1on1では部下が主役です。 |
| **30%未満** | 💡 マネージャーの発話時間が少なすぎます。もっといろいろな話をして、部下をサポートしましょう。 |
| **30%〜70%** | ✅ 良いバランスです！このまま対話を続けましょう。 |

### 効果的な 1 on 1 ミーティングのために

- 📊 **定期的に比率を確認** - リアルタイムで表示されるグラフを見て、発話のバランスを意識しましょう
- 👂 **傾聴を心がける** - 部下の話を引き出すような質問を心がけましょう
- 💬 **会話履歴を振り返る** - ミーティング後に会話内容を確認して、改善点を見つけましょう
- 🔄 **継続的な改善** - 複数回のミーティングでパターンを把握し、改善を続けましょう

## 📊 画面構成

### ヘッダー部分
- **Azure Speech Service 接続設定**
  - リージョン入力フィールド
  - サブスクリプションキー入力フィールド
  - 接続テスト & 保存ボタン

### メインコンテンツ（左側）
- **録音コントロール**
  - 録音開始ボタン
  - 録音停止ボタン
- **話者選択**
  - 検出された話者のリスト
  - マネージャー選択チェックボックス
- **発話時間比率**
  - ドーナツグラフ
  - マネージャー/部下の累計時間と比率
- **アドバイス表示**
  - 発話比率に応じたフィードバック

### メインコンテンツ（右側）
- **会話履歴**
  - チャット形式の会話表示
  - マネージャー（青）と部下（緑）の色分け
  - 発話時刻の表示

## 📱 レスポンシブデザイン対応

このアプリケーションは以下の画面サイズに最適化されています：

- 📱 **モバイル**: 320px〜768px（1カラムレイアウト）
- 📊 **タブレット**: 768px〜1024px（2カラムレイアウト）
- 💻 **デスクトップ**: 1024px 以上（2カラムレイアウト）

画面外周に十分なマージンを設け、要素が画面外にはみ出さないよう調整されています。

## 🔒 セキュリティとベストプラクティス

### ⚠️ 重要な注意事項

このアプリケーションは**技術デモ用のサンプル**です。

### API キーの取り扱い

- ✅ **開発・デモ用途**: UI 入力フィールドで設定、ローカルストレージに保存
- ❌ **本番環境では非推奨**: クライアントサイドにAPIキーを露出させる設計
- 🔐 **本番環境での推奨**: バックエンド API を経由して Azure Speech Service にアクセス

### セキュリティ対策（本番環境用）

本番環境で使用する場合は、以下の対策が必要です：

- 🔐 **バックエンド API の実装**: APIキーをサーバーサイドで管理
- 🔒 **HTTPS 通信の必須化**: 暗号化された通信の使用
- 👤 **認証・認可の実装**: ユーザー認証と適切なアクセス制御
- 📝 **監査ログの記録**: アクセスログと使用状況の追跡

## 🐛 トラブルシューティング

### マイクにアクセスできない

**問題**: ブラウザーがマイクにアクセスできない

**解決方法**:
- ブラウザーの設定でマイクへのアクセスを許可してください
- HTTPS または localhost からアクセスしていることを確認してください
- ブラウザーのアドレスバーのアイコンをクリックして、マイクの許可を確認してください

### 音声認識が動作しない

**問題**: 音声が認識されない

**解決方法**:
- Azure Speech Service の接続設定（リージョンとキー）が正しいか確認してください
- Azure Portal でサブスクリプションが有効か確認してください
- ブラウザーのコンソールログ（F12キー）でエラーメッセージを確認してください
- リージョン名が正しい形式（例: `japaneast`, `eastus`）であることを確認してください

### 話者が検出されない

**問題**: 話者分離が機能しない

**解決方法**:
- マイクが正常に動作しているか確認してください
- 十分な音量で話しているか確認してください
- 背景ノイズが多い場合、認識精度が低下する可能性があります
- 話者間で十分な間隔を空けて話すと、分離精度が向上します

### 接続テストが失敗する

**問題**: 「接続に失敗しました」というエラーが表示される

**解決方法**:
- サブスクリプションキーを正しくコピー&ペーストしてください（余分なスペースなし）
- リージョン名がキーと一致していることを確認してください
- Azure Portal でサブスクリプションが有効で、クォータ内であることを確認してください

## 📖 ドキュメント

詳細な技術仕様と機能については、以下のドキュメントを参照してください：

- [詳細仕様書](docs/specification.md) - 技術仕様、データ構造、実装の詳細
- [プロジェクト概要](docs/README.md) - プロジェクトの詳細説明と使用方法

## 🎯 今後の拡張案

このアプリケーションは、以下のような機能拡張が可能です：

- 📥 **データエクスポート機能**: 録音データを JSON や CSV 形式でエクスポート
- 📈 **時系列グラフ**: 発話時間の推移を時系列で可視化
- 🔄 **セッション比較**: 複数の 1 on 1 セッションを比較分析
- 😊 **感情分析**: Azure Text Analytics を使用した感情分析の追加
- 🤖 **AI サマリー**: OpenAI API を使用した会話のサマリー生成
- 📊 **レポート機能**: PDF レポートの自動生成
- 🔔 **リアルタイム通知**: 発話比率が極端に偏った場合の通知

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

## 💻 開発に使用したツール

このプロジェクトは、以下の AI ツールを活用して開発されました：

- **GitHub Copilot** - コード補完と提案
- **GitHub Copilot Agent** - 自動コード生成と実装

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🆘 サポートとリソース

### Azure Speech Service 関連
- 📖 **Azure Speech Service ドキュメント**: [Microsoft Learn](https://learn.microsoft.com/azure/cognitive-services/speech-service/)
- 🎤 **Speaker Diarization**: [話者分離の概要](https://learn.microsoft.com/azure/cognitive-services/speech-service/get-started-stt-diarization)
- 💰 **価格情報**: [Azure Speech Service の価格](https://azure.microsoft.com/pricing/details/cognitive-services/speech-services/)

### GitHub 関連
- 📖 **GitHub Copilot Docs**: [GitHub Copilot ドキュメント](https://docs.github.com/copilot)
- 💬 **コミュニティ**: [GitHub Discussions](https://github.com/github/copilot-docs/discussions)
- 🐛 **Issue 報告**: [Issues](https://github.com/tokawa-ms/1on1-timer-demo/issues)

## 🙏 謝辞

このアプリケーションは、Azure Speech Service の強力な話者分離機能を活用して実現されています。Microsoft Azure チームに感謝いたします。

---

<div align="center">
  <strong>🎤 1 on 1 ミーティングの質を向上させよう！ 📊</strong><br>
  Made with ❤️ using Azure Speech Service and GitHub Copilot
</div>
