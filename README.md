# Dog4You
App for suggesting owners the most suitable breed by their lifestyle and dog's breed standards. 

# JSONL Tools

## Validate
node tools/validate_jsonl.js ../v1/explain_trait.jsonl ../v1/why_match.jsonl ../v1/why_not.jsonl ../v1/care_tips.jsonl

- Prints counts and the first error if a line is malformed.

## Merge + Split
node tools/merge_and_split.js ../v1/explain_trait.jsonl ../v1/why_match.jsonl ../v1/why_not.jsonl ../v1/care_tips.jsonl

- Produces train.jsonl (90%) and val.jsonl (10%) in the v1 folder.
- Files are shuffled before splitting.

## Important
- **One JSON object per line**. No pretty line-breaks inside a single sample.
- Replace `<<SYSTEM>>` in each line with the *exact* text from your final system prompt before training, or leave it and let your training code inject it at runtime.
- Keep answers short, practical, and dog-welfare-first.
