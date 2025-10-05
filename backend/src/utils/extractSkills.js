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
 * Extract skills from text using keyword matching
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

  const uniqueSkills = Array.from(foundSkills);
  console.log('Extracted skills (', uniqueSkills.length, '):', uniqueSkills);
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
