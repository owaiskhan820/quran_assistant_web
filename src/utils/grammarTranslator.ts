import morphologyTerms from "../../data/morphology-terms-ar.json";

export interface Segment {
  segment_index: number;
  text: string;
  pos: string;
  root: string | null;
  lemma: string | null;
  tags: string[];
}

export function translateGrammar(segment: Segment): string {
  const { pos, tags } = segment;
  const terms = morphologyTerms as any;
  let result = "";

  // 1. Initial Type/Particle
  if (terms.types[pos]) {
    result = terms.types[pos];
  } else if (terms.particles[pos]) {
    result = terms.particles[pos];
  } else {
    // Fallback if POS not found in types/particles
    result = pos;
  }

  // 2. Specific Logic for Verbs
  if (pos === "V") {
    const tenseTag = tags.find((t) => terms.verb_tenses[t]);
    if (tenseTag) {
      result += " " + terms.verb_tenses[tenseTag];
    }

    // Person/Gender/Number
    const pronounTags = tags.filter((t) => terms.pronoun_attrs[t]);
    if (pronounTags.length > 0) {
      result += " ل"; // "for..."
      pronounTags.forEach((t, i) => {
        result += (i > 0 ? " " : "") + terms.pronoun_attrs[t];
      });
    }

    const moodTag = tags.find((t) => terms.verb_grammar[t]);
    if (moodTag) {
      result += " (" + terms.verb_grammar[moodTag] + ")";
    }
  }

  // 3. Specific Logic for Nouns
  if (pos === "N" || pos === "PN" || pos === "REL" || pos === "DEM") {
    const grammarTag = tags.find((t) => terms.noun_grammar[t]);
    if (grammarTag) {
      result += " " + terms.noun_grammar[grammarTag];
    }

    // Attributes (ADJ, INDEF)
    const attrTags = tags.filter((t) => terms.attrs[t]);
    attrTags.forEach((t) => {
      result += " " + terms.attrs[t];
    });

    const formTag = tags.find((t) => terms.noun_forms[t]);
    if (formTag) {
      result += " (" + terms.noun_forms[formTag] + ")";
    }
  }

  // 4. Handle Pronouns
  if (pos === "PRON") {
     const pronounTags = tags.filter((t) => terms.pronoun_attrs[t]);
     if (pronounTags.length > 0) {
       result += " ";
       pronounTags.forEach((t, i) => {
         result += (i > 0 ? " " : "") + terms.pronoun_attrs[t];
       });
     }
  }

  return result.trim();
}

/**
 * Returns Sarf details like Root, Lemma, and Verb Form
 */
export function getSarfDetails(segment: Segment) {
  const terms = morphologyTerms as any;
  const details: { label: string; value: string }[] = [];

  if (segment.root) {
    details.push({ label: terms.labels.ROOT, value: segment.root });
  }

  if (segment.lemma) {
    details.push({ label: terms.labels.LEM, value: segment.lemma });
  }

  // Verb Form (if applicable)
  // Tags often contain "IV" etc for Roman numerals but the terms json has an array
  // In many datasets, Form is like "FORM:II". Let's check tags for "FORM:..."
  const formTag = segment.tags.find(t => t.startsWith("FORM:"));
  if (formTag) {
    const formIndex = parseInt(formTag.split(":")[1]) - 1;
    if (formIndex >= 0) {
       const formName = terms.verb_forms_tri[formIndex] || terms.verb_forms_quad[formIndex - 10];
       if (formName) {
         details.push({ label: terms.labels.VF, value: formName });
       }
    }
  }

  return details;
}
