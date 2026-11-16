# Audit: Tootor (code review only so far, not yet run)

Audited 2026-11-15 from `/Users/charly/Desktop/Projects/Tootor/Tootor-App` (Flutter, `twotor_app`, version 1.0.0+1, 73 Dart files, about 22k lines, 10 commits: first 2025-06-22 "Initial commit", last 2025-07-24 "Welcome Screen").

## Claims on the site vs the code

| Claim | Verdict | Evidence |
|---|---|---|
| Flutter, Dart, Firebase | True | `pubspec.yaml`: firebase_auth, cloud_firestore, firebase_messaging, firebase_storage, firebase_app_check, cloud_functions |
| iOS and Android, one codebase | Partly | `ios/` and `android/` exist, but `ios/Runner/GoogleService-Info.plist` is **missing**, so iOS Firebase is not configured in this checkout |
| Student and tutor sides | True | `lib/screens/*` (students) and `lib/professor_screens/*` (tutors: availability, classes, wallet) |
| Discovery by subject, tutor search, favorites, calendar | True in code | `explore`, `subject_professors_screen`, `favorites_screen`, `calendar_screen`, `table_calendar` |
| Booking flow writes real bookings | Partly | `tutor_data_service.dart` reads `collection('bookings')`; the booking screen exists |
| **"Real in-app purchase and booking/payment flows, not just UI screens"** | **Not supported** | No `in_app_purchase` package. The payment step is `lib/screens/professor/mock_payment_section/` (a **mock**). `flutter_stripe` is a dependency but no Stripe call exists in `lib/`. `functions/src/index.ts` is **empty** (0 lines), so there is no server side for payments |
| "Architected in-app purchase functionality" (CV bullet too) | **Not supported** | same as above |
| Medal tiers, subscription, notification settings, payment methods screens | UI exists | profile screens and `mock_data/unusual_data.dart`; backed by mock data in places (`mock_data/mock_professors.dart` feeds `professor_service.dart`) |
| 6 months, zero to near-launch (Jan to Jun 2025) | **Unverified** | git history here covers only 2025-06-22 to 2025-07-24, so earlier work, if any, is not in this repo |
| Co-founder, halted for funding | Cannot verify from code | personal fact, keep as the user states |

## What this means
Tootor is a well-built **front end and booking prototype with Firebase auth, Firestore bookings, and push-notification plumbing**, but payments are mocked and there is no server logic. The honest description: "cross-platform tutoring marketplace app: accounts, tutor discovery, availability and booking, favorites, notifications; payments designed but not wired". Anything stronger should be corrected on the site **and on the CV**.

## Not run yet
Needs `firebase_options.dart` pointing at a Firebase project (present) and an iOS plist (missing). An Android emulator is not installed here, and the iOS simulator build needs the plist. Running with mock data may be possible. See open questions.

## Open questions for Carlos
1. Was there ever a real payment path (Stripe, in-app purchase) in a different branch or repo, or was the mock all that was built? The site and CV currently say real flows.
2. Is the Jan 2025 start date right, given the repo starts 2025-06-22 (maybe you moved the code into a new repo)?
3. Is the Firebase project behind `firebase_options.dart` still alive? If so, I should not create accounts or data in it without your say.
4. OK to try running it in the iOS Simulator with a placeholder plist (login would not work, so I would only reach the pre-login screens and mock-data screens)?

## Assets
Not captured. Existing: `public/screenshots/tootor-*.png`.


## Answers from Carlos (2026-11-15)
- **Tootor never had a working payment path.** The mock payment screen is all there is. The site and CV must drop in-app purchase / payment-flow claims and describe it as a tutoring marketplace prototype with a payment screen mocked up.
- **The 2025 start date is true** (the repo's git history starts 2025-06-22, so Jan 2025 predates it; keep the stated date).
- Still not run. An iOS simulator already has a Tootor build installed (seen on the iPhone 16 Pro), which could be used for captures, but the 16 Pro holds Carlos's real data, so build a fresh one to the clean iPhone 16 instead.

## Run result (2026-11-15)
- `flutter build ios --simulator --debug --no-codesign` succeeded in about 95 s (bundle id `com.josepablocampa.tootorapp.v2`). It installed and launched on the clean iPhone 16 with no placeholder plist needed (`lib/firebase_options.dart` carries the config).
- Captured `public/projects/tootor/welcome.png` (1179x2556): logo, "Tu plataforma para conectar con los mejores tutores", Iniciar Sesion / Registrarse. Spanish only UI.
- Everything past the welcome screen needs an account against the app's Firebase project (sign-up form with name, email, password, birth date, then tutor details). I did NOT create an account (needs Carlos's OK). The working tree of the Tootor repo also has uncommitted changes (Podfile.lock, project.pbxproj, AppDelegate, two register screens), not made by this audit.
- To capture tutor search, profile, booking and the mock payment screen: Carlos supplies a test login, or approves creating a throwaway account.

## Signed-in run (2026-11-15, throwaway student account)
Carlos approved a throwaway account. Made with a disposable mail.tm inbox (credentials kept only in the scratchpad, not in the repo). Findings, all against the live `tootor-app` Firebase project, which is alive:
- **Registration is fragile.** In the simulator the Registrarse flow created the Auth user but never finished: no verification email was sent and the `users/{uid}` profile (with `userType`) was never written. I finished it by hand with the throwaway's own token (sent the verification mail, redeemed the link, wrote the profile fields). Without `userType`, login lands back on Welcome. Worth knowing as a real robustness issue; unclear whether it is simulator-only.
- Text fields: the first tap after a screenshot is unreliable and tapping a button while a field has focus does nothing; press Return first.
- **Student app works end to end up to payment**: Home (medal tier "Novato", calendar of classes, "Tutores de la Semana"), Explorar (3 subjects: Matematicas, Quimica, Ingles; search), tutor list per subject (2 tutors, $0/h and 0.0 ratings on one of them), tutor profile (subjects, specific topics, $100/h, availability calendar with time slots, reviews tab), booking sheet ("Confirma tu Reserva" with class details, topic dropdown, free-text note), then **Confirmar Pago, titled "Metodo de Pago (Mockup Stripe)"** with card number / MM/AA / CVV and "Pagar $100.00". The app itself labels the payment a mockup. I did not press pay, so no booking was created.
- Live data: the home screen shows a tutor ("Camila Klassen") who looks like a real person with a photo, so do NOT use `home` or list screens as site assets. Only Carlos's own test tutor profile is safe.
- Debug-only layout bug: long comment text overflows the booking summary row by 23 px.
- Not captured: Mis Clases, Favoritos, Perfil, tutor side (TutorsHome).

## Assets captured (`public/projects/tootor/`, 1179x2556)
`welcome.png`, `explore.png` (3 subject tiles, safe), `availability.png` (Carlos's test tutor, calendar and slots), `booking-sheet.png`, `mock-payment.png` (evidence the payment is a mock; do not present as a real payment). Not saved: the profile top (joke bio) and the home with the other tutor.

## Cleanup note
The throwaway user (and its Firestore profile doc) still exists in the live Firebase project. Carlos can delete both in the Firebase console (Authentication and `users` collection). The email address is a disposable mail.tm one.
