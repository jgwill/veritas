# Housing print field trial — September 2026

This is an operator-and-agent learning record, **not** a claim that Veritas itself generated these PDFs. The experiment began with a request to use `jgwill/veritas` to support a housing decision near Chambly, Mont-Saint-Hilaire, Beloeil and environs, including rooms and possible longer winter house-sitting. The operator cared about smoke/cannabis, fragrance, cat-litter odor, calm, ventilation, usable space (~9 × 14 ft), A/C, budget, availability, duration/terms, nature, shops and transit.

## What happened

- Early sheets bundled criteria that the operator needed to answer and prioritize independently (nature/shops/transit; cost/date; space/A/C; calm/ventilation).
- The agent then over-corrected by printing a seven-page interpretation of Type 1 modeling, pairwise hierarchy, analyzing and structuring. This was technically interesting but wrong for a call/visit field instrument.
- A two-page version repeated call and visit judgments for each criterion. The operator actually wanted **one evolving acceptability judgment per criterion**, regardless of when the evidence arrived.
- A one-page version retained a third `à vérifier` checkbox. The operator pointed out that **neither acceptable nor non acceptable checked already means not evaluated**.
- Final accepted direction: one letter-size landscape page per candidate; 13 independent criteria in two columns; description; two boxes `acceptable / non acceptable`; a short precision line; conditional `sans objet` for litter without cats; a modest follow-up action. No assumed ranking or automatic final verdict.

## Attribution, uncertainty, and compassion

The operator's initial request evolved during use, and some requests were ambiguous. Much of the friction was the agent's scope/translation and eagerness to generate/print before rehearsing the paper interaction, not demonstrated defects in the application. The operator also recognized this co-discovery and did not ask us to label every intermediate artifact a failure. The generalizable lesson is to **explain and test the human marking gesture before expanding the rendering**.

## Repository questions requiring a separate test

Source review found differences between Type 1 specs and runtime interpretation of dominance/vetoes; `AnalyzingView.tsx` had been observed allowing a YES display with unanswered elements, but this must be reproduced on the target branch before filing a bug. A local Next.js server once logged “Ready” while returning HTTP 500, so no live screenshot comparison was validated in that session. A future product proposal can ask for a per-location printable export; don't report it as an existing broken export.

Archive provenance: `/srv/miadi/episodes/miadi-chronicle/2026-06-28-episode-098-jgi-home-that-support-his-aspirations/house-sitting/fiches-appel-2026-09-25/veritas-nouvelle-fiche/`, final `N-evaluer-un-lieu-deux-cases.pdf`, generator `generer_fiche_critere_N.py`, and `RETOUR-EXPERIENCE-VERITAS.md`. These paths may not exist in other clones; this reference retains the essential design independently. Do not copy expired PrintMe retrieval codes into the repo.
