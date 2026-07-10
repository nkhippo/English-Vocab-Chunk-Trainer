#!/usr/bin/env python3
"""Merge 5 Mode A/B contexts into each item in data/current/items.json."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ITEMS_PATH = ROOT / "data/current/items.json"

CLOZE_MARKERS = ("xx", "yy", "zz")


def find_span(text: str, needle: str) -> tuple[int, int]:
    start = text.find(needle)
    if start < 0:
        raise ValueError(f"needle not found: {needle!r} in {text!r}")
    return start, start + len(needle)


def build_cloze_spans(text: str, answers: list[str]) -> list[dict]:
    spans = []
    cursor = 0
    for answer in answers:
        start = text.find(answer, cursor)
        if start < 0:
            raise ValueError(f"cloze answer not found: {answer!r} in {text!r}")
        end = start + len(answer)
        spans.append({"start": start, "end": end, "answer": answer})
        cursor = end
    return spans


def ctx(
    item_id: str,
    index: int,
    text_en: str,
    text_ja: str,
    target: str,
    cloze_answers: list[str],
    scene: str,
    register: str = "neutral",
) -> dict:
    t_start, t_end = find_span(text_en, target)
    return {
        "id": f"{item_id}_c{index}",
        "text_en": text_en,
        "text_ja": text_ja,
        "target_span": {"start": t_start, "end": t_end},
        "cloze_spans": build_cloze_spans(text_en, cloze_answers),
        "scene": scene,
        "register": register,
    }


PASSAGES: dict[str, list[dict]] = {
    "make_a_decision": [
        ctx(
            "make_a_decision",
            1,
            "Last week, our team needed to solve a big problem. After the long meeting, the manager finally made a decision. Everyone agreed with the plan.",
            "先週、私たちのチームは大きな問題を解決する必要がありました。長い会議の後、マネージャーはついに決断しました。みんながその計画に賛成しました。",
            "made a decision",
            ["made", "decision"],
            "business_meeting",
        ),
        ctx(
            "make_a_decision",
            2,
            "Mia looked at the two schools for a long time. She wanted to make a decision before dinner. Her parents waited quietly in the kitchen.",
            "ミアは二つの学校を長いあいだ見比べました。夕食前に決断したかったのです。両親は台所で静かに待っていました。",
            "make a decision",
            ["make", "decision"],
            "family_conversation",
        ),
        ctx(
            "make_a_decision",
            3,
            "The coach did not want to rush. He needed more time to make a decision about the starting team. The players practiced while they waited.",
            "コーチは急ぐつもりはありませんでした。先発メンバーについて決断する時間がもっと必要でした。選手たちは待ちながら練習しました。",
            "make a decision",
            ["make", "decision"],
            "sports_team",
        ),
        ctx(
            "make_a_decision",
            4,
            "At the travel desk, Ken compared two tickets. He made a decision and bought the cheaper flight. Then he called his sister with the news.",
            "旅行カウンターでケンは二つのチケットを比べました。彼は決断して、安い方の便を買いました。それから妹にその知らせを電話しました。",
            "made a decision",
            ["made", "decision"],
            "travel_desk",
        ),
        ctx(
            "make_a_decision",
            5,
            "The doctor explained both options carefully. Ana had to make a decision about the treatment. She asked one more question before she chose.",
            "医者は両方の選択肢を丁寧に説明しました。アナは治療について決断しなければなりませんでした。選ぶ前にもう一つ質問しました。",
            "make a decision",
            ["make", "decision"],
            "clinic",
            "formal",
        ),
    ],
    "look_forward_to": [
        ctx(
            "look_forward_to",
            1,
            "Tom sent a short message to his friend. He said he looked forward to their trip next month. They planned to visit the sea together.",
            "トムは友人に短いメッセージを送りました。来月の旅行を楽しみにしていると書きました。二人で海へ行く予定です。",
            "looked forward to",
            ["looked", "forward", "to"],
            "friend_message",
        ),
        ctx(
            "look_forward_to",
            2,
            "Every Friday, the class talks about the weekend. The students look forward to the school festival. They practice songs after lunch.",
            "毎週金曜、クラスは週末の話をします。生徒たちは学園祭を楽しみにしています。昼休みのあとに歌の練習をします。",
            "look forward to",
            ["look", "forward", "to"],
            "school",
        ),
        ctx(
            "look_forward_to",
            3,
            "Sara packed her bag early in the morning. She looked forward to seeing her grandparents again. The train left at nine.",
            "サラは朝早くかばんを詰めました。祖父母にまた会えるのを楽しみにしていました。電車は9時に出発しました。",
            "looked forward to",
            ["looked", "forward", "to"],
            "family_visit",
        ),
        ctx(
            "look_forward_to",
            4,
            "After a hard week at work, Rina wrote in her diary. She looked forward to a quiet Sunday at home. She bought tea and a new book.",
            "忙しい一週間のあと、リナは日記に書きました。静かな日曜の家での時間を楽しみにしていました。お茶と新しい本を買いました。",
            "looked forward to",
            ["looked", "forward", "to"],
            "home_rest",
        ),
        ctx(
            "look_forward_to",
            5,
            "The team finished the project on Friday. Now they look forward to the holiday next week. Their manager thanked them for the work.",
            "チームは金曜にプロジェクトを終えました。今は来週の休みを楽しみにしています。マネージャーは仕事への感謝を伝えました。",
            "look forward to",
            ["look", "forward", "to"],
            "office",
        ),
    ],
    "whats_up": [
        ctx(
            "whats_up",
            1,
            "Leo met his classmate near the station. He smiled and said, What's up? They talked about the homework for a minute.",
            "レオは駅の近くでクラスメートに会いました。笑って「調子どう？」と言いました。宿題の話を少ししました。",
            "What's up?",
            ["What's up?"],
            "station_chat",
            "informal",
        ),
        ctx(
            "whats_up",
            2,
            "Maya opened the chat app after school. Her friend wrote, What's up? Maya answered with a photo of her new cat.",
            "マヤは放課後にチャットアプリを開きました。友だちが「調子どう？」と書いていました。マヤは新しい猫の写真で返事しました。",
            "What's up?",
            ["What's up?"],
            "chat_app",
            "informal",
        ),
        ctx(
            "whats_up",
            3,
            "On the phone, Ben sounded tired. His brother asked, What's up? Ben said he had a long day at work.",
            "電話でベンは疲れた声でした。兄が「どうしたの？」と聞きました。ベンは仕事で長い一日だったと言いました。",
            "What's up?",
            ["What's up?"],
            "phone_call",
            "informal",
        ),
        ctx(
            "whats_up",
            4,
            "In the park, two friends sat on a bench. One of them asked, What's up? The other talked about a funny movie.",
            "公園で二人の友だちがベンチに座っていました。一人が「調子どう？」と聞きました。もう一人はおもしろい映画の話をしました。",
            "What's up?",
            ["What's up?"],
            "park",
            "informal",
        ),
        ctx(
            "whats_up",
            5,
            "Before class started, Nina walked into the room. Her friend waved and said, What's up? They laughed and opened their books.",
            "授業の前にニナが教室に入りました。友だちが手を振って「調子どう？」と言いました。二人は笑って本を開きました。",
            "What's up?",
            ["What's up?"],
            "classroom",
            "informal",
        ),
    ],
    "take_a_picture": [
        ctx(
            "take_a_picture",
            1,
            "At the museum, the guide stopped near a painting. Many visitors wanted to take a picture. A guard asked them not to use flash.",
            "美術館でガイドが絵の前で立ち止まりました。多くの来館者が写真を撮りたがっていました。警備員はフラッシュを使わないよう頼みました。",
            "take a picture",
            ["take", "picture"],
            "museum",
        ),
        ctx(
            "take_a_picture",
            2,
            "The children stood under the cherry trees. Their teacher said they could take a picture together. Everyone smiled for the camera.",
            "子どもたちは桜の木の下に立ちました。先生は一緒に写真を撮ってよいと言いました。みんなカメラに向かって笑いました。",
            "take a picture",
            ["take", "picture"],
            "school_trip",
        ),
        ctx(
            "take_a_picture",
            3,
            "On the beach, Yuki found a bright shell. She asked her friend to take a picture of it. The waves were quiet that morning.",
            "海岸でユキはきれいな貝を見つけました。友だちにそれを写真に撮ってほしいと頼みました。その朝、波は静かでした。",
            "take a picture",
            ["take", "picture"],
            "beach",
        ),
        ctx(
            "take_a_picture",
            4,
            "Before they left the restaurant, the family took a picture. The waiter offered to hold the phone. They thanked him and went home.",
            "レストランを出る前に、家族は写真を撮りました。店員が電話を持ってあげると申し出ました。彼らは礼を言って帰りました。",
            "took a picture",
            ["took", "picture"],
            "restaurant",
        ),
        ctx(
            "take_a_picture",
            5,
            "During the city walk, Ken stopped at the old bridge. He wanted to take a picture for his blog. The light was soft and warm.",
            "街歩きの途中、ケンは古い橋で立ち止まりました。ブログ用に写真を撮りたかったのです。光はやわらかく温かい色でした。",
            "take a picture",
            ["take", "picture"],
            "city_walk",
        ),
    ],
    "have_breakfast": [
        ctx(
            "have_breakfast",
            1,
            "Every morning, Hana sits by the window. She likes to have breakfast with toast and tea. Then she checks the weather on her phone.",
            "毎朝、ハナは窓のそばに座ります。トーストとお茶で朝食をとるのが好きです。そのあと電話で天気を確認します。",
            "have breakfast",
            ["have", "breakfast"],
            "home_morning",
        ),
        ctx(
            "have_breakfast",
            2,
            "At the hotel, guests can have breakfast from seven. The room is bright and quiet. Many people choose eggs and fruit.",
            "ホテルでは7時から朝食をとれます。部屋は明るく静かです。多くの人が卵と果物を選びます。",
            "have breakfast",
            ["have", "breakfast"],
            "hotel",
        ),
        ctx(
            "have_breakfast",
            3,
            "Before the exam, Jun woke up early. He had breakfast slowly and reviewed his notes. He felt a little calmer after that.",
            "試験の前、ジュンは早く起きました。ゆっくり朝食をとってノートを見直しました。そのあと少し落ち着きました。",
            "had breakfast",
            ["had", "breakfast"],
            "exam_day",
        ),
        ctx(
            "have_breakfast",
            4,
            "On Sundays, the family has breakfast together. They talk about plans for the afternoon. The kitchen smells like coffee.",
            "日曜は家族で一緒に朝食をとります。午後の予定について話します。台所はコーヒーの香りがします。",
            "has breakfast",
            ["has", "breakfast"],
            "family_sunday",
        ),
        ctx(
            "have_breakfast",
            5,
            "After the morning run, Leo was hungry. He went home to have breakfast. A bowl of rice and soup felt perfect.",
            "朝のランニングのあと、レオはお腹が空いていました。家に帰って朝食をとることにしました。ご飯とスープがちょうどよかったです。",
            "have breakfast",
            ["have", "breakfast"],
            "after_exercise",
        ),
    ],
    "do_homework": [
        ctx(
            "do_homework",
            1,
            "After dinner, Sora sat at her desk. She needed to do homework before she watched TV. Her brother played quietly in the next room.",
            "夕食のあと、ソラは机に座りました。テレビを見る前に宿題をしなければなりませんでした。弟は隣の部屋で静かに遊んでいました。",
            "do homework",
            ["do", "homework"],
            "home_evening",
        ),
        ctx(
            "do_homework",
            2,
            "In the library, two students shared a table. They wanted to do homework without noise. The librarian smiled and walked past.",
            "図書館で二人の生徒が机を共有していました。静かに宿題をしたかったのです。司書は微笑んで通り過ぎました。",
            "do homework",
            ["do", "homework"],
            "library",
        ),
        ctx(
            "do_homework",
            3,
            "On the train, Ken opened his notebook. He tried to do homework between stations. The ride was short, so he worked fast.",
            "電車の中でケンはノートを開きました。駅と駅のあいだで宿題をしようとしました。乗車時間が短いので急いで取り組みました。",
            "do homework",
            ["do", "homework"],
            "commute",
        ),
        ctx(
            "do_homework",
            4,
            "Mia finished dinner and washed the dishes. Then she did homework for English class. She checked the answers twice.",
            "ミアは夕食を終えて皿を洗いました。それから英語の宿題をしました。答えを二度確認しました。",
            "did homework",
            ["did", "homework"],
            "home_study",
        ),
        ctx(
            "do_homework",
            5,
            "The teacher gave the class a short reminder. Everyone should do homework by Friday. A few students wrote the date in their planners.",
            "先生はクラスに短い注意をしました。金曜までに宿題をするように、とのことでした。何人かの生徒は手帳に日付を書きました。",
            "do homework",
            ["do", "homework"],
            "classroom",
        ),
    ],
    "catch_a_cold": [
        ctx(
            "catch_a_cold",
            1,
            "After the rainy game, the players felt tired. Two of them caught a cold the next day. The coach told them to rest at home.",
            "雨の試合のあと、選手たちは疲れていました。翌日、二人は風邪をひきました。コーチは家で休むように言いました。",
            "caught a cold",
            ["caught", "cold"],
            "sports",
        ),
        ctx(
            "catch_a_cold",
            2,
            "In winter, many people forget a warm scarf. It is easy to catch a cold on the bus. Drink water and sleep well if you feel weak.",
            "冬は多くの人が暖かいマフラーを忘れます。バスの中で風邪をひきやすいです。体がだるいときは水を飲んでよく寝ましょう。",
            "catch a cold",
            ["catch", "cold"],
            "winter_commute",
        ),
        ctx(
            "catch_a_cold",
            3,
            "Lina stayed late at the office with wet hair. She caught a cold over the weekend. Her friend brought soup to her apartment.",
            "リナは濡れた髪のままオフィスに遅くまでいました。週末に風邪をひきました。友だちがアパートにスープを持ってきました。",
            "caught a cold",
            ["caught", "cold"],
            "office",
        ),
        ctx(
            "catch_a_cold",
            4,
            "The school nurse spoke to the class. She said children often catch a cold in March. She asked them to wash their hands often.",
            "保健室の先生がクラスに話しました。3月は子どもがよく風邪をひくと言いました。手をこまめに洗うよう頼みました。",
            "catch a cold",
            ["catch", "cold"],
            "school_nurse",
        ),
        ctx(
            "catch_a_cold",
            5,
            "After camping by the lake, Dan felt a sore throat. He was afraid he might catch a cold. He went home early and slept.",
            "湖でのキャンプのあと、ダンは喉が痛くなりました。風邪をひくかもしれないと心配しました。早めに帰宅して眠りました。",
            "catch a cold",
            ["catch", "cold"],
            "camping",
        ),
    ],
    "take_a_shower": [
        ctx(
            "take_a_shower",
            1,
            "After football practice, the boys were dirty. They went home to take a shower. Hot water and soap felt wonderful.",
            "サッカーの練習のあと、男の子たちは汚れていました。家に帰ってシャワーを浴びることにしました。お湯と石けんがとても気持ちよかったです。",
            "take a shower",
            ["take", "shower"],
            "after_sports",
        ),
        ctx(
            "take_a_shower",
            2,
            "Before the interview, Aya checked the time. She wanted to take a shower and dress carefully. She left the house at eight.",
            "面接の前、アヤは時間を確認しました。シャワーを浴びて丁寧に服を着たかったのです。8時に家を出ました。",
            "take a shower",
            ["take", "shower"],
            "interview_prep",
        ),
        ctx(
            "take_a_shower",
            3,
            "On hot summer nights, Ken cannot sleep well. He takes a shower and opens the window. Then he reads for a few minutes.",
            "暑い夏の夜、ケンはよく眠れません。シャワーを浴びて窓を開けます。それから数分本を読みます。",
            "takes a shower",
            ["takes", "shower"],
            "summer_night",
        ),
        ctx(
            "take_a_shower",
            4,
            "After the long hike, the group returned to the hotel. Everyone took a shower before dinner. They talked about the mountain path.",
            "長いハイキングのあと、一行はホテルに戻りました。みんな夕食前にシャワーを浴びました。山道の話をしました。",
            "took a shower",
            ["took", "shower"],
            "hotel_after_hike",
        ),
        ctx(
            "take_a_shower",
            5,
            "Mom called from the kitchen. She asked Riku to take a shower before bed. He finished his game and went to the bathroom.",
            "母が台所から呼びました。リクに寝る前にシャワーを浴びるよう言いました。彼はゲームを終えて洗面所へ行きました。",
            "take a shower",
            ["take", "shower"],
            "family_home",
        ),
    ],
    "go_shopping": [
        ctx(
            "go_shopping",
            1,
            "On Saturday morning, Emi made a short list. She planned to go shopping for fruit and bread. The market was busy but friendly.",
            "土曜の朝、エミは短い買い物リストを作りました。果物とパンを買いに行く予定でした。市場は混んでいましたが雰囲気はよかったです。",
            "go shopping",
            ["go", "shopping"],
            "market",
        ),
        ctx(
            "go_shopping",
            2,
            "After work, two friends met at the station. They decided to go shopping for winter coats. The store had a small sale.",
            "仕事のあと、二人の友だちが駅で会いました。冬用コートを買いに行くことにしました。店では小さなセールをしていました。",
            "go shopping",
            ["go", "shopping"],
            "after_work",
        ),
        ctx(
            "go_shopping",
            3,
            "Before the party, Noah checked the fridge. He needed to go shopping for drinks and snacks. He took a cloth bag with him.",
            "パーティーの前、ノアは冷蔵庫を確認しました。飲み物とお菓子を買いに行く必要がありました。布の袋を持って行きました。",
            "go shopping",
            ["go", "shopping"],
            "party_prep",
        ),
        ctx(
            "go_shopping",
            4,
            "Last Sunday, the family went shopping downtown. They bought shoes for the children. Then they ate lunch near the park.",
            "先週の日曜、家族は繁華街へ買い物に行きました。子どもたちの靴を買いました。そのあと公園の近くで昼食をとりました。",
            "went shopping",
            ["went", "shopping"],
            "downtown",
        ),
        ctx(
            "go_shopping",
            5,
            "When guests visit, Hana likes a clean house. She also likes to go shopping for flowers. Fresh flowers make the room bright.",
            "お客さんが来るとき、ハナはきれいな家が好きです。花を買いに行くのも好きです。新鮮な花が部屋を明るくします。",
            "go shopping",
            ["go", "shopping"],
            "home_guest",
        ),
    ],
    "get_up_early": [
        ctx(
            "get_up_early",
            1,
            "During exam week, Yui set two alarms. She had to get up early and review math. The house was quiet at six.",
            "試験週間、ユイは目覚ましを二つセットしました。早く起きて数学を復習しなければなりませんでした。6時の家は静かでした。",
            "get up early",
            ["get", "up", "early"],
            "exam_week",
        ),
        ctx(
            "get_up_early",
            2,
            "Farmers often get up early in summer. They work before the sun becomes too strong. Breakfast tastes better after that work.",
            "農家は夏によく早く起きます。日差しが強くなる前に働きます。そのあとの朝食はよりおいしく感じます。",
            "get up early",
            ["get", "up", "early"],
            "farm",
        ),
        ctx(
            "get_up_early",
            3,
            "For the morning flight, Ken packed the night before. He got up early and checked his passport twice. A taxi waited outside.",
            "朝の便のため、ケンは前の夜に荷物を詰めました。早く起きてパスポートを二度確認しました。外ではタクシーが待っていました。",
            "got up early",
            ["got", "up", "early"],
            "travel_morning",
        ),
        ctx(
            "get_up_early",
            4,
            "On training days, the runners get up early. They meet at the park before school. Cool air helps them run well.",
            "練習のある日、ランナーたちは早く起きます。登校前に公園で集合します。涼しい空気が走りを助けます。",
            "get up early",
            ["get", "up", "early"],
            "running_club",
        ),
        ctx(
            "get_up_early",
            5,
            "Mia does not like dark mornings. Still, she tries to get up early on weekdays. A cup of tea helps her start.",
            "ミアは暗い朝が好きではありません。それでも平日は早く起きようとします。お茶一杯が一日の始まりを助けます。",
            "get up early",
            ["get", "up", "early"],
            "weekday_routine",
        ),
    ],
    "listen_to_music": [
        ctx(
            "listen_to_music",
            1,
            "On the way to school, Rina puts on headphones. She likes to listen to music on the bus. Soft songs make the ride feel shorter.",
            "通学の途中、リナはヘッドホンをつけます。バスの中で音楽を聴くのが好きです。やわらかい曲で乗車時間が短く感じます。",
            "listen to music",
            ["listen", "to", "music"],
            "commute",
        ),
        ctx(
            "listen_to_music",
            2,
            "After dinner, the family cleans the kitchen. Dad likes to listen to music while they work. Everyone moves a little faster.",
            "夕食のあと、家族は台所を片付けます。父は作業中に音楽を聴くのが好きです。みんな少し速く動きます。",
            "listen to music",
            ["listen", "to", "music"],
            "family_chores",
        ),
        ctx(
            "listen_to_music",
            3,
            "Before the big game, the team sat quietly. Some players listened to music to stay calm. The coach gave a short talk later.",
            "大事な試合の前、チームは静かに座っていました。落ち着くために音楽を聴く選手もいました。あとでコーチが短い話をしました。",
            "listened to music",
            ["listened", "to", "music"],
            "pre_game",
        ),
        ctx(
            "listen_to_music",
            4,
            "In the cafe, students study for hours. Many of them listen to music with one earbud. The barista keeps the room warm.",
            "カフェで生徒たちは何時間も勉強します。多くの人が片耳で音楽を聴いています。バリスタは店内を暖かく保っています。",
            "listen to music",
            ["listen", "to", "music"],
            "cafe_study",
        ),
        ctx(
            "listen_to_music",
            5,
            "When she feels stressed, Aya closes her eyes. She listens to music for ten minutes. Then she returns to her homework.",
            "ストレスを感じると、アヤは目を閉じます。10分間音楽を聴きます。それから宿題に戻ります。",
            "listens to music",
            ["listens", "to", "music"],
            "stress_break",
        ),
    ],
}


def main() -> None:
    data = json.loads(ITEMS_PATH.read_text(encoding="utf-8"))
    missing = []
    for item in data["items"]:
        item_id = item["id"]
        passages = PASSAGES.get(item_id)
        if not passages:
            missing.append(item_id)
            continue
        # validate spans
        for p in passages:
            te = p["text_en"]
            ts = p["target_span"]
            assert te[ts["start"] : ts["end"]]
            for cs in p["cloze_spans"]:
                assert te[cs["start"] : cs["end"]] == cs["answer"]
        item["contexts"] = passages
        if item.get("meta"):
            item["meta"]["schema_version"] = "1.2.0"
            item["meta"]["updated_at"] = "2026-07-10T15:00:00.000Z"

    if missing:
        raise SystemExit(f"Missing passages for: {missing}")

    data["schema_version"] = "1.2.0"
    data["generated_at"] = "2026-07-10T15:00:00.000Z"
    ITEMS_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {ITEMS_PATH} with contexts for {len(data['items'])} items ({len(data['items']) * 5} passages)")


if __name__ == "__main__":
    main()
