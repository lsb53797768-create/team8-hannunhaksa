# 한눈학사

학생은 학사일정과 생기부 활동, 신청 마감을 한눈에 보고, 선생님은 활동 포스터와 일정을 올리고 고치는 학교 웹앱이에요.
휴대폰·패드·노트북 화면에 맞춰 배치가 바뀌고, 홈 화면에 앱처럼 추가할 수 있어요.

- **화면**: 정적 페이지 1개 (`index.html`)
- **서버**: Vercel Function 1개 (`api/index.mjs` → `api/_lib/server.mjs`)
- **저장소**: Upstash Redis (무료 플랜, Vercel에서 클릭 몇 번으로 연결)
- **AI**: OpenAI 호환 API로 오픈소스 모델 호출 (기본: Groq 무료 API의 `openai/gpt-oss-120b`)

> Vercel 서버 안에서는 AI 모델을 직접 돌릴 수 없어요. 그래서 오픈소스 모델을 무료로 올려 둔 서비스(Groq)를 부르고, 주소만 바꾸면 OpenRouter 무료 모델이나 학교 서버의 Ollama로도 바꿀 수 있게 만들었어요.

---

## 1. 준비물 (모두 무료)

| 무엇 | 어디서 |
|---|---|
| GitHub 계정 | https://github.com |
| Vercel 계정 (Hobby 플랜) | https://vercel.com |
| Groq 계정과 API 키 | https://console.groq.com/keys |

## 2. Vercel에 올리기

1. **GitHub에 올리기** — 새 저장소를 만들고 이 폴더의 파일을 모두 올려요. (GitHub 웹에서 *Add file → Upload files*로 끌어다 놓아도 돼요.)
2. **Vercel에서 가져오기** — Vercel 대시보드 → *Add New… → Project* → 방금 만든 저장소 *Import* → Framework Preset은 **Other** 그대로 → *Deploy*.
3. **저장소 연결** — 프로젝트 화면 → *Storage* 탭 → *Upstash* (Redis) 선택 → 만들기 → 이 프로젝트에 *Connect*.
   `KV_REST_API_URL`, `KV_REST_API_TOKEN` 환경변수가 자동으로 들어가요.
4. **환경변수 넣기** — *Settings → Environment Variables*에 아래 값을 추가해요.

   | 이름 | 값 | 필수 |
   |---|---|---|
   | `TEACHER_CODE` | 선생님 로그인 코드 (선생님끼리만 공유) | ✅ |
   | `AUTH_SECRET` | 아무 긴 임의 문자열 (로그인 토큰 서명용) | ✅ |
   | `AI_API_KEY` | Groq에서 만든 API 키 (`gsk_…`) | ✅ |
   | `STUDENT_CODE` | 학생 로그인 때 추가로 받을 학교 코드 | 선택 |
   | `AI_MODEL` | 다른 모델을 쓸 때 (기본 `openai/gpt-oss-120b`) | 선택 |
   | `AI_BASE_URL` | 다른 AI 서비스를 쓸 때 (아래 4번 참고) | 선택 |
   | `AI_PER_MINUTE` | 학생 1명이 1분에 보낼 수 있는 질문 수 (기본 6) | 선택 |

5. **다시 배포** — *Deployments* → 맨 위 배포의 `⋯` → *Redeploy*. 환경변수는 다시 배포해야 반영돼요.
6. **확인** — 배포 주소 뒤에 `/api/health`를 붙여 열면 `"storage":true`, `"ai":true`가 보여야 해요.
7. **첫 활동 등록** — 선생님으로 로그인 → 활동이 비어 있으면 *예시 활동 넣기*로 시험해 보거나, 오른쪽 아래 **+** 버튼으로 바로 등록해요. 예시 활동은 **+** 버튼에서 지울 수 있어요.

## 3. 휴대폰·패드에서 앱처럼 쓰기

- **아이폰·아이패드 (Safari)**: 공유 버튼 → *홈 화면에 추가*
- **안드로이드 (Chrome)**: 오른쪽 위 `⋮` → *홈 화면에 추가* 또는 *앱 설치*

화면 배치는 기기에 맞춰 바뀌어요.

