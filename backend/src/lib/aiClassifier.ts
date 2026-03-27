interface ClassificationResult {
  category: string;
  priority: 'Low' | 'Medium' | 'High';
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  ragging: [
    'ragging', 'rag', 'bully', 'bullying', 'senior', 'force', 'forced', 'strip',
    'physical abuse', 'beaten', 'beat', 'punch', 'kick', 'humiliate', 'humiliation',
    'initiation', 'freshman', 'fresher', 'coerce', 'coercion',
  ],
  harassment: [
    'harass', 'harassment', 'sexual', 'touch', 'inappropriate', 'stalk', 'stalking',
    'threaten', 'threat', 'blackmail', 'intimidate', 'intimidation', 'grope',
    'comment', 'uncomfortable', 'unwanted', 'molest', 'abuse', 'gender', 'discriminat',
  ],
  safety: [
    'fire', 'accident', 'injury', 'injure', 'fall', 'fell', 'dangerous', 'hazard',
    'unsafe', 'broken', 'electric', 'gas leak', 'flood', 'emergency', 'ambulance',
    'hospital', 'hurt', 'wound', 'bleed', 'blood', 'damage', 'theft', 'steal', 'rob',
  ],
};

const HIGH_PRIORITY_KEYWORDS = [
  'urgent', 'emergency', 'sos', 'help', 'critical', 'immediately', 'right now',
  'severe', 'serious', 'dangerous', 'weapon', 'knife', 'gun', 'attack', 'attacked',
  'violence', 'violent', 'blood', 'unconscious', 'faint', 'hospital', 'death', 'die',
  'threat', 'threaten', 'rape', 'assault', 'beaten badly', 'fire', 'burning',
];

const MEDIUM_PRIORITY_KEYWORDS = [
  'repeatedly', 'multiple times', 'ongoing', 'still happening', 'every day', 'regular',
  'frequent', 'worse', 'getting worse', 'group', 'several', 'many people',
  'afraid', 'scared', 'fear', 'cannot sleep', 'suicidal',
];

export function classifyReport(description: string): ClassificationResult {
  const text = description.toLowerCase();

  // Determine category
  let detectedCategory = 'other';
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter(kw => text.includes(kw)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedCategory = category;
    }
  }

  // Determine priority
  let priority: 'Low' | 'Medium' | 'High' = 'Low';

  const highMatches = HIGH_PRIORITY_KEYWORDS.filter(kw => text.includes(kw)).length;
  const mediumMatches = MEDIUM_PRIORITY_KEYWORDS.filter(kw => text.includes(kw)).length;

  if (highMatches >= 1) {
    priority = 'High';
  } else if (mediumMatches >= 1) {
    priority = 'Medium';
  }

  return { category: detectedCategory, priority };
}
