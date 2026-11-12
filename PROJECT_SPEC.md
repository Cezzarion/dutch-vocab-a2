# Project specification

**Status:** Initial draft  
**Last updated:** 2026-11-12

This document is the product and technical source of truth for Dutch Vocab A2. Update it before implementing a change that affects user-visible behavior, data contracts, or architecture. Keep requirements testable and give each requirement a stable ID so implementation plans and reviews can refer to it.

## 1. Product overview

Dutch Vocab A2 is a small web application for learning Dutch vocabulary at CEFR A2 level. The application is a client-side React single-page app built with TypeScript and Vite. Vocabulary content is shipped as static JSON files; there is no application database or server-side API in the current architecture.

The project is deployed as a static site on Cloudflare Pages. Production builds are generated with `npm run build` into `dist/`.

## 2. Goals and non-goals

### Goals

- Help a learner study Dutch A2 vocabulary through a clear, approachable website.
- Keep vocabulary content separate from UI code and maintain it in reviewable JSON files.
- Catch TypeScript and production-build errors before deployment.
- Keep the site deployable as static assets without a runtime server or database.

### Non-goals for the current architecture

- User accounts, server-side persistence, or a database.
- A content-management interface.
- Storing secrets or private user data in the client application.

These non-goals can change only through an explicit update to this specification.

## 3. Product behavior

### Defined behavior

