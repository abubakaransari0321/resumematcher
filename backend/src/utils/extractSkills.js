// Common technical skills database
const COMMON_SKILLS = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 
  'Swift', 'Kotlin', 'Go', 'Rust', 'Scala', 'Perl', 'R', 'MATLAB',
  
  // Web Technologies
  'React', 'Angular', 'Vue.js', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
  'Spring', 'ASP.NET', 'Laravel', 'Rails', 'Next.js', 'Nuxt.js', 'Svelte',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'SASS', 'SCSS', 'Less', 'Tailwind',
  'Bootstrap', 'jQuery', 'Webpack', 'Vite', 'Babel',
  
  // Databases
  'MongoDB', 'MySQL', 'PostgreSQL', 'SQL', 'Oracle', 'Redis', 'Cassandra',
  'DynamoDB', 'Elasticsearch', 'SQLite', 'MariaDB', 'Firebase', 'Firestore',
  'Neo4j', 'CouchDB',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
  'GitLab CI', 'GitHub Actions', 'CircleCI', 'Terraform', 'Ansible', 
  'CloudFormation', 'Heroku', 'Netlify', 'Vercel',
  
  // Version Control
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN',
  
  // Testing
  'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Playwright', 'JUnit',
  'pytest', 'RSpec', 'Jasmine', 'Testing Library',
  
  // Mobile Development
  'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic',
  
  // Data Science & ML
  'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
  'Jupyter', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
  'Data Analysis', 'Statistics',
  
  // Other Tools & Frameworks
  'GraphQL', 'REST API', 'RESTful', 'Microservices', 'API', 'WebSocket',
  'gRPC', 'RabbitMQ', 'Kafka', 'NGINX', 'Apache', 'Linux', 'Unix', 'Bash',
  'PowerShell', 'Agile', 'Scrum', 'JIRA', 'Confluence', 'Slack',
  
  // Methodologies & Concepts
  'OOP', 'Functional Programming', 'Design Patterns', 'SOLID', 'CI/CD',
  'TDD', 'BDD', 'MVC', 'MVVM', 'Responsive Design', 'SEO', 'Accessibility',
  'Performance Optimization', 'Security', 'Authentication', 'OAuth',
];

/**
 * Extract skills from text using enhanced pattern matching
 * @param {string} text - The text to extract skills from
 * @returns {string[]} - Array of unique skills found
 */
export function extractSkills(text) {
  if (!text || typeof text !== 'string') {
    console.log('extractSkills: Invalid text input');
    return [];
  }

  console.log('\n=== SKILL EXTRACTION DEBUG ===');
  console.log('Text length:', text.length);
  console.log('First 200 chars:', text.substring(0, 200));

  // Preprocess text: normalize whitespace, lowercase, handle common variations
  const preprocessedText = text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .toLowerCase()
    .trim();
    
  console.log('Preprocessed text length:', preprocessedText.length);
  console.log('First 200 chars (preprocessed):', preprocessedText.substring(0, 200));
  
  const foundSkills = new Set(); // Use Set for automatic deduplication

  // Phase 1: Extract known skills from predefined list
  COMMON_SKILLS.forEach(skill => {
    const skillLower = skill.toLowerCase();
    
    // Create multiple regex patterns for better matching
    const patterns = [
      // Exact word boundary match (primary)
      new RegExp(`\\b${escapeRegex(skillLower)}\\b`, 'gi'),
      // Handle variations with dots (e.g., "Node.js" vs "Node js" vs "Nodejs")
      new RegExp(`\\b${escapeRegex(skillLower.replace(/\./g, '\\s*\.?\\s*'))}\\b`, 'gi'),
      // Handle hyphenated versions (e.g., "C++" vs "C plus plus")
      new RegExp(`\\b${escapeRegex(skillLower.replace(/[+#]/g, '\\s*[+#]*\\s*'))}\\b`, 'gi')
    ];
    
    // Try each pattern
    patterns.forEach(regex => {
      if (regex.test(preprocessedText)) {
        foundSkills.add(skill);
      }
    });
    
    // Special handling for common variations
    handleSkillVariations(preprocessedText, skill, foundSkills);
  });

  // Phase 2: Extract additional skills using pattern recognition
  const additionalSkills = extractAdditionalSkills(text);
  additionalSkills.forEach(skill => foundSkills.add(skill));

  const uniqueSkills = Array.from(foundSkills);
  console.log('Extracted skills from predefined list (', uniqueSkills.length - additionalSkills.length, '):', uniqueSkills.filter(skill => !additionalSkills.includes(skill)));
  console.log('Extracted additional skills (', additionalSkills.length, '):', additionalSkills);
  console.log('Total extracted skills (', uniqueSkills.length, '):', uniqueSkills);
  console.log('=== END SKILL EXTRACTION ===\n');
  
  return uniqueSkills;
}

