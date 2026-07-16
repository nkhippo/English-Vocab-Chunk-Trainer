---
id: pj-2026-07-11-5bc7
aliases:
- pj-2026-07-11-5bc7
title: v8 スコープ外・判断待ち事項
created: '2026-07-11'
---
# v8 スコープ外・判断待ち事項

指示書: `cursor_instruction_v8_mode_a_redesign.md`  
作成: 2026-07-11（Cursor）

---

## 判断待ち

1. **Mode A/B の学習履歴 ▢ を操作可能にするか**  
   指示は「表示のみ」「checkmark 機能の統合を独断でしない」。  
   現状は既存 `CheckmarkRow` を **disabled** で表示し、browse モーダル側の操作は変更していない。  
   Mode A/B でもタップで `mode_a` / `mode_b` カウントを更新してよいか。

2. **左スワイプ未選択時のバウンスバック演出**  
   未選択時はスワイプを無視するのみ。物理バウンスアニメは未実装。必要か。

3. **モバイル sticky の実装方式**  
   フレックス下部固定（中央のみスクロール）で「常にボタン可視」を実現。  
   CSS `position: sticky` への変更が必要か。

---

## 残タスク（設計チャット / 別指示）

| ID | 内容 | 由来 |
|---|---|---|
| R1 | synonyms/antonyms/related_uses の空 example（約 132 スロット）補充 | **完了**（2026-07-11・schema 1.2.5） |
| R2 | confusables / common_errors_ja の役割重複整理・再生成 | **完了**（2026-07-11・schema 1.2.4） |
| R3 | nuance_contrast_ja 文言品質の見直し | v7/v8 §1 |
| R4 | GAS enrich 本番デプロイ（保留継続） | v8 §1 |
| R5 | A2 本生成（2,430 件）+ 量産テンプレへ役割分離ガイドライン反映 | テンプレ v2 **配置済み** / 本生成は未着手 |
| R6 | SRS / Mode C / 音声・GA-RP | Phase 2+ |

---

## 実施済みでクローズした v7 疑問

- schema **1.2.3** 承認・ドキュメント統一
- i18n hypernyms/hyponyms 削除
- app-specification **v3.2**
- 空 example キーは JSON に残す
- IPA 連結タブ削除の維持
