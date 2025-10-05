import fs from 'fs';

/**
 * Robust PDF text extraction utility with multiple fallback methods
 * This replaces the problematic pdf-parse library that has test file issues
 */

/**
 * Clean extracted text to remove symbols, normalize whitespace, and fix common issues
 */
const cleanExtractedText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    // Remove PDF encoding artifacts and control characters
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
    // Remove excessive symbols and special characters but keep basic punctuation
    .replace(/[^\w\s.,;:()\-+#@/\\]/g, ' ')
    // Normalize multiple whitespace to single space
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim();
};

/**
 * Method 1: Try using pdf2json (already in package.json)
 */
const tryPdf2Json = async (buffer) => {
  try {
    // pdf2json is already in dependencies, use it as primary method
    const pdf2json = (await import('pdf2json')).default;
    
    return new Promise((resolve, reject) => {
      const pdfParser = new pdf2json();
      
      pdfParser.on('pdfParser_dataError', (errData) => {
        reject(new Error(`pdf2json error: ${errData.parserError}`));
      });
      
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        try {
          // Extract text from parsed data
          let text = '';
          if (pdfData.formImage && pdfData.formImage.Pages) {
            for (const page of pdfData.formImage.Pages) {
              if (page.Texts) {
                for (const textObj of page.Texts) {
                  if (textObj.R) {
                    for (const run of textObj.R) {
                      if (run.T) {
                        // Decode URI component and add space
                        text += decodeURIComponent(run.T) + ' ';
                      }
                    }
                  }
                }
              }
            }
          }
          resolve(text.trim());
        } catch (parseError) {
          reject(new Error(`pdf2json text extraction error: ${parseError.message}`));
        }
      });
      
      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    throw new Error(`pdf2json import error: ${error.message}`);
  }
};

/**
 * Method 2: Simple text extraction for basic PDFs
 */
const trySimpleTextExtraction = (buffer) => {
  try {
    // Convert buffer to string and look for readable text
    const text = buffer.toString('utf-8');
    
    // Remove control characters and non-printable characters
    const cleanText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ');
    
    // Check if we got meaningful text (more than just spaces and symbols)
    const meaningfulText = cleanText.replace(/[^\w\s]/g, '').trim();
    
    if (meaningfulText.length > 50) {
      return cleanText;
    }
    
    throw new Error('No meaningful text found in simple extraction');
  } catch (error) {
    throw new Error(`Simple extraction failed: ${error.message}`);
  }
};

/**
 * Method 3: Binary pattern matching for PDF text objects
 */
const tryBinaryPatternMatch = (buffer) => {
  try {
    const text = buffer.toString('binary');
    const textMatches = [];
    
    // Look for PDF text objects (simplified approach)
    // PDF text is usually between BT (Begin Text) and ET (End Text) operators
    const btPattern = /BT\s+(.*?)\s+ET/g;
    let match;
    
    while ((match = btPattern.exec(text)) !== null) {
      const textContent = match[1];
      
      // Extract text from Tj or TJ operators
      const tjPattern = /\((.*?)\)\s*(?:Tj|TJ)/g;
      let tjMatch;
      
      while ((tjMatch = tjPattern.exec(textContent)) !== null) {
        const extractedText = tjMatch[1];
        if (extractedText && extractedText.trim().length > 0) {
          textMatches.push(extractedText);
        }
      }
    }
    
    const extractedText = textMatches.join(' ').trim();
    
    if (extractedText.length > 20) {
      return extractedText;
    }
    
    throw new Error('No text found in binary pattern matching');
  } catch (error) {
    throw new Error(`Binary pattern matching failed: ${error.message}`);
  }
};

/**
 * Main PDF parsing function with multiple fallback methods
 */
export const parsePDF = async (filePath) => {
  try {
    console.log(`Parsing PDF: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const buffer = fs.readFileSync(filePath);
    
    // Try methods in order of reliability
    const methods = [
      { name: 'pdf2json', func: tryPdf2Json },
      { name: 'binary pattern matching', func: tryBinaryPatternMatch },
      { name: 'simple text extraction', func: trySimpleTextExtraction }
    ];
    
    for (const method of methods) {
      try {
        console.log(`Trying PDF parsing method: ${method.name}`);
        const result = await method.func(buffer);
        
        if (result && result.trim().length > 0) {
          // Clean the extracted text
          const cleanedText = cleanExtractedText(result);
          console.log(`Successfully parsed PDF using ${method.name}, extracted ${cleanedText.length} characters`);
          return cleanedText;
        }
      } catch (methodError) {
        console.log(`${method.name} failed:`, methodError.message);
      }
    }
    
    throw new Error('All PDF parsing methods failed');
    
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Parse any file type (PDF, DOCX, or plain text)
 */
export const parseFile = async (file) => {
  try {
    console.log('Parsing file:', file.path, 'Type:', file.mimetype);
    
    if (!fs.existsSync(file.path)) {
      throw new Error(`File not found: ${file.path}`);
    }

    if (file.mimetype === 'application/pdf') {
      const pdfText = await parsePDF(file.path);
      return cleanExtractedText(pdfText);
    } else if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword'
    ) {
      // For DOCX/DOC, read as text (basic extraction)
      // In production, you might want to use mammoth or docx-parser
      const buffer = fs.readFileSync(file.path);
      const rawText = buffer.toString('utf-8');
      return cleanExtractedText(rawText);
    } else {
      // Plain text or other formats
      const buffer = fs.readFileSync(file.path);
      const rawText = buffer.toString('utf-8');
      return cleanExtractedText(rawText);
    }
  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error(`Failed to parse file: ${error.message}`);
  }
};

export default { parsePDF, parseFile };