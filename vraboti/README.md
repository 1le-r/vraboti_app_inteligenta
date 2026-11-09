# Вработи – огласи за работа

Веб апликација со два типа профили:

- **Кандидат** – пребарува огласи, зачувува огласи, аплицира со мотивационо писмо и CV, го следи статусот на апликациите и го уредува профилот.
- **Работодавач (админ)** – објавува, уредува, затвора и брише огласи, ги разгледува апликациите, го презема CV-то и го менува статусот на кандидатите.

| Дел | Технологија |
|---|---|
| Backend | Java 17+, Spring Boot 3.3, Spring Security (JWT), Spring Data JPA, H2 / PostgreSQL |
| Frontend | React 18, React Router 6, Vite 5 |

## Стартување

### 1. Backend (порта 8080)

Потребно: JDK 17 или понова верзија (Windows: `winget install Microsoft.OpenJDK.21`). Maven не треба да се инсталира.

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

`mvnw.cmd` го презема Maven првиот пат. Ако Maven е веќе инсталиран, може и `mvn spring-boot:run`.

При прво стартување се креира база `backend/data/vraboti.mv.db` со примерни огласи и апликации.
Прикачените CV-а се чуваат во `backend/uploads/`.

### 2. Frontend (порта 5173)

Потребно: Node.js 18 или понова верзија.

```bash
cd frontend
npm install
npm run dev
```

Отворете http://localhost:5173. Vite ги проследува сите повици кон `/api` до backend-от.

### Демо профили

| Улога | Е-пошта | Лозинка |
|---|---|---|
| Работодавач | hr@pixellab.mk | demo1234 |
| Кандидат | elena@example.mk | demo1234 |

Може да се регистрираат и нови профили од почетниот екран.

## REST API

Сите барања (освен најава, регистрација и јавни огласи) бараат заглавие `Authorization: Bearer <token>`.

| Метод | Патека | Кој | Опис |
|---|---|---|---|
| POST | `/api/auth/register` | сите | Регистрација (`role`: `CANDIDATE` или `EMPLOYER`) |
| POST | `/api/auth/login` | сите | Најава, враќа JWT токен |
| GET / PUT | `/api/auth/me` | најавен | Мој профил |
| GET | `/api/jobs?q=&category=&location=&type=` | сите | Активни огласи со филтри |
| GET | `/api/jobs/{id}` | сите | Детали за оглас |
| POST | `/api/jobs/{id}/apply` | кандидат | Апликација (multipart: `fullName`, `email`, `phone`, `coverLetter`, `cv`) |
| GET | `/api/me/applications` | кандидат | Мои апликации |
| GET / POST / DELETE | `/api/me/saved[/{jobId}]` | кандидат | Зачувани огласи |
| GET | `/api/admin/stats` | работодавач | Бројки за таблата |
| GET / POST | `/api/admin/jobs` | работодавач | Мои огласи / нов оглас |
| PUT / DELETE | `/api/admin/jobs/{id}` | работодавач | Уреди / избриши оглас |
| PATCH | `/api/admin/jobs/{id}/toggle` | работодавач | Затвори или активирај оглас |
| GET | `/api/admin/applications?jobId=&status=` | работодавач | Апликации за моите огласи |
| GET | `/api/admin/applications/{id}` | работодавач | Детали (новата апликација оди во „Во разгледување“) |
| PATCH | `/api/admin/applications/{id}/status` | работодавач | Промена на статус: `NEW`, `REVIEW`, `INTERVIEW`, `HIRED`, `REJECTED` |
| GET | `/api/admin/applications/{id}/cv` | работодавач | Преземи CV |

Работодавачот ги гледа и менува само своите огласи и апликациите за нив.

## Продукција

1. **PostgreSQL**: во `backend/src/main/resources/application.properties` одкоментирајте ги линиите за PostgreSQL и избришете ги линиите за H2.
2. **JWT клуч**: поставете променлива `APP_JWT_SECRET` со долг случаен текст (најмалку 32 знаци).
3. **CORS**: во `app.cors.allowed-origins` ставете го доменот на frontend-от.
4. **Frontend**: `npm run build` ја креира папката `frontend/dist`. Ако backend-от е на друг домен, пред build поставете `VITE_API_URL` (види `.env.example`).
5. Исклучете ги примерните податоци со `app.seed=false`.

## Структура

```
backend/src/main/java/mk/vraboti/
  model/        User, Job, JobApplication, Role, ApplicationStatus
  repository/   Spring Data репозиториуми
  service/      AuthService, JobService, ApplicationService, FileStorageService
  web/          AuthController, JobController, CandidateController, AdminController
  security/     JWT филтер и сервис
  config/       SecurityConfig, DataSeeder
frontend/src/
  api/          client.js – сите повици кон backend-от
  context/      AuthContext (најава), ToastContext (известувања)
  components/   Header, JobCard, модали, Layouts (заштита на рути по улога)
  pages/        Login, Jobs, MyApplications, Profile, Dashboard, AdminJobs, AdminApplications
```
