---
id: pj-2026-07-11-65e5
aliases:
- pj-2026-07-11-65e5
title: v7 スコープ外だが Naoya の判断を仰ぎたい点
created: '2026-07-11'
---

# v7 スコープ外だが Naoya の判断を仰ぎたい点

指示書 §1.3 / §6 に従い、独断実装せず列挙のみ。

---

1. **schema_version 1.2.3**  
   指示書は 1.2.2 指定だが、Insight 公式マージで既に 1.2.2 を使用済み。構造マイグレーションは Dexie 再同期のため **1.2.3** とした。仕様書・指示書の表記を 1.2.3 に揃えてよいか。

2. **nuance_contrast_ja の中身**  
   マイグレーションは `difference_ja` のリネームのみ。対比文として十分な品質かは未評価。設計チャットで文言も書き換えるか、例文補充のみか。

3. **空の `example_en` / `example_ja` を JSON に残すか**  
   指示どおり空文字列を保持している。補充前にキーごと省略する方がよいか。

4. **confusables / common_errors の重複**（領域 C）  
   go_shopping 等。Cursor は触っていない。再生成タイミングの確認。

5. **Mode A/B サイドパネルの IPA**  
   連結タブを消した。`ipa_connected` データは残置。将来 EPT フル引用時にタブを戻す想定でよいか。

6. **i18n の hypernyms / hyponyms キー**  
   UI からは削除したが locale キーは残している。削除してよいか。

7. **GAS enrich プロンプト**  
   `gas/handlers.js` のテンプレートを新スキーマに合わせて更新した。本番反映には **GAS 再デプロイ（v23 等）** が必要。今すぐデプロイしてよいか。

8. **app-specification.md**  
   LearningItem 例示を nuance_contrast_ja / hypernyms 削除に合わせて更新済み。仕様書の版番号（v3.x）を上げる必要があるか。