/**
 * Escape special regex characters
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Extract additional skills using pattern recognition
 * @param {string} text - The original text to analyze
 * @returns {string[]} - Array of additional skills found
 */
const extractAdditionalSkills = (text) => {
  const additionalSkills = new Set();
  const originalText = text; // Keep original casing for skill names
  const lowerText = text.toLowerCase();
  
  // Pattern 1: Skills mentioned after "skills:" or similar headers
  const skillSectionPatterns = [
    /(?:technical\s+skills?|skills?|technologies?|programming\s+languages?|tools?|proficiency|competencies)\s*:?\s*([^\n.!?]+)/gi,
    /(?:experience\s+with|proficient\s+in|knowledgeable\s+in|familiar\s+with)\s*:?\s*([^\n.!?]+)/gi,
    /(?:languages?|frameworks?|databases?|platforms?)\s*:?\s*([^\n.!?]+)/gi
  ];
  
  skillSectionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const skillText = match[1];
      const extractedSkills = parseSkillList(skillText);
      extractedSkills.forEach(skill => additionalSkills.add(skill));
    }
  });
  
  // Pattern 2: Version numbers (e.g., "Python 3.8", "React 18", "Java 11")
  const versionPatterns = [
    /\b([A-Za-z][A-Za-z0-9]*(?:\.js|\.net)?)\s+(?:version\s+)?(\d+(?:\.\d+)*)/gi,
    /\b([A-Za-z][A-Za-z0-9]*(?:\.js|\.net)?)\s+(v\d+(?:\.\d+)*)/gi
  ];
  
  versionPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const skill = match[1];
      if (skill && skill.length > 2 && !isCommonWord(skill)) {
        additionalSkills.add(formatSkillName(skill));
      }
    }
  });
  
  // Pattern 3: Programming/technical terms with specific contexts
  const contextPatterns = [
    /\b(?:using|with|via|through|implementing|developing|building)\s+([A-Za-z][A-Za-z0-9]*(?:\.js|\.net|\+\+|#)?)/gi,
    /\b([A-Za-z][A-Za-z0-9]*(?:\.js|\.net|\+\+|#)?)\s+(?:development|programming|framework|library|database)/gi,
    /\b([A-Za-z][A-Za-z0-9]*(?:\.js|\.net|\+\+|#)?)\s+(?:developer|engineer|programmer|specialist)/gi
  ];
  
  contextPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const skill = match[1];
      if (skill && skill.length > 2 && !isCommonWord(skill)) {
        additionalSkills.add(formatSkillName(skill));
      }
    }
  });
  
  // Pattern 4: Capitalized technical terms (likely proper nouns/technologies)
  const capitalizedPattern = /\b([A-Z][a-z]*(?:[A-Z][a-z]*)*(?:\.js|\.net|\+\+|#)?)\b/g;
  let match;
  while ((match = capitalizedPattern.exec(originalText)) !== null) {
    const skill = match[1];
    if (skill.length > 2 && 
        !isCommonWord(skill.toLowerCase()) && 
        !isStopWord(skill.toLowerCase()) &&
        looksLikeTechnicalTerm(skill)) {
      additionalSkills.add(skill);
    }
  }
  
  // Filter out skills that are too generic or common
  const filteredSkills = Array.from(additionalSkills).filter(skill => {
    const skillLower = skill.toLowerCase();
    return skill.length > 1 && 
           skill.length < 50 && // Not too long
           !isCommonWord(skillLower) &&
           !isStopWord(skillLower) &&
           !skillLower.includes('•') && // Remove bullet points
           !skillLower.includes(':') && // Remove section headers
           !/^\d/.test(skill) && // Remove numbers
           !/years?|months?|experience|knowledge|familiarity|proficiency/i.test(skill) && // Remove experience descriptors
           !/(preferred|required|nice to have|skills?:|languages?:|frameworks?:)/i.test(skill); // Remove requirement indicators
  });
  
  return filteredSkills;
};

/**
 * Parse a comma/semicolon separated list of skills
 */
const parseSkillList = (text) => {
  if (!text) return [];
  
  return text
    .split(/[,;\n]/)  // Split by comma, semicolon, or newline
    .map(skill => skill.trim())
    .filter(skill => skill.length > 1)
    .map(skill => formatSkillName(skill))
    .filter(skill => !isCommonWord(skill.toLowerCase()));
};

/**
 * Format skill name consistently
 */
const formatSkillName = (skill) => {
  // Remove extra whitespace
  skill = skill.trim();
  
  // Handle special cases
  if (skill.toLowerCase() === 'js') return 'JavaScript';
  if (skill.toLowerCase() === 'ts') return 'TypeScript';
  if (skill.toLowerCase() === 'css') return 'CSS';
  if (skill.toLowerCase() === 'html') return 'HTML';
  
  // Capitalize properly for known patterns
  if (skill.match(/^[a-z]+\.js$/i)) {
    return skill.charAt(0).toUpperCase() + skill.slice(1);
  }
  
  return skill;
};

/**
 * Check if a term looks like a technical term
 */
const looksLikeTechnicalTerm = (term) => {
  // Check for common technical patterns
  return /^[A-Z][a-zA-Z]*$/.test(term) &&  // Starts with capital
         (term.length <= 15) &&              // Not too long
         !/(^The|^And|^Or|^But|^With|^For|^In|^On|^At|^To|^From|^By)$/i.test(term); // Not articles/prepositions
};

/**
 * Check if word is a common non-technical word
 */
const isCommonWord = (word) => {
  const commonWords = [
    // Articles, prepositions, conjunctions
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'among', 'within', 'without', 'under', 'over',
    // Pronouns
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
    // Common verbs
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'can', 'must', 'shall', 'am', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'get', 'got', 'give', 'gave', 'given', 'go', 'went', 'gone',
    'come', 'came', 'take', 'took', 'taken', 'make', 'made', 'see', 'saw', 'seen',
    'know', 'knew', 'known', 'think', 'thought', 'say', 'said', 'tell', 'told',
    // Work/business related but not technical skills
    'work', 'worked', 'working', 'experience', 'years', 'year', 'month', 'months',
    'day', 'days', 'time', 'times', 'project', 'projects', 'team', 'teams',
    'company', 'companies', 'business', 'management', 'manager', 'senior', 'junior',
    'lead', 'developer', 'engineer', 'analyst', 'coordinator', 'specialist',
    'responsible', 'duties', 'skills', 'skill', 'ability', 'abilities', 'knowledge',
    // Action verbs that are not skills
    'developed', 'implemented', 'built', 'used', 'applied', 'collaborated', 'designed',
    'created', 'managed', 'lead', 'worked', 'maintained', 'optimized',
    // General descriptors
    'strong', 'good', 'excellent', 'great', 'best', 'top', 'high', 'low',
    'nice', 'new', 'old', 'first', 'last', 'next', 'previous', 'current',
    'requirements', 'position', 'job', 'role', 'candidate', 'applicant',
    // Names and titles that commonly appear
    'john', 'doe', 'smith', 'johnson', 'software', 'full', 'stack', 'web',
    'tech', 'technology', 'computer', 'science', 'university', 'college'
  ];
  
  return commonWords.includes(word.toLowerCase());
};

/**
 * Check if word is a stop word that should be filtered out
 */
const isStopWord = (word) => {
  const stopWords = [
    'university', 'college', 'school', 'education', 'degree', 'bachelor',
    'master', 'doctorate', 'certificate', 'certification', 'training',
    'course', 'program', 'study', 'studies', 'major', 'minor', 'gpa',
    'email', 'phone', 'address', 'location', 'city', 'state', 'country',
    'resume', 'curriculum', 'vitae', 'portfolio', 'profile', 'summary',
    'objective', 'references', 'available', 'request', 'upon'
  ];
  
  return stopWords.includes(word.toLowerCase());
};

/**
 * Handle common skill variations and synonyms
 */
const handleSkillVariations = (text, skill, foundSkills) => {
  const skillLower = skill.toLowerCase();
  
  // Handle common synonyms and variations
  const variations = {
    'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'es2020'],
    'typescript': ['ts'],
    'css': ['css3', 'cascading style sheets'],
    'html': ['html5', 'hypertext markup language'],
    'node.js': ['nodejs', 'node js'],
    'react': ['reactjs', 'react.js'],
    'vue.js': ['vuejs', 'vue js'],
    'angular': ['angularjs'],
    'mongodb': ['mongo'],
    'postgresql': ['postgres'],
    'c++': ['cpp', 'c plus plus'],
    'c#': ['csharp', 'c sharp'],
    'rest api': ['restful api', 'rest', 'restful'],
    'machine learning': ['ml', 'artificial intelligence', 'ai'],
    'deep learning': ['dl', 'neural networks']
  };
  
  if (variations[skillLower]) {
    variations[skillLower].forEach(variation => {
      const variationRegex = new RegExp(`\\b${escapeRegex(variation)}\\b`, 'gi');
      if (variationRegex.test(text)) {
        foundSkills.add(skill);
      }
    });
  }
};

/**
 * Extract candidate information from resume text
 * @param {string} text - The resume text
 * @returns {object} - Object with name, email, phone
 */
export function extractCandidateInfo(text) {
  const info = {
    name: null,
    email: null,
    phone: null,
  };

  if (!text) return info;

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    info.email = emailMatch[0];
  }

  // Extract phone (various formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    info.phone = phoneMatch[0];
  }

  // Extract name (first line or first few words)
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Assume name is on first line and not too long
    if (firstLine.length < 50 && !emailRegex.test(firstLine)) {
      info.name = firstLine;
    }
  }

  return info;
}

export default {
  extractSkills,
  extractCandidateInfo,
  COMMON_SKILLS,
};