| 화면 | 메뉴 위치 | 맞춤 활동 | 마감 임박 |
|---|---|---|---|
| 휴대폰 세로 | 아래 탭 바 | 옆으로 넘기는 카드 | 세로로 쌓인 큰 막대 |
| 휴대폰 가로 | 왼쪽 좁은 바 | 카드 격자 | 막대 격자 |
| 패드 | 왼쪽 바 | 2열 카드 | 막대 목록 |
| 노트북 | 왼쪽 바 + 앱 이름 | 3~4열 카드 | 2~3열 막대 |

## 4. AI 바꾸기

서버는 OpenAI 호환 주소면 어디든 부를 수 있어요. `AI_BASE_URL`, `AI_MODEL`, `AI_API_KEY`만 바꾸면 돼요.

| 방식 | `AI_BASE_URL` | `AI_MODEL` 예시 | 키 |
|---|---|---|---|
| Groq (기본) | `https://api.groq.com/openai/v1` | `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `llama-3.3-70b-versatile` | 필요 |
| OpenRouter 무료 모델 | `https://openrouter.ai/api/v1` | 이름이 `:free`로 끝나는 모델 | 필요 |
| 학교 서버의 Ollama | `http://서버주소:11434/v1` | 서버에 설치한 모델 이름 | 비워도 됨 |

- Ollama는 Vercel이 인터넷으로 접속할 수 있는 주소여야 해요.
- **무료 사용량은 학교 전체가 함께 써요.** Groq 무료 플랜은 모델마다 분당·하루 요청 수와 토큰 수 한도가 있어요. 정확한 한도는 Groq 콘솔의 *Limits* 화면에서 확인하세요.
- 한도를 넘으면 앱이 등록된 활동을 검색해 **기본 응답**으로 대신 답해요.

## 5. 내 컴퓨터에서 미리 실행하기

Node.js 20 이상이 필요해요.

```bash
node dev-server.mjs
# → http://localhost:3000
```

- 저장소를 연결하지 않으면 메모리에 임시로 저장돼요. 서버를 끄면 사라져요.
- 교사 코드는 `.env.local`에 `TEACHER_CODE`를 넣지 않으면 `hannun2026`이에요.
- `.env.example`을 `.env.local`로 복사해 값을 채우면 Redis와 AI도 그대로 연결돼요.

## 6. 보안 메모

- 학생 로그인은 **학번 + 이름**이라, 다른 학생의 학번을 알면 그 학생으로 들어갈 수 있어요. `STUDENT_CODE`를 꼭 설정하고, 정식 운영 전에는 학교 계정(예: Google Workspace) 로그인 연동을 권해요.
- `TEACHER_CODE`가 바뀌어도 이미 받은 로그인은 유지돼요. 모두 다시 로그인하게 하려면 `AUTH_SECRET`도 바꾸세요.
- 활동 등록·수정·삭제와 신청자 명단은 서버에서 선생님 토큰으로만 허용해요.

## 7. 폴더 구조

```
index.html             화면 전체 (휴대폰·패드·노트북 대응)
manifest.webmanifest   홈 화면 추가 설정
icons/                 앱 아이콘
api/index.mjs          Vercel Function 진입점 (모든 /api/* 요청)
api/_lib/server.mjs    로그인, 활동, 신청, 프로필, AI 처리
api/_lib/samples.mjs   '예시 활동 넣기' 데이터
dev-server.mjs         내 컴퓨터용 개발 서버
vercel.json            /api/* 주소 연결 설정
```

### API 요약

| 주소 | 설명 |
|---|---|
| `GET /api/health` | 저장소·AI 연결 상태 |
| `POST /api/login` | 학생(학번·이름)/선생님(이름·코드) 로그인 |
| `GET /api/activities` | 활동 목록 |
| `POST · PUT · DELETE /api/activities[/id]` | 활동 등록·수정·삭제 (선생님) |
| `GET /api/poster/:id` | 포스터 이미지 |
| `GET · POST /api/apply` | 내 신청 내역 / 신청·취소 (학생) |
| `GET /api/applicants` | 활동별 신청자 (선생님) |
| `GET · PUT /api/profile` | 장래희망·진로·과목·사진 |
| `POST /api/chat` | AI 도우미 (글자가 흘러오는 응답) |
| `POST /api/seed` | 예시 활동 넣기 (활동이 없을 때만) |
