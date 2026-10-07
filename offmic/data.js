/* SoliDeo:OFFMIC — 초기 데이터와 요약 계산.
   팀이 고친 내용은 Supabase(carescript 테이블, id = soli-deo-offmic)에 저장되고, 이 파일은 처음 한 번만 쓰인다.
   연락처·비상연락처는 여기에 절대 적지 않는다(공개 저장소) — 앱 안에서 암호를 걸어 따로 저장한다. */
(function (root) {
  var DEFAULT = {
    "id": "soli-deo-offmic",
    "title": "SoliDeo:OFFMIC",
    "subtitle": "오프 마이크(가제)",
    "owner": "CARECENTER",
    "updatedAt": "2026-10-07",
    "overview": [
      { "label": "제목", "value": "오프 마이크 (가제, 미확정)" },
      { "label": "장르", "value": "음악 드라마. 대사는 짧게, 장면 위주" },
      { "label": "분량", "value": "계획 60분 / 예상 80분 / 상영 배정 90분" },
      { "label": "상영 조건", "value": "컨퍼런스 배정 시간이 90분으로 줄었다. 영화를 전부 상영할지, 약 70분 상영 후 20분 무대를 할지 미결정" },
      { "label": "완성 목표", "value": "2027년 1월 초, 영어·중국어 자막 포함 (이전 팀 회의 기준)" },
      { "label": "촬영 시작", "value": "10월 둘째 주 대본 리딩 직후 (이전 팀 회의 기준)" },
      { "label": "주연", "value": "수인 (글로리아 역)" },
      { "label": "후원 조건", "value": "백석대: 배경과 음악 전공생 설정을 영화에 포함" },
      { "label": "병행 작업", "value": "약국 영화(옛 콜택시)가 2027년 2월 초 완성 목표다. 같은 인력이면 촬영·편집 일정이 겹치는지 확인 필요" }
    ],
    "masterSchedule": [
      { "order": 1, "stage": "사전 확인", "content": "촬영 관련 감독님, 의정부 교회 팀 간사에게 연락. 팀 구성, 실력, 촬영 가능일 확인", "due": "10/7 전후 (녹음에서 '내일쯤')", "owner": "미정", "status": "진행 전" },
      { "order": 2, "stage": "일정·인원 확정", "content": "촬영 가능일 취합 후 출연 인원 확정", "due": "미정", "owner": "미정", "status": "진행 전" },
      { "order": 3, "stage": "대본 작성", "content": "씬 리스트를 대본으로 확장. 결정적인 대사 담당 배역, 엔딩 방향 먼저 결정", "due": "미정", "owner": "미정", "status": "진행 전" },
      { "order": 4, "stage": "배역 섭외", "content": "드럼, 건반, 베이스, 레이블 대표 역", "due": "대본 리딩 전후", "owner": "미정", "status": "진행 전" },
      { "order": 5, "stage": "그룹별 대본 리딩", "content": "줌 미팅으로 앰플리파이 팀, 기드온 팀, 세션(R&B 보컬·일렉), 백석대 출연진을 따로 진행", "due": "10월 둘째 주부터", "owner": "미정", "status": "진행 전" },
      { "order": 6, "stage": "음악 준비", "content": "주제곡과 Suno 자작곡의 사용 권리 확인, 실제 연주 녹음·믹싱 계획", "due": "촬영 전", "owner": "미정", "status": "진행 전" },
      { "order": 7, "stage": "촬영", "content": "팀별로 나눠 촬영. 촬영일별 정보에 날짜 기록", "due": "리딩 직후 시작", "owner": "미정", "status": "진행 전" },
      { "order": 8, "stage": "편집·믹싱", "content": "편집, 색보정, 사운드 믹싱", "due": "촬영 종료 후", "owner": "미정", "status": "진행 전" },
      { "order": 9, "stage": "자막", "content": "영어·중국어 자막", "due": "편집 완료 후", "owner": "미정", "status": "진행 전" },
      { "order": 10, "stage": "완성·상영", "content": "완성본 확정. 컨퍼런스 상영일은 미확인", "due": "2027년 1월 초 (목표)", "owner": "미정", "status": "진행 전" }
    ],
    "shootDays": [
      { "date": "날짜 미정 (백석대)", "callTime": "", "shootTime": "", "location": "백석대 (천안)", "scenes": "S4", "cast": "수인, 교수, 대학원생 선배", "parking": "", "meals": "", "notes": "교수는 천안 1회 출연. 선배도 천안 거주. 후원 조건 씬이라 촬영 허가 먼저" },
      { "date": "날짜 미정 (앰플리파이 팀)", "callTime": "", "shootTime": "", "location": "미정", "scenes": "S1, S3, S10 일부", "cast": "수인, 앰플리파이 팀원", "parking": "", "meals": "", "notes": "실제 찬양팀(전사상 '웨이브팀') 협조. 트렌디한 의상 사전 요청" },
      { "date": "날짜 미정 (기드온 팀)", "callTime": "", "shootTime": "", "location": "의정부 교회 (확인 필요)", "scenes": "S2, S7, S10 일부, S11", "cast": "수인, 기드온 팀원, 부목사 역", "parking": "", "meals": "", "notes": "팀 구성과 실력 확인 후 일정 확정" },
      { "date": "날짜 미정 (세션 녹음)", "callTime": "", "shootTime": "", "location": "스튜디오 또는 연습실", "scenes": "S5, S6", "cast": "수인, R&B 보컬, 일렉 기타, 베이스", "parking": "", "meals": "", "notes": "드럼·건반은 없어도 됨. 일렉은 평일 가능(전사 불확실), R&B 보컬은 일정 유연" },
      { "date": "날짜 미정 (클라이맥스)", "callTime": "", "shootTime": "", "location": "방 또는 세트", "scenes": "S9", "cast": "수인", "parking": "", "meals": "", "notes": "5분 풀곡. 건반 하나로 시작. 일상 인서트(장보기·독서·공원)는 같은 날 또는 별도" },
      { "date": "날짜 미정 (레이블 대표)", "callTime": "", "shootTime": "", "location": "미정", "scenes": "S8", "cast": "수인, 레이블 대표 역", "parking": "", "meals": "", "notes": "배역 미정. 차량 연출(고급 외제차) 가능 여부 확인" }
    ],
    "scenes": [
      { "id": "S1", "location": "앰플리파이 연습 공간", "summary": "보컬로 합격했지만 1년째 PPT만 넘기는 주인공. 무대 쪽에서 가사를 빨리 넘기라고 재촉한다", "cast": "수인, 앰플리파이 팀", "notes": "나레이션으로 상황 설명" },
      { "id": "S2", "location": "기드온 워십 교회", "summary": "리드보컬로 연습. 교회 동생이 앰플리파이 합격을 알고 컨퍼런스 무대에 서냐고 묻는다. 주인공은 핑계를 댄다", "cast": "수인, 기드온 팀, 동생 역", "notes": "동생 배역 미정" },
      { "id": "S3", "location": "앰플리파이", "summary": "엔지니어가 '열심히 해도 무대에 못 선다'고 말하고, 왜 예배하고 싶은지 생각해보라고 한다", "cast": "수인, 엔지니어 역", "notes": "엔지니어 배역 미정. 팀 안의 갈등과 신경전도 보여준다" },
      { "id": "S4", "location": "백석대", "summary": "교수와 대학원생 선배가 발성과 '소울'을 두고 코믹하게 주고받는다", "cast": "수인, 교수, 선배", "notes": "후원 조건 씬. 연기가 좋으면 멘토링 씬 추가" },
      { "id": "S5", "location": "가이드 녹음 스튜디오", "summary": "목을 풀다가 자작곡을 부르고, 프로듀서가 그것을 녹음해 둔다", "cast": "수인, 프로듀서", "notes": "프로듀서 배역 미정" },
      { "id": "S6", "location": "레코딩 장소", "summary": "세션을 모아 합을 맞춘다. R&B 보컬이 곡을 자기 식으로 바꿔 부르고, 주인공은 '뭐가 찬양인데?'라는 물음에 답하지 못한다", "cast": "수인, R&B 보컬, 일렉, 베이스", "notes": "드럼·건반은 없어도 됨" },
      { "id": "S7", "location": "기드온 워십 교회", "summary": "부목사가 상담하듯 묻는다. 이 대사를 교수가 할 수도 있다", "cast": "수인, 부목사 역", "notes": "결정적인 말을 누가 할지 미정" },
      { "id": "S8", "location": "미정", "summary": "한때 신앙인이던 레이블 대표가 '너는 예배자로 실패하지 말라'는 취지로 말한다", "cast": "수인, 레이블 대표 역", "notes": "천사 같은 신비한 장치는 쓰지 않는다" },
      { "id": "S9", "location": "주인공 방, 일상 인서트", "summary": "처음으로 기도하며 묻고, 혼자 자작곡을 부른다. 장보기, 독서, 공원 산책이 교차한다", "cast": "수인", "notes": "5분 풀곡. 1절은 피아노만, 2절부터 세션과 리버브" },
      { "id": "S10", "location": "앰플리파이, 기드온 교회", "summary": "달라진 태도. PPT와 케이블 정리를 즐겁게 하고, 무대 소식에 무덤덤하며, '그 시간에 더 기도하자'고 말한다", "cast": "수인, 양쪽 팀", "notes": "" },
      { "id": "S11", "location": "기드온 교회 초등부", "summary": "부목사가 부탁한 자리가 초등부 찬양 리더. 아이들 앞에서 기쁘게 찬양한다", "cast": "수인, 부목사 역, 초등부 아이들", "notes": "엔딩 후보(미확정). 쿠키 영상으로 넣는 안도 있음. 미성년 출연 동의 필요" }
    ],
    "locations": [
      { "name": "백석대 (천안)", "scenes": "S4", "status": "후원 조건. 장소 지정 필요", "address": "", "parking": "", "power": "", "permit": "", "notes": "강의실·연구실·복도 중 어디인지 확정" },
      { "name": "앰플리파이 팀 연습 공간", "scenes": "S1, S3, S10", "status": "팀 협조 요청 단계", "address": "", "parking": "", "power": "", "permit": "", "notes": "의상 사전 요청" },
      { "name": "기드온 워십 교회 (의정부, 확인 필요)", "scenes": "S2, S7, S10, S11", "status": "간사 연락 예정", "address": "", "parking": "", "power": "", "permit": "", "notes": "예배당, 연습실, 초등부실 사용 가능 여부" },
      { "name": "가이드 녹음 스튜디오", "scenes": "S5", "status": "미정", "address": "", "parking": "", "power": "", "permit": "", "notes": "" },
      { "name": "레코딩·합주 장소", "scenes": "S6", "status": "미정", "address": "", "parking": "", "power": "", "permit": "", "notes": "드럼 없이도 가능" },
      { "name": "주인공 방", "scenes": "S9", "status": "미정", "address": "", "parking": "", "power": "", "permit": "", "notes": "건반 한 대로 조용한 환경 필요" },
      { "name": "일상 야외 (마트, 공원)", "scenes": "S9", "status": "미정", "address": "", "parking": "", "power": "", "permit": "", "notes": "공공장소는 허가 확인. 붐 마이크가 눈에 띄지 않게 계획" },
      { "name": "레이블 대표 만남 장소", "scenes": "S8", "status": "미정", "address": "", "parking": "", "power": "", "permit": "", "notes": "차량 연출 여부" }
    ],
    "contacts": [
      { "group": "배우", "name": "수인", "role": "글로리아 (주연)", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "배우", "name": "79년생 여성", "role": "백석대 교수", "phone": "", "emergency": "", "availability": "천안 거주, 1회 출연", "dietHealth": "" },
      { "group": "배우", "name": "88년생 남성", "role": "대학원생 선배", "phone": "", "emergency": "", "availability": "천안 거주", "dietHealth": "" },
      { "group": "배우", "name": "박주연", "role": "부목사 역", "phone": "", "emergency": "", "availability": "확인 필요", "dietHealth": "" },
      { "group": "배우", "name": "백준", "role": "일렉 기타", "phone": "", "emergency": "", "availability": "서울 거주. 평일 가능(전사 불확실)", "dietHealth": "" },
      { "group": "배우", "name": "철원 거주", "role": "R&B 보컬", "phone": "", "emergency": "", "availability": "철원에서 이동. 일정 유연", "dietHealth": "" },
      { "group": "배우", "name": "임지규 (카메오 구상)", "role": "레이블 대표", "phone": "", "emergency": "", "availability": "미정", "dietHealth": "" },
      { "group": "배우", "name": "미정", "role": "드럼, 건반, 베이스", "phone": "", "emergency": "", "availability": "드럼 후보는 일정이 맞지 않음", "dietHealth": "" },
      { "group": "팀 협조", "name": "간사 (의정부 교회)", "role": "기드온 팀 섭외 창구", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "팀 협조", "name": "미정", "role": "앰플리파이 역 찬양팀", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "후원", "name": "미정", "role": "백석대 담당자", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "스태프", "name": "", "role": "현장 총괄", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "스태프", "name": "", "role": "감독·연출", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "스태프", "name": "", "role": "촬영", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "스태프", "name": "", "role": "녹음", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "스태프", "name": "", "role": "조명·그립", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "스태프", "name": "", "role": "음악 녹음·믹싱", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "스태프", "name": "", "role": "편집·자막", "phone": "", "emergency": "", "availability": "", "dietHealth": "" },
      { "group": "비상", "name": "", "role": "가까운 병원·응급 연락", "phone": "", "emergency": "", "availability": "", "dietHealth": "" }
    ],
    "equipment": [
      { "category": "카메라", "item": "소니 a7 IV", "qty": "", "owner": "", "storage": "", "schedule": "전 촬영일", "status": "보유" },
      { "category": "렌즈", "item": "", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" },
      { "category": "삼각대·짐벌", "item": "", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" },
      { "category": "조명", "item": "", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" },
      { "category": "녹음", "item": "무선 마이크 Comica VM40 (송신기·수신기, 내장 녹음)", "qty": "", "owner": "", "storage": "", "schedule": "붐 사용 씬", "status": "보유" },
      { "category": "녹음", "item": "레코더 Zoom H6 (백업 녹음)", "qty": "", "owner": "", "storage": "", "schedule": "전 촬영일", "status": "보유" },
      { "category": "녹음", "item": "외장 마이크 FineMic", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "보유" },
      { "category": "녹음", "item": "붐 폴, 블림프·데드캣", "qty": "", "owner": "", "storage": "", "schedule": "붐 가능한 실내", "status": "확인 필요" },
      { "category": "녹음", "item": "타임코드 Deity TC-1 (카메라용, H6용)", "qty": "2", "owner": "", "storage": "", "schedule": "전 촬영일", "status": "구매 예정" },
      { "category": "녹음", "item": "바디팩 송수신기와 라발리어 마이크", "qty": "", "owner": "", "storage": "", "schedule": "붐을 못 쓰는 촬영일", "status": "구매 예정" },
      { "category": "음악", "item": "플레이백 스피커, 연주 녹음용 장비", "qty": "", "owner": "", "storage": "", "schedule": "S1, S6, S9", "status": "필요 여부 확인" },
      { "category": "전원", "item": "배터리, 충전기, 멀티탭", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" },
      { "category": "저장", "item": "메모리 카드, 백업 SSD", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" },
      { "category": "모니터링", "item": "모니터, 헤드폰", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" },
      { "category": "기타", "item": "슬레이트, 가방, 차량", "qty": "", "owner": "", "storage": "", "schedule": "", "status": "확인 필요" }
    ]
  };

  var TABLES = ["overview", "masterSchedule", "shootDays", "scenes", "locations", "contacts", "equipment"];

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

  root.OFFMIC = { DEFAULT: DEFAULT, TABLES: TABLES, summary: summary,
    target: "2027년 1월 초", row: "soli-deo-offmic", privateRow: "soli-deo-offmic-private" };
})(window);
