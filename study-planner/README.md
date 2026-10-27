# Studia AI · UWr

Lokalna lista obowiązków magisterskich i historia zaliczeń.

```sh
cd /Users/igorjakus/Projects/ai-uwr/study-planner
python3 server.py
```

Otwórz http://127.0.0.1:8765. Na Macu można też uruchomić `start.command` dwuklikiem. Wymaga Python 3.10+; bez dodatkowych zależności. Inny port: `python3 server.py --port 8766`. Zatrzymanie: Ctrl+C.

## Dwa widoki

- **Do zrobienia**: pozostałe wymagania programu, zajęcia tego semestru i nadwyżka z licencjatu do przepisania.
- **Historia semestrów**: 37 pozycji z tabeli ocen licencjackich (semestry 1–6) oraz kursy magisterskie. Przy każdym dawnym kursie można oznaczyć, czy wykorzystano go do licencjatu, czy jest nadwyżką.

Wymagania programu, zaliczenie kursu oraz formalne przepisanie są osobnymi informacjami. Semestr wymagania to semestr programu, nie semestr faktycznego zaliczenia. Zaznaczenia „zrobione” zachowano z arkusza magisterskiego, z wyjątkiem seminarium przypisanego do poprzedniego Generative AI.

Generative AI jest robione ponownie. Stare zaliczenie pozostaje w historii, ale nie wlicza się do magisterki ani nadwyżki (informacja użytkownika). Po tej korekcie w planie pozostaje 12 wymagań / 53 ECTS; lista nadwyżki obejmuje 7 kursów / 37 ECTS. To stan własnego planu, nie urzędowe potwierdzenie programu ani przepisania.

Źródła: arkusze „Studia mgr” i „Studia licencjat”, odczytane 15.10.2026. Surowe kopie: `source-sheet.json` i `source-bachelor.json`. Oryginały pozostają bez zmian. Nieoznaczone rozliczenie oznacza brak jednoznacznego przypisania, a nie brak zaliczenia. Nie przeniesiono planowanych semestrów 7–10 do historii zaliczeń. Projekt silnik szachowy nie ma wpisu w tabeli ocen; WEPPO ma sprzeczne ECTS; GNN ma sprzeczne informacje o przepisywaniu — uwagi dostępne w historii.

Zmiany są zapisywane w `data/state.json`, ostatnie 30 kopii w `data/backups/`. Dane użytkownika są ignorowane przez Git. Przed uproszczeniem zachowano kopię `data/backups/before-simplification.json` (może zostać usunięta przez retencję kolejnych backupów). Poprzednie katalogi i zadania pozostają w danych, ale nie są pokazywane w interfejsie. Eksport zapisuje całość jako JSON. Pracuj w jednej karcie — równoczesne zmiany z różnych kart mogą się nadpisywać.

Serwer działa tylko na `127.0.0.1`. Aplikacja nie potrzebuje Internetu; nie pobiera fontów ani nie synchronizuje USOS lub arkuszy.

Weryfikacja: sprawdzenie składni JS/Pythona, smoke test zapisu i odczytu API oraz widoków i rozliczania przepisań w przeglądarce. Bez testów jednostkowych.