- **FR-001 — Welcome screen:** The site must identify itself as a Dutch A2 learning experience. The current implementation presents the welcome text “Let's learn A2!”.
- **FR-002 — Interface language:** The application must support Russian (`ru`) and English (`en`) interface languages. A working language selector must remain available in the top-right area so the learner can change the interface language at any time. Changing it must update all user-facing interface text without reloading the page or clearing the selected filters. Dictionary titles are Dutch strings and do not change with the interface language.
- **FR-003 — Learning direction:** A separate working direction selector must remain available in the top-right area so the learner can change direction at any time. The two directions are Dutch → the currently selected interface language, and the currently selected interface language → Dutch. Cards and tests must present prompts and expected answers according to the selected direction when those modes are implemented.
- **FR-004 — Independent global settings:** Interface language and learning direction are independent settings. Together they provide four combinations: Dutch → Russian, Russian → Dutch, Dutch → English, and English → Dutch. Changing the interface language must retain the selected direction (forward or reverse) and apply it to the newly selected language. Changing direction must not change interface language.
- **FR-005 — Vocabulary source:** Vocabulary shown by the application must come from the project's static JSON vocabulary data, rather than being duplicated as content literals across UI components.
- **FR-006 — Study modes:** The learner can choose between flashcards and a multiple-choice test. Each action starts its corresponding session when the selected word set supports that mode.
- **FR-016 — Start screen layout:** The start screen must present two separate multi-select toggle lists: word types on the left and vocabulary dictionaries beside them. To the right, show two prominent actions labeled Test and Flashcards. Each mode starts when its session can be formed. On wide screens, keep the three areas side by side; on narrow screens, arrange them so all controls remain easy to use. The interface-language and direction selectors remain available in the top-right area.
- **FR-007 — Flashcard interaction:** A flashcard shows the prompt in the selected learning direction. Activating the card reveals its answer. Adapt the displayed text size to the content and available card width, and show no more than two lines. “Next” advances to the next word and “Back” returns to a previously viewed word; the navigation controls appear together beneath the card. An “Easy” action marks the current word as known but leaves it in the active session and on screen. Show a progress bar at the top and a completion state after the final card. Provide an Exit control on the session screen; exiting discards the session and returns to the start page while preserving the current language, direction, dictionary selections, and word-type selections.
- **FR-021 — Known words:** When the learner marks a word as easy, exclude that word from candidate sets for future sessions. Do not modify the already-started session. Treat entries with the same word identity across dictionaries as the same known word. On the start screen, show the number of marked words and provide a reset action that clears all marks and returns those words to future candidate sets.
- **FR-022 — Known-word persistence:** Store known-word identities in browser local storage so the exclusion persists across page reloads in the same browser. Store only the normalized vocabulary identity, not user credentials or other private data.
- **FR-008 — Test interaction:** Each test question shows one prompt and six answer options: exactly one correct answer and five incorrect answers. At runtime, incorrect options are chosen randomly from other eligible records in the selected session word set with the same word type as the correct answer. Words marked as easy are excluded from the pool before the session starts. Word types with fewer than six eligible records are omitted from the test session. The prompt and correct answer follow the selected learning direction. Disable the Test action only when no selected word type has at least six eligible records; Flashcards remain available for all non-empty selections.
- **FR-013 — Test answer feedback:** Answer feedback is shown only in test mode. After the learner selects an answer, all options become unavailable. If the selected option is incorrect, it is highlighted red and the correct option is highlighted green. If the selected option is correct, it is highlighted green. Feedback must not be shown in flashcard mode.
- **FR-009 — Random session order:** Words must be placed in a random order at the start of each session in both modes. Each selected word appears at most once in that session.
- **FR-010 — Session word selection:** On the start screen, the learner chooses vocabulary dictionaries and word types using the two multi-select toggle lists. The available dictionary choices come from the vocabulary files; the available type choices come from the word types in the data. The candidate session word set is the intersection of records in the selected dictionaries and selected types. For example, selecting all dictionaries and only verbs includes verbs from every dictionary; selecting two dictionaries and all types includes every type from those two dictionaries. The start screen displays the selected word count.
- **FR-017 — Data-driven filter options:** Dictionary and word-type options must be generated from the available vocabulary data. Word-type options are displayed using the current interface language; dictionary titles are displayed as provided in their Dutch `title` field. Names shown in the visual mockup (such as “42 общий”, “KNM Zorg”, and “KNM Samenleven”) are examples, not hard-coded options.
- **FR-018 — Session start validation:** A mode action must not start an empty session. If the current dictionary and type selection produces no words, explain that the learner needs to adjust the selection. Keep the selected filters visible so they can be changed.
- **FR-019 — Load dictionaries at startup:** Load every JSON vocabulary file in `src/data/vocabs/` when the application starts and keep the parsed dictionaries in memory for filtering and session selection. The vocabulary collection is expected to remain small enough for eager client-side loading.
- **FR-020 — Deduplicate across dictionaries:** If selected dictionaries contain the same vocabulary entry, include only one copy in the candidate session word set and its displayed count. Entries are considered identical when their normalized Dutch headword (the first form, without a `de`/`het` article) and `type_en` match. Keep the first matching entry in dictionary load order.
- **FR-011 — Session progress:** During either mode, a simple progress bar must appear at the top. It represents the session words in randomized order and shows the number of unique words passed and the total. Moving forward to a previously unseen flashcard advances progress; moving back or revisiting a seen flashcard does not reduce or increase it. Moving on from a test question or marking it easy advances progress by one. Returning to a previous test question does not reduce progress. The bar must not count a word more than once.
- **FR-012 — Session completion:** A session ends after every word in its selected set has been completed. The completion state must show that all selected words have been completed.
- **FR-014 — Next test question:** After an answer is selected and feedback appears, the learner advances to the next test word by activating a “Следующий” / “Next” button, localized to the current interface language. The next question must not appear automatically.
- **FR-015 — Test result counts:** Test mode must display counts of correct and incorrect questions. A question is scored only once based on the selected option. If the learner marks a question easy before answering, count it as correct. Marking it easy after an answer does not change the score already recorded.
- **FR-023 — Test navigation and known words:** Place the test Exit control to the right of the question area. Align “Remove”, “Back”, and “Next” controls in one row below the answers. Back returns to the previous question without changing its saved answer or score; Next advances only after an answer is selected. Remove marks the current word as easy and advances immediately. If no answer was selected, marking a word easy counts it as correct; otherwise preserve the score from the first answer.

### Product decisions to make

The following items are open and must be resolved in the relevant feature specification before implementation:

- Whether session progress should persist after leaving or refreshing the page (the current requirement covers progress within an active session only).
- Whether test mode should support word types with fewer than five eligible records (currently, test mode is unavailable when any selected type has fewer than five records).
- What should happen when the selected dictionary and type filters produce an empty session.
- Which examples, audio, and grammar details are required for each word.
- Which dictionary and word-type options are selected by default on the start screen.
- How the learner returns to session setup or starts another session after completion.
- Which interface language and learning direction are selected by default, and whether those preferences persist across visits.

## 4. Data requirements

