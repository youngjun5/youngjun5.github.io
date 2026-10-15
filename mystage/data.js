/* SoliDeo:MYSTAGE (옛 이름 OFFMIC) — 초기 데이터와 요약 계산.
   팀이 고친 내용은 Supabase(carescript 테이블, id = soli-deo-offmic)에 저장되고, 이 파일은 처음 한 번만 쓰인다.
   저장 행 id와 전역 변수 OFFMIC은 기존 데이터·연락처 암호와 이어져 있어 이름을 바꾸지 않는다.
   schema 2 = 2026-10-14 케어코너즈 회의록 반영. schema 1 데이터는 index.html의 migrate()가 백업 후 교체한다.
   연락처·비상연락처는 여기에 절대 적지 않는다(공개 저장소) — 앱 안에서 암호를 걸어 따로 저장한다.
   _was: schema 1 연락처 행의 역할 — 마이그레이션 때 그 행의 _id(암호 저장분 연결)를 이어받는다. */
(function (root) {
  var DEFAULT = {
    "id": "soli-deo-offmic",
    "title": "SoliDeo:MYSTAGE",
    "subtitle": "My STAGE : 내 무대 (가제)",
    "owner": "CARECENTER",
    "updatedAt": "2026-10-15",
    "overview": [
      { "label": "제목", "value": "My STAGE : 내 무대 (가제). 영어 제목 '마이 스테이지' 확정(같은 제목 영화 없음). 한글은 '나의 무대'보다 '내 무대' 쪽으로 기움(100% 확정 아님)" },
      { "label": "주제", "value": "\"우리는 누구의 영광을 위해 예배하고 있는가?\" 솔리 데오 글로리아를 고백하지만 어느 순간 자신의 실력과 존재를 인정받고 싶어 하는 예배자들의 이야기. 카메라 앞뒤가 다른 것이 아니라 '모습'과 '마음'이 어떻게 다른지를 말한다" },
      { "label": "로그라인", "value": "유명 워십팀 엔플리파이에서 PPT를 담당하지만 자기 교회에서는 리드 보컬을 섬기는 김지은. 예상치 못한 기회로 꿈꾸던 무대에 서게 된 그녀는 팀 안의 경쟁과 갈등, 변화하는 자신의 마음을 마주하며 진정 누구를 위해 찬양하는지 질문하게 된다" },
      { "label": "제작 목적", "value": "예배·찬양 사역에서 놓치기 쉬운 문제(실력과 영성, 인정 욕구, 재정과 사업화, 리더십과 권위, 팀원 갈등)를 현실적으로 비춰 사역의 동기를 돌아보게 한다. 특정 팀이나 개인 비판이 아니라 누구에게나 있는 연약함과 모순을 보여준다" },
      { "label": "던지는 질문", "value": "하나님을 예배하는가, 예배하는 나를 사랑하는가? / 하나님의 영광인가, 사람의 인정인가? / 무대 위와 밖에서 같은 예배자인가? / 아무도 알아주지 않고 무대에 못 서도 기쁨으로 예배할 수 있는가?" },
      { "label": "키워드", "value": "예배의 본질, 영광의 방향, 인정 욕구, 리더십과 권위, 회개와 회복, 문화와 예술, 실력과 영성, 무대와 일상, 경쟁과 질투, 사역과 취미, 개인과 공동체" },
      { "label": "연출 방향", "value": "주인공 시점(POV) + 나레이션. 주인공은 대사보다 나레이션 위주, 팀원들을 지켜보는 관찰자. 좋은 사람/나쁜 사람으로 나누지 않는다(주인공을 혼내던 리더가 나중에 가장 먼저 돕는 식). 보는 내내 '잔잔한 회개'가 이어지게" },
      { "label": "가장 조심할 점", "value": "찬양팀을 '까는' 영화가 되지 않게. 케어코너즈는 찬양팀이 아니라서 외부 팀이 찬양팀을 소재로 만든 영화로 예민하게 받아들여질 수 있다. 아이자야 측 조성민 감독이 특히 관심을 보이는 중" },
      { "label": "분량", "value": "약 70분 구상. 촬영 후 100분이 나오면 90분 이내로 편집. 80분 이하로는 만들기 어려움" },
      { "label": "상영 조건", "value": "1월 말 컨퍼런스, 배정 90분(작년·재작년 2시간). A안 80분 상영 + 목사님 메시지 10분 / B안 90분 풀 상영, 메시지 없음. 90분이 확정인지 포스터 표기뿐인지 확인 필요" },
      { "label": "완성 목표", "value": "촬영은 늦어도 12월 안에 끝내고 1월 집중 편집, 1월 말 상영. 11월~1월 외부 사역은 전부 취소" },
      { "label": "주연", "value": "수인 — 김지은(글로리아) 역. 김포(목사님 댁)와 가까워 개인·나레이션 장면은 언제든 촬영 가능" },
      { "label": "음악·저작권", "value": "아이자야 곡(사용 허락 받음)과 자체 주제곡 \"Hide Me in You\"만 쓴다. 그 외 곡은 절대 사용하지 않음" },
      { "label": "복장·소품 규칙", "value": "숫자·그림·마스코트·로고·글자 있는 옷 금지(AI가 글자를 왜곡, 줄무늬는 괜찮음). 무대 뒤 캐릭터 소품 치우기, 눈에 띄는 글자·인쇄물은 가리기(작은 글씨는 무방). 줌 미팅 때 출연자에게 공지" },
      { "label": "AI 활용", "value": "집회 와이드샷은 관객 약 200명 AI 생성, 클로즈업만 실제 인원. 무대 조명·배경·의상(대사 없는 인물)은 AI로 변경, 규모는 다니엘기도회 정도. 공간 레퍼런스를 먼저 만들어 배경 일관성 유지. 립싱크는 레퍼런스 없이 안 맞음 → 연주 장면은 실제로 찍고 얼굴·의상만 교체. 불참 대비 배우별 360도 사진" },
      { "label": "촬영·음향 방식", "value": "연주 장면은 파트별(건반만, 1절만, 코러스만 등)로 나눠 찍고 믹스. 멀티트랙은 강성 감독님(확인 필요)이 마스터링해서 전달. 스토리보드·콘티를 미리 그려 현장 즉흥 결정을 없앤다. 편집 난이도 높음" },
      { "label": "협찬", "value": "이롬(두유·건강주스) PPL 진행 의사 확인, 구디백용 최소 40세트 요청. 간식 챙겨오는 인물이 \"하나 드세요\" 건네는 장면 등" },
      { "label": "후원 조건", "value": "백석대: 캠퍼스가 1회 정도 나와야 함(주인공 대학원생·보컬 레슨 설정). 숏 버전에서는 삭제 가능" },
      { "label": "병행 작업", "value": "약국 영화(옛 콜택시)가 2027년 2월 초 완성 목표다. 같은 인력이면 촬영·편집 일정이 겹치는지 확인 필요" }
    ],
    "masterSchedule": [
      { "order": 1, "stage": "줌 미팅", "content": "웨이브 팀(목~금): 목소리 톤, 쪽대본 낭독, 복장·촬영 규칙 안내 / 기드온 팀: 토요일 밤 / 녹음 세션(일렉·R&B 보컬 등): 주말 또는 다음 주", "due": "10/15~10/22", "owner": "미정", "status": "진행 전" },
      { "order": 2, "stage": "인물 설정 자료", "content": "기드온워십 인물 관계(커플·몰래 연애·갈등 등) 정리 자료 수령 — 의정부 광명교회 측", "due": "이번 주", "owner": "미정", "status": "진행 전" },
      { "order": 3, "stage": "일정·인원 확정", "content": "웨이브 멤버별 가능 요일·출연 여부, 천안·동탄 출연자 일정 확인 후 각 팀에 촬영 날짜 통보. 병재 근무 요일 조정 문의", "due": "최대한 빨리", "owner": "미정", "status": "진행 전" },
      { "order": 4, "stage": "대본 작성", "content": "줌 미팅 결과 반영해 등장인물 확정·대본 작성. 결정적인 말을 할 배역 결정", "due": "10월 말", "owner": "미정", "status": "진행 전" },
      { "order": 5, "stage": "팀별 대본 리딩", "content": "팀별로 해당 장면만(전체 소집 없음). 카톡 쪽대본을 화면으로 보며 돌아가며 낭독, 이후 목소리·연기 보고 대본 최종 확정", "due": "10월 말경", "owner": "미정", "status": "진행 전" },
      { "order": 6, "stage": "확인 사항", "content": "컨퍼런스 세션 90분 확정 여부 / 일렉 대체 봉사자 확정", "due": "미정", "owner": "미정", "status": "진행 전" },
      { "order": 7, "stage": "주제곡 수정", "content": "\"Hide Me in You\" BPM 올리고 보이스 자연스럽게(이전 버전이 낫다는 의견). 유혜경 감독님(확인 필요)께 요청", "due": "촬영 전", "owner": "미정", "status": "진행 전" },
      { "order": 8, "stage": "촬영 준비", "content": "전주 공간 레퍼런스, 스토리보드·콘티, 배우별 360도 사진(조명 통일), 의상 계획(주조연, 수인 사모님 협의)", "due": "11/4 전", "owner": "미정", "status": "진행 전" },
      { "order": 9, "stage": "협찬", "content": "이롬 PPL 협의, 구디백 제품 40세트 수령. 이민아 집사님 연락", "due": "미정", "owner": "미정", "status": "진행 전" },
      { "order": 10, "stage": "촬영", "content": "11/4 전주 웨이브부터. 약 7주, 주 1~2회, 14~15회. 전주·의정부·기획사 같은 큰 촬영을 먼저 끝냄", "due": "11/4 ~ 12월 중순", "owner": "미정", "status": "진행 전" },
      { "order": 11, "stage": "편집·AI·믹싱", "content": "편집, AI 합성(관객·조명·의상), 색보정, 사운드 믹싱", "due": "1월 집중", "owner": "미정", "status": "진행 전" },
      { "order": 12, "stage": "자막", "content": "영어 대사·가사 한국어 자막. 영어·중국어 자막(이전 회의 기준, 유지 여부 확인 필요)", "due": "편집 완료 후", "owner": "미정", "status": "진행 전" },
      { "order": 13, "stage": "완성·상영", "content": "컨퍼런스 상영", "due": "2027년 1월 말", "owner": "미정", "status": "진행 전" }
    ],
    "shootDays": [
      { "date": "11/4(수)~5(목)", "callTime": "", "shootTime": "", "location": "전주 웨이브 교회", "scenes": "S1, S2, S4, S6, S8 등 엔플리파이 장면", "cast": "수인, 엔플리파이 팀(웨이브)", "parking": "", "meals": "", "notes": "첫 촬영. 웨이브 일정 확인 후 최종 확정, 안 되면 의정부 먼저. 수요일 숙박 또는 당일 복귀. 병재는 목요일 근무" },
      { "date": "11/7(토)", "callTime": "", "shootTime": "", "location": "미정", "scenes": "", "cast": "", "parking": "", "meals": "", "notes": "추가 촬영 또는 휴식. 4~5일 촬영분을 먼저 편집·AI 작업해 보고 판단. 병재 토요일 불가(12/5까지)" },
      { "date": "11/15(주일) 19시 이후 (유력)", "callTime": "", "shootTime": "19:00~", "location": "의정부 광명교회", "scenes": "S3, S7, S15 등 기드온 장면", "cast": "수인, 기드온 팀, 목사님 역", "parking": "", "meals": "", "notes": "수·목은 밤 11시 이후만 가능해서 주일 유력. 팀이 한의원 근무로 늦게 합류 → 우리가 먼저 가서 세팅·리허설·조명" },
      { "date": "날짜 미정 (전주 2차)", "callTime": "", "shootTime": "", "location": "전주 웨이브 교회", "scenes": "엔플리파이 나머지", "cast": "수인, 엔플리파이 팀", "parking": "", "meals": "", "notes": "전주는 총 3~4일 예상. 갈 때마다 이틀 연속 되는 날로" },
      { "date": "날짜 미정 (녹음실)", "callTime": "", "shootTime": "", "location": "녹음실(기획사)", "scenes": "S9, S10", "cast": "수인, PD, 남자 보컬, 일렉, R&B 보컬, 베이스, 건반", "parking": "", "meals": "", "notes": "전주·의정부 사이 빈 날에 배치" },
      { "date": "11월 말 (백석대)", "callTime": "", "shootTime": "", "location": "백석대 (천안)", "scenes": "S5", "cast": "수인, 교수(조서희), 선배(천안 지원자)", "parking": "", "meals": "", "notes": "천안 지원자 일정에 맞춰 당일치기. 후원 조건 씬이라 촬영 허가 먼저" },
      { "date": "날짜 미정 (동탄)", "callTime": "", "shootTime": "", "location": "동탄", "scenes": "교수 신앙 조언 장면", "cast": "수인, 교수(조서희)", "parking": "", "meals": "", "notes": "백석대 레슨 외 장면은 동탄에서 따로 가능" },
      { "date": "수시 (개인·나레이션)", "callTime": "", "shootTime": "", "location": "김포 등", "scenes": "S11, S13, S14 일부, 나레이션", "cast": "수인", "parking": "", "meals": "", "notes": "목사님과 함께 지내 언제든 가능. 클라이맥스 S13 포함" }
    ],
    "characters": [
      { "name": "김지은 (글로리아)", "team": "주인공", "actor": "수인", "traits": "28세, 선교사 자녀로 해외 성장, 영어가 더 편함, 한국 3년 차. 백석대 대학원생, 보컬 레슨 수강. 엔플리파이 보컬로 입단 1년째인데 여전히 PPT 가사 담당, 교회(기드온)에선 리드 보컬. 엔플리파이 자부심으로 교회 팀원을 은근히 깔봄", "notes": "예배하고 싶다고 믿지만 사실은 무대와 인정에 대한 갈망이 더 크다는 걸 주변 사람을 통해 발견. 초반 어둡고 주눅 → 후반 밝고 기쁨. 영어 통화 장면은 한국어 자막" },
      { "name": "문성경", "team": "엔플리파이", "actor": "미정", "traits": "돌직구. 말이 세지만 맞는 소리라 사람들이 상처받음", "notes": "이로운의 기타 스폰서에 \"그건 팀 것\"이라고 지적" },
      { "name": "김우식", "team": "엔플리파이", "actor": "미정", "traits": "덩치 큼. 모든 걸 기도와 성령에 의존 (\"우리 기도하고 가자\")", "notes": "" },
      { "name": "정다은", "team": "엔플리파이", "actor": "미정", "traits": "팀 내 어린 편, 원래 디자인. 음향 디렉터처럼 믹싱하며 톡백으로 리더·보컬·건반 싸움을 다 듣는 센 캐릭터 (\"연습하는 시간보다 싸우는 시간이 더 많아\")", "notes": "인스타 보고 끼가 있다고 판단" },
      { "name": "이로운", "team": "엔플리파이", "actor": "미정", "traits": "기타 스폰서를 받고 좋아함", "notes": "문성경과 갈등" },
      { "name": "김기석 (확인 필요)", "team": "엔플리파이", "actor": "확인 필요", "traits": "", "notes": "신학교 후배 아내 등 관련 인물 출연 가능 여부 확인 중" },
      { "name": "리더 (주인공을 혼내는 인물)", "team": "엔플리파이", "actor": "미정", "traits": "책임감 강함. 처음엔 주인공을 혼내지만 나중에 힘들 때 가장 먼저 돕는다", "notes": "실제 리더(강성 감독 아내, 곡 선정·작곡)는 연기 부담으로 출연 제외" },
      { "name": "엔플리파이 구성", "team": "엔플리파이", "actor": "웨이브 팀", "traits": "주조연 6명(대사·스토리 임팩트) + 조연 6명(대사 3~4줄 이내)", "notes": "실제 웨이브 멤버가 모델, 이름·나이는 가상. 줌 미팅·연기 확인 후 바뀔 수 있음" },
      { "name": "기드온워십 구성", "team": "기드온", "actor": "의정부 광명교회 팀", "traits": "8명 정도, 실제 출연은 5명 내외, 나머지 엑스트라. 본질적 예배를 추구하는 사람과 유명해지려는 사람이 공존", "notes": "에피소드: 이사야 곡 커버로 조회수 노림, 예배 직전·설교 중 휴대폰 게임. 인물 관계 자료 수령 전" },
      { "name": "교회 동생", "team": "기드온", "actor": "미정", "traits": "주인공에게 컨퍼런스 무대에 서냐고 묻는다", "notes": "" },
      { "name": "목사님 (부목사 역)", "team": "기드온", "actor": "박주연 (확인 필요)", "traits": "진정한 예배가 무엇인지 말해주는 인물", "notes": "결정적인 말을 교수가 할 수도 있음(미정)" },
      { "name": "교수", "team": "백석대", "actor": "조서희", "traits": "정석 발성", "notes": "연기 95점. 신앙적 조언 장면은 동탄에서 별도" },
      { "name": "대학원생 선배", "team": "백석대", "actor": "천안 거주 지원자", "traits": "덩치 크고 흑인 소울 스타일 찬양. 교수와 '소울'을 두고 코믹하게 주고받음", "notes": "연기 영상 미제출" },
      { "name": "PD", "team": "녹음실", "actor": "미정", "traits": "곡을 가로채려는 음악 업계 인물", "notes": "철원 R&B 보컬을 이 역으로 쓰는 안 있음. 예전 '레이블 대표' 구상과 합칠지 미정" },
      { "name": "세션 (남자 보컬, 일렉, R&B 보컬, 베이스, 건반)", "team": "녹음실", "actor": "백준(일렉), 철원 R&B 보컬 등", "traits": "", "notes": "연기가 약한 배우는 연주 위주. 대사 줄이고 캐릭터(사이코 1명, 5차원 1명 정도)로 부담 낮춤" },
      { "name": "간식 챙기는 인물", "team": "미정", "actor": "미정", "traits": "모임마다 간식을 챙겨와 \"하나 드세요\"", "notes": "이롬 PPL" }
    ],
    "scenes": [
      { "id": "S1", "location": "엔플리파이 집회", "summary": "로고 직후 가장 큰 음악. 드럼 킥 → 건반·일렉 → 싱어들이 관객 앞에서 찬양. PPT 담당 주인공의 뒷모습, 슬라이드가 안 넘어가 당황하고 싱어가 톡백으로 \"빨리 넘겨\"", "cast": "수인, 엔플리파이 팀, 관객", "notes": "나레이션 없이 시작. 관객 와이드는 AI, 클로즈업은 현장 직원·집사님" },
      { "id": "S2", "location": "복도, 방송실", "summary": "집회 후 복도에서 리더에게 혼난다(원래 싱어인데 PPT만 하는구나). 방송실에선 위로하는 사람, \"너 이제 찍혔다\"고 겁주는 사람, \"열심히 해도 무대에 못 선다\"는 말. 아무도 없을 때 무대를 걸레질하며 주제곡 한 소절 허밍", "cast": "수인, 리더, 엔플리파이 팀", "notes": "주제곡 MR 멜로디를 이후 중간중간 깔아 귀에 익게" },
      { "id": "S3", "location": "기드온 교회 연습", "summary": "리드 보컬로 연습. 엔플리파이 자부심으로 팀원을 깔보고 아는 척. 교회 동생이 컨퍼런스 무대에 서냐고 묻자 핑계를 댄다. 조회수 노린 커버, 휴대폰 게임하는 팀원", "cast": "수인, 기드온 팀, 동생", "notes": "" },
      { "id": "S4", "location": "엔플리파이 연습", "summary": "팀 안의 갈등. 문성경의 돌직구, 이로운의 기타 스폰서 논쟁, \"우리 기도하고 가자\", 톡백으로 다 듣는 정다은 \"연습하는 시간보다 싸우는 시간이 더 많아\"", "cast": "수인, 엔플리파이 팀", "notes": "이롬 간식 PPL 넣기 좋은 자리" },
      { "id": "S5", "location": "백석대 대학원 보컬 레슨", "summary": "교수와 선배가 발성과 '소울'을 두고 코믹하게 주고받는다", "cast": "수인, 교수, 선배", "notes": "후원 조건 씬, A4 반 페이지. 이야기상 필수 아님, 숏 버전에서 삭제 가능" },
      { "id": "S6", "location": "엔플리파이 큰 집회", "summary": "싱어가 빠져(장례식 등) 처음으로 큰 무대에 선다. 기쁨을 주체하지 못하고 인정 욕구가 드러난다", "cast": "수인, 엔플리파이 팀", "notes": "" },
      { "id": "S7", "location": "기드온 교회", "summary": "엔플리파이 일정만 우선하고 교회 연습은 뒷전. 양쪽 팀에서 갈등", "cast": "수인, 기드온 팀", "notes": "" },
      { "id": "S8", "location": "엔플리파이", "summary": "연애 금지 규정인데 몰래 연애하는 커플을 발견. '저 자매가 빠지면 내 자리가 생긴다, 하나님이 주신 기회'라고 착각하지만, 고자질 대신 그 친구에게 \"알면서 모른 척하는 것도 힘들어서 말한다\"고 이야기한다", "cast": "수인, 커플 역", "notes": "커플 배역은 인물 관계 자료 받고 결정" },
      { "id": "S9", "location": "녹음실(기획사)", "summary": "가이드 녹음 아르바이트 중. PD가 커피 사러 나가며 녹음 버튼을 눌러둔 사이, 목을 풀려고 부른 자작곡이 녹음된다", "cast": "수인, PD", "notes": "" },
      { "id": "S10", "location": "녹음실", "summary": "PD가 동의 없이 세션을 모아 다른 남자 보컬을 메인으로 세우고 주인공은 피처링 취급, 곡을 빼앗으려 한다. 가요 스타일로 부르라 하자 \"그렇게 부르려고 만든 곡이 아니다\"며 녹음 중단. '뭐가 찬양인데?'라는 물음에 답하지 못한다", "cast": "수인, PD, 남자 보컬, 일렉, R&B 보컬, 베이스, 건반", "notes": "음악 업계의 사기성도 일부 표현" },
      { "id": "S11", "location": "양쪽 팀", "summary": "\"여기서도 저기서도 예배자가 아니었다\"는 걸 발견. 무대에서 내려오고 교회 리드 보컬도 내려놓는다(양쪽을 다 놓침)", "cast": "수인", "notes": "" },
      { "id": "S12", "location": "기드온 교회", "summary": "목사님의 메시지: 진정한 예배는 무대 위도, 무대 뒤도, 녹음실도 아닌, 아무도 없는 자리에서 마이크·악기 없이 마음을 그대로 고백하는 것", "cast": "수인, 목사님 역", "notes": "결정적인 말을 누가 할지 미정(목사님 또는 교수)" },
      { "id": "S13", "location": "집, 상상 속 빈 무대, 일상", "summary": "집에서 혼자 피아노(또는 무반주)로 \"Hide Me in You\". 화면이 바뀌며 상상 속 '아무도 없는 무대'. 벌스2에서 일상(장보기, 청소 등), 코러스 반복", "cast": "수인", "notes": "클라이맥스. 겸손을 노래한 자작곡과 자기 삶이 달랐음을 발견" },
      { "id": "S14", "location": "엔플리파이", "summary": "억지로 하던 PPT·무대 청소를 기쁨으로 한다. 걸레질조차 예배", "cast": "수인, 엔플리파이 팀", "notes": "" },
      { "id": "S15", "location": "기드온 교회, 초등부", "summary": "기드온 리더·목사님을 찾아가 교만을 고백, 팀원들이 반겨 준다. 엔플리파이도 PPT로 기쁘게 계속 섬김. 블랙아웃 후 무대 정중앙에서 노래하는 모습 → 화면이 돌면 초등부(또는 중등부) 예배를 섬기는 중", "cast": "수인, 기드온 팀, 목사님 역, 아이들", "notes": "오픈 엔딩. \"나를 세우신 자리가 최고의 예배의 자리\". 엔딩 크레딧에 주제곡 풀버전. 미성년 출연 동의 필요" }
    ],
    "locations": [
      { "name": "전주 웨이브 교회", "scenes": "S1, S2, S4, S6, S8, S14", "status": "협조 확정. 대관료 없음, 시간 제한 없음, 이미 세팅됨", "address": "", "parking": "", "power": "", "permit": "", "notes": "이동이 멀다. 공간 레퍼런스(구조·옆모습·LED 위치) 미리 제작" },
      { "name": "의정부 광명교회 (기드온워십)", "scenes": "S3, S7, S12, S15", "status": "자발적 지원 팀. 주일 19시 이후 가능", "address": "", "parking": "", "power": "", "permit": "", "notes": "예배당, 연습실, 초등부실 사용 가능 여부" },
      { "name": "백석대 (천안)", "scenes": "S5", "status": "후원 조건. 장소 지정 필요", "address": "", "parking": "", "power": "", "permit": "", "notes": "강의실·연구실·복도 중 어디인지 확정" },
      { "name": "동탄", "scenes": "교수 조언 장면", "status": "미정", "address": "", "parking": "", "power": "", "permit": "", "notes": "교수 거주지" },
      { "name": "녹음실(기획사)", "scenes": "S9, S10", "status": "미정", "address": "", "parking": "", "power": "", "permit": "", "notes": "" },
      { "name": "김포 (목사님 댁) 등", "scenes": "S11, S13, 나레이션", "status": "언제든 가능", "address": "", "parking": "", "power": "", "permit": "", "notes": "클라이맥스는 건반 한 대로 조용한 환경" },
      { "name": "일상 야외 (마트 등)", "scenes": "S13", "status": "미정", "address": "", "parking": "", "power": "", "permit": "", "notes": "공공장소는 허가 확인. 붐 마이크가 눈에 띄지 않게" }
    ],
    "contacts": [
      { "_was": "글로리아 (주연)", "group": "배우", "name": "수인", "role": "김지은(글로리아) 주연", "phone": "", "emergency": "", "availability": "김포, 언제든", "dietHealth": "" },
      { "_was": "백석대 교수", "group": "배우", "name": "조서희", "role": "백석대 교수", "phone": "", "emergency": "", "availability": "79년생, 동탄 거주", "dietHealth": "" },
      { "_was": "대학원생 선배", "group": "배우", "name": "천안 거주 지원자", "role": "대학원생 선배", "phone": "", "emergency": "", "availability": "천안 거주. 연기 영상 미제출", "dietHealth": "" },
      { "_was": "부목사 역", "group": "배우", "name": "박주연", "role": "목사님(부목사) 역", "phone": "", "emergency": "", "availability": "확인 필요", "dietHealth": "" },
      { "_was": "일렉 기타", "group": "배우", "name": "백준", "role": "일렉 (녹음 세션)", "phone": "", "emergency": "", "availability": "서울 교회. 연주 위주 역할", "dietHealth": "" },
      { "_was": "R&B 보컬", "group": "배우", "name": "최재원/민중기 (확인 필요)", "role": "R&B 보컬 또는 PD 역", "phone": "", "emergency": "", "availability": "철원에서 이동. 일정 유연", "dietHealth": "" },
      { "group": "배우", "name": "이은혜", "role": "미정", "phone": "", "emergency": "", "availability": "", "dietHealth": "전직 아나운서, 연기 톤 기대" },
      { "_was": "레이블 대표", "group": "배우", "name": "임지규 (카메오 구상)", "role": "레이블 대표 (PD 역과 합칠지 미정)", "phone": "", "emergency": "", "availability": "미정", "dietHealth": "" },
      { "_was": "드럼, 건반, 베이스", "group": "배우", "name": "미정", "role": "일렉 대체 봉사자 (이롬 형제 역)", "phone": "", "emergency": "", "availability": "원래 일렉 담당이 부친 건강으로 사역을 내려놓음, 섭외 중", "dietHealth": "" },
      { "_was": "앰플리파이 역 찬양팀", "group": "팀 협조", "name": "전주 웨이브 팀", "role": "엔플리파이 역", "phone": "", "emergency": "", "availability": "멤버별 가능 요일 확인 중. 결혼·육아로 갑작스런 불참 가능", "dietHealth": "" },
      { "group": "팀 협조", "name": "강성 감독 (확인 필요)", "role": "웨이브 측. 캐스팅 의견, 멀티트랙 마스터링", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "_was": "기드온 팀 섭외 창구", "group": "팀 협조", "name": "의정부 광명교회", "role": "기드온워십 팀", "phone": "", "emergency": "", "availability": "수·목 23시 이후, 주일 19시 이후", "dietHealth": "" },
      { "group": "팀 협조", "name": "유혜경 감독 (확인 필요)", "role": "주제곡 작업", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "팀 협조", "name": "조성민 감독", "role": "아이자야 측, 영화에 관심", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "_was": "백석대 담당자", "group": "후원", "name": "미정", "role": "백석대 담당자", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "후원", "name": "은희승 대표", "role": "이롬 마케팅 총괄 (PPL)", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "후원", "name": "이민아 집사님", "role": "협찬 연락", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "_was": "감독·연출", "group": "스태프", "name": "이보람 목사님", "role": "케어코너즈", "phone": "", "emergency": "", "availability": "11월~1월 외부 사역 취소", "dietHealth": "" },
      { "_was": "현장 총괄", "group": "스태프", "name": "유수인 사모님", "role": "주연, 의상 협의", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "_was": "촬영", "group": "스태프", "name": "오영준", "role": "촬영", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "_was": "녹음", "group": "스태프", "name": "조예은", "role": "미정", "phone": "", "emergency": "", "availability": "수·목 가능", "dietHealth": "" },
      { "_was": "조명·그립", "group": "스태프", "name": "임병재", "role": "미정", "phone": "", "emergency": "", "availability": "12/5까지 토요일 불가, 수요일 가능, 목요일 근무(조정 문의 중)", "dietHealth": "" },
      { "_was": "음악 녹음·믹싱", "group": "스태프", "name": "최지원", "role": "미정", "phone": "", "emergency": "", "availability": "10/14 회의 불참, 다음 주 재회의", "dietHealth": "" },
      { "_was": "편집·자막", "group": "스태프", "name": "", "role": "편집·자막", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "_was": "가까운 병원·응급 연락", "group": "비상", "name": "", "role": "가까운 병원·응급 연락", "phone": "", "emergency": "", "availability": "", "dietHealth": "" }
    ],
    "equipment": [
      { "category": "카메라", "item": "소니 a7 IV", "qty": "", "owner": "", "storage": "", "schedule": "전 촬영일", "status": "보유" },
      { "category": "렌즈", "item": "", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" },
      { "category": "삼각대·짐벌", "item": "", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" },
      { "category": "조명", "item": "의정부 현장 세팅용. 무대 조명은 AI로 입힘", "qty": "", "owner": "", "storage": "", "schedule": "의정부", "status": "확인 필요" },
      { "category": "조명", "item": "360도 사진 촬영용 (조명 통일)", "qty": "", "owner": "", "storage": "", "schedule": "촬영 전", "status": "확인 필요" },
      { "category": "녹음", "item": "무선 마이크 Comica VM40 (송신기·수신기, 내장 녹음)", "qty": "", "owner": "", "storage": "", "schedule": "붐 사용 씬", "status": "보유" },
      { "category": "녹음", "item": "레코더 Zoom H6 (백업 녹음)", "qty": "", "owner": "", "storage": "", "schedule": "전 촬영일", "status": "보유" },
      { "category": "녹음", "item": "외장 마이크 FineMic", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "보유" },
      { "category": "녹음", "item": "붐 폴, 블림프·데드캣", "qty": "", "owner": "", "storage": "", "schedule": "붐 가능한 실내", "status": "확인 필요" },
      { "category": "녹음", "item": "타임코드 Deity TC-1 (카메라용, H6용)", "qty": "2", "owner": "", "storage": "", "schedule": "전 촬영일", "status": "구매 예정" },
      { "category": "녹음", "item": "바디팩 송수신기와 라발리어 마이크", "qty": "", "owner": "", "storage": "", "schedule": "붐을 못 쓰는 촬영일", "status": "구매 예정" },
      { "category": "음악", "item": "플레이백 스피커, 연주 녹음용 장비 (파트별 촬영)", "qty": "", "owner": "", "storage": "", "schedule": "S1, S4, S6, S10, S13", "status": "필요 여부 확인" },
      { "category": "전원", "item": "배터리, 충전기, 멀티탭", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" },
      { "category": "저장", "item": "메모리 카드, 백업 SSD", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" },
      { "category": "모니터링", "item": "모니터, 헤드폰", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" },
      { "category": "기타", "item": "슬레이트, 가방, 차량, 글자 가림용 천", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" }
    ]
  };

  var TABLES = ["overview", "masterSchedule", "shootDays", "characters", "scenes", "locations", "contacts", "equipment"];

  /* 요약: 진행률(완료 단계 수 / 전체), 다음 할 일('진행 전'인 첫 단계), '미정'·'확인 필요'가 남은 칸 수 */
  function summary(d) {
    d = d || DEFAULT;
    var ms = d.masterSchedule || [];
    var done = ms.filter(function (r) { return r.status === "완료"; }).length;
    var next = ms.filter(function (r) { return r.status === "진행 전"; })[0] || null;
    var open = 0;
    TABLES.forEach(function (k) {
      (d[k] || []).forEach(function (r) {
        Object.keys(r).forEach(function (f) {
          if (f.charAt(0) === "_") return;
          var v = r[f];
          if (typeof v === "string" && (v.indexOf("미정") >= 0 || v.indexOf("확인 필요") >= 0)) open++;
        });
      });
    });
    return { done: done, total: ms.length, next: next, open: open };
  }

  root.OFFMIC = { DEFAULT: DEFAULT, TABLES: TABLES, summary: summary, schema: 2,
    target: "2027년 1월 말", row: "soli-deo-offmic", privateRow: "soli-deo-offmic-private" };
})(window);