- **DATA-001 — Static files:** Source vocabulary data must be stored as UTF-8 JSON under `src/data/`. Vocabulary collections belong under `src/data/vocabs/`.
- **DATA-002 — JSON syntax:** Files must contain valid JSON, use double-quoted keys and strings, and contain no comments or trailing commas.
- **DATA-003 — Record identity:** Do not use array positions as persistent identity. The initial vocabulary record format has no `id`; if a feature needs records to be referenced across edits or sessions, add a stable `id` through a documented schema update before implementing that feature.
- **DATA-004 — Vocabulary record fields:** Each record must contain exactly these required string fields: `type_en`, `type_ru`, `dutch`, `russian`, and `english`. Values must be non-empty after trimming. `type_en` and `type_ru` describe the part of speech in the respective language; the other three fields contain the Dutch form and its Russian and English meanings. Do not add fields without updating this contract.
- **DATA-008 — Verb form:** For a verb (`type_en: "verb"`, `type_ru: "глагол"`), `dutch` must contain exactly two forms separated by one comma: the infinitive first and the past participle second. Trim whitespace around both forms.
- **DATA-009 — Noun form:** For a countable noun (`type_en: "noun"`, `type_ru: "существительное"`), `dutch` must contain the singular with its definite article (`de` or `het`), then a comma, then the plural form without an article. Trim whitespace around both forms. Do not omit or repeat the article on the plural form. For an uncountable noun with no standard plural, use `—` after the comma. For a plural-only noun, keep the article before the plural headword and put an alternate plural form after the comma when one is listed; do not invent a singular form.
- **DATA-005 — Dataset metadata:** Each vocabulary file must declare a `schemaVersion`, a descriptive Dutch `title` string, and an `entries` array. The title string is the dictionary label shown in the start-screen selector and is not localized. The initial schema version is `1`.
- **DATA-006 — Runtime validation:** Data must be validated against its schema at the application boundary before being used. TypeScript types alone are not runtime validation. Invalid data must produce a clear development/build error and must not be silently treated as valid content.
- **DATA-007 — Client visibility:** Content bundled into or served by this static client is public. Do not put credentials, secrets, or private information in source JSON.

Example vocabulary file, including the agreed record shape and Dutch form conventions:

```json
{
  "schemaVersion": 1,
  "title": "A2 Basis",
  "entries": [
    {
      "type_en": "verb",
      "type_ru": "глагол",
      "dutch": "lopen, gelopen",
      "russian": "идти",
      "english": "walk"
    },
    {
      "type_en": "noun",
      "type_ru": "существительное",
      "dutch": "de tafel, tafels",
      "russian": "стол",
      "english": "table"
    },
    {
      "type_en": "noun",
      "type_ru": "существительное",
      "dutch": "het huis, huizen",
      "russian": "дом",
      "english": "house"
    }
  ]
}
```

If the record shape changes incompatibly, increment `schemaVersion` and document a migration. If a word needs multiple meanings or variants, represent that in a later schema update rather than adding undocumented syntax to a field.

## 5. Technical constraints

- **TECH-001:** Use React, TypeScript, and Vite for the client application.
- **TECH-002:** Keep TypeScript strict mode enabled. Production build must run `tsc --noEmit` before `vite build`.
- **TECH-003:** Keep the application compatible with static hosting on Cloudflare Pages. Vite's `dist/` directory is the deployment output.
- **TECH-004:** Keep content data in JSON and application behavior in TypeScript/TSX. Avoid embedding sizeable content collections in components.
- **TECH-005:** Add dependencies only when they provide a clear project need. Any schema-validation library must be used at runtime, not only for compile-time types.
- **TECH-006:** Keep React entry points and feature screens focused on composing UI and managing screen state. Put reusable UI controls in `src/components/`, vocabulary loading and runtime validation in `src/data/`, vocabulary selection and normalization rules in `src/domain/`, and shared TypeScript contracts in `src/types/`.

## 6. Quality requirements

- **NFR-001 — Accessibility:** Interactive controls must be operable by keyboard, have an accessible name, and expose their state and purpose to assistive technology. Use semantic HTML and maintain readable contrast.
- **NFR-002 — Responsive layout:** Core content and interactions must remain usable on narrow mobile screens and desktop screens.
- **NFR-003 — Reliability:** A malformed or incompatible vocabulary dataset must fail clearly rather than render misleading or partially corrupted learning content.
- **NFR-004 — Maintainability:** Keep domain types, data validation, content, and presentation responsibilities clearly separated as the application grows.

## 7. Definition of done

A change is ready when:

1. Its user-visible behavior and relevant data/technical requirements are described in this specification or a linked feature specification.
2. The implementation satisfies the applicable requirement IDs.
3. `npm run build` succeeds for changes that affect application code, configuration, or data.
4. Data changes satisfy the documented JSON schema and validation rules.
5. Any changed requirement or newly decided open question is reflected in this document.

## 8. Specification maintenance

- Keep this file focused on durable product behavior and project-wide constraints.
- For a feature with several states or detailed acceptance scenarios, create a focused document under `specs/` and link it here.
- Update requirements before implementation when a change alters expected behavior or a data contract.
- Mark unresolved decisions explicitly; do not present assumptions as settled product behavior.
